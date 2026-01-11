<?php

namespace TrafQuiz\Controllers;

use TrafQuiz\Core\Database;

class FinancesController
{
    /**
     * Get all transactions or user-specific transactions with searching
     */
    public function getTransactions()
    {
        header('Content-Type: application/json');

        $userId = $_GET['userId'] ?? null;
        $query = $_GET['query'] ?? null;

        try {
            $db = new Database();
            $conn = $db->getConnection();

            $sql = "SELECT 
                        p.id,
                        p.amount,
                        p.payment_date as date,
                        p.type,
                        p.category,
                        p.transaction_id,
                        p.status,
                        p.method,
                        p.notes,
                        COALESCE(pkg.package, p.category) as description,
                        CASE 
                            WHEN p.student_id IS NOT NULL THEN CONCAT(us.first_name, ' ', us.last_name)
                            WHEN p.instructor_id IS NOT NULL THEN CONCAT(ui.first_name, ' ', ui.last_name)
                            WHEN p.vehicle_id IS NOT NULL THEN CONCAT(v.make, ' ', v.model, ' (', v.registration, ')')
                            ELSE 'Company'
                        END as entity_name,
                        v.registration as vehicle_reg
                    FROM payments p
                    LEFT JOIN students s ON p.student_id = s.id
                    LEFT JOIN users us ON s.user_id = us.id
                    LEFT JOIN instructors i ON p.instructor_id = i.id
                    LEFT JOIN users ui ON i.user_id = ui.id
                    LEFT JOIN vehicles v ON p.vehicle_id = v.id
                    LEFT JOIN packages pkg ON p.package_id = pkg.id";

            $params = [];
            $whereClauses = [];

            if ($userId) {
                $whereClauses[] = "s.user_id = :user_id";
                $params[':user_id'] = $userId;
            }

            if ($query) {
                $whereClauses[] = "(p.transaction_id LIKE :query 
                                   OR us.first_name LIKE :query 
                                   OR us.last_name LIKE :query 
                                   OR ui.first_name LIKE :query 
                                   OR ui.last_name LIKE :query 
                                   OR v.registration LIKE :query 
                                   OR v.make LIKE :query 
                                   OR v.model LIKE :query
                                   OR p.notes LIKE :query)";
                $params[':query'] = "%$query%";
            }

            if (!empty($whereClauses)) {
                $sql .= " WHERE " . implode(" AND ", $whereClauses);
            }

            $sql .= " ORDER BY p.payment_date DESC";

            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            $transactions = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'data' => $transactions
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to fetch transactions: ' . $e->getMessage()]);
        }
    }

    /**
     * Get financial statistics (admin only)
     */
    public function getStatistics()
    {
        header('Content-Type: application/json');

        try {
            $db = new Database();
            $conn = $db->getConnection();

            // Overview stats
            $sql = "SELECT 
                        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
                        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
                        COUNT(*) as total_transactions
                    FROM payments 
                    WHERE status = 'completed'";

            $stmt = $conn->query($sql);
            $overview = $stmt->fetch(\PDO::FETCH_ASSOC);
            $overview['total_income'] = (float)($overview['total_income'] ?? 0);
            $overview['total_expenses'] = (float)($overview['total_expenses'] ?? 0);
            $overview['net_profit'] = $overview['total_income'] - $overview['total_expenses'];

            // Monthly data (last 6 months)
            $sql = "SELECT 
                        DATE_FORMAT(payment_date, '%Y-%m') as month,
                        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
                        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
                    FROM payments 
                    WHERE status = 'completed' 
                        AND payment_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
                    GROUP BY DATE_FORMAT(payment_date, '%Y-%m')
                    ORDER BY month DESC";

            $stmt = $conn->query($sql);
            $monthlyStats = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Expense breakdown by category
            $sql = "SELECT 
                        category,
                        SUM(amount) as total
                    FROM payments 
                    WHERE type = 'expense' AND status = 'completed'
                    GROUP BY category";
            $stmt = $conn->query($sql);
            $categoriesBreakdown = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            echo json_encode([
                'success' => true,
                'data' => [
                    'overview' => $overview,
                    'monthlyStats' => $monthlyStats,
                    'categoriesBreakdown' => $categoriesBreakdown
                ]
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to fetch statistics: ' . $e->getMessage()]);
        }
    }

    /**
     * Process instructor salary
     */
    public function processSalary()
    {
        header('Content-Type: application/json');
        $input = json_decode(file_get_contents('php://input'), true);

        $instructorId = $input['instructorId'] ?? null;
        $amount = $input['amount'] ?? 0;
        $method = $input['method'] ?? 'cash';
        $notes = $input['notes'] ?? '';

        if (!$instructorId || $amount <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid instructor or amount']);
            return;
        }

        try {
            $db = new Database();
            $conn = $db->getConnection();
            $txnId = 'SAL-' . strtoupper(uniqid());

            $sql = "INSERT INTO payments (instructor_id, amount, type, category, method, transaction_id, notes, status, payment_date) 
                    VALUES (:iid, :amt, 'expense', 'salary', :meth, :txid, :notes, 'completed', NOW())";

            $stmt = $conn->prepare($sql);
            $stmt->execute([
                ':iid' => $instructorId,
                ':amt' => $amount,
                ':meth' => $method,
                ':txid' => $txnId,
                ':notes' => $notes
            ]);

            echo json_encode(['success' => true, 'message' => 'Salary processed successfully', 'transactionId' => $txnId]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Salary processing failed: ' . $e->getMessage()]);
        }
    }

    /**
     * Record an expense (Vehicle, T&C, Fuel, etc.)
     */
    public function recordExpense()
    {
        header('Content-Type: application/json');
        $input = json_decode(file_get_contents('php://input'), true);

        $category = $input['category'] ?? 'other';
        $amount = $input['amount'] ?? 0;
        $vehicleId = $input['vehicleId'] ?? null;
        $instructorId = $input['instructorId'] ?? null;
        $method = $input['method'] ?? 'cash';
        $notes = $input['notes'] ?? '';

        if ($amount <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid amount']);
            return;
        }

        try {
            $db = new Database();
            $conn = $db->getConnection();
            $txnId = 'EXP-' . strtoupper(uniqid());

            $sql = "INSERT INTO payments (amount, type, category, vehicle_id, instructor_id, method, transaction_id, notes, status, payment_date) 
                    VALUES (:amt, 'expense', :cat, :vid, :iid, :meth, :txid, :notes, 'completed', NOW())";

            $stmt = $conn->prepare($sql);
            $stmt->execute([
                ':amt' => $amount,
                ':cat' => $category,
                ':vid' => $vehicleId,
                ':iid' => $instructorId,
                ':meth' => $method,
                ':txid' => $txnId,
                ':notes' => $notes
            ]);

            echo json_encode(['success' => true, 'message' => 'Expense recorded successfully', 'transactionId' => $txnId]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Expense recording failed: ' . $e->getMessage()]);
        }
    }
}
