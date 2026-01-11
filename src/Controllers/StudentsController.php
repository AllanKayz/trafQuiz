<?php

namespace TrafQuiz\Controllers;

use TrafQuiz\Core\Database;
use TrafQuiz\Models\User;

class StudentsController
{
    /**
     * Get student progress including exam history and scores
     * GET /api/students/progress?id={studentId}
     */
    public function getProgress()
    {
        header('Content-Type: application/json');

        $studentId = $_GET['id'] ?? null;

        if (!$studentId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Student ID is required']);
            return;
        }

        try {
            $db = new Database();
            $conn = $db->getConnection();

            // Get student exam history with scores
            $sql = "SELECT 
                        se.id,
                        se.exam_id,
                        e.name as exam_name,
                        se.score,
                        se.completed_at,
                        (SELECT COUNT(*) FROM questions WHERE exam_id = e.id) as total_questions
                    FROM student_exams se
                    JOIN exams e ON se.exam_id = e.id
                    WHERE se.student_id = :student_id
                    ORDER BY se.completed_at DESC";

            $stmt = $conn->prepare($sql);
            $stmt->execute([':student_id' => $studentId]);
            $exams = $stmt->fetchAll(\PDO::FETCH_ASSOC);

            // Calculate statistics
            $totalExams = count($exams);
            $totalScore = array_sum(array_column($exams, 'score'));
            $averageScore = $totalExams > 0 ? round($totalScore / $totalExams, 2) : 0;

            // Get recent activity (last 5 exams)
            $recentExams = array_slice($exams, 0, 5);

            echo json_encode([
                'success' => true,
                'data' => [
                    'examsTaken' => $totalExams,
                    'averageScore' => $averageScore,
                    'totalScore' => $totalScore,
                    'recentExams' => $recentExams,
                    'examHistory' => $exams
                ]
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to fetch progress: ' . $e->getMessage()]);
        }
    }

    /**
     * Get student transactions/payment history
     * GET /api/students/transactions?id={studentId}
     */
    public function getTransactions()
    {
        header('Content-Type: application/json');

        $studentId = $_GET['id'] ?? null;

        if (!$studentId) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Student ID is required']);
            return;
        }

        try {
            $db = new Database();
            $conn = $db->getConnection();

            $sql = "SELECT 
                        p.id,
                        p.amount,
                        p.payment_date,
                        p.transaction_id,
                        p.status,
                        p.method,
                        pkg.package as package_name
                    FROM payments p
                    LEFT JOIN packages pkg ON p.package_id = pkg.id
                    WHERE p.student_id = :student_id
                    ORDER BY p.payment_date DESC";

            $stmt = $conn->prepare($sql);
            $stmt->execute([':student_id' => $studentId]);
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
     * Delete student account
     * POST /api/account/delete
     */
    public function deleteAccount()
    {
        header('Content-Type: application/json');

        $data = json_decode(file_get_contents("php://input"), true);

        $userId = $data['userId'] ?? null;
        $password = $data['password'] ?? null;

        if (!$userId || !$password) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'User ID and password are required']);
            return;
        }

        try {
            $db = new Database();
            $conn = $db->getConnection();

            // Verify password first
            $stmt = $conn->prepare("SELECT password FROM users WHERE id = :id");
            $stmt->execute([':id' => $userId]);
            $user = $stmt->fetch(\PDO::FETCH_ASSOC);

            if (!$user || !password_verify($password, $user['password'])) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Invalid password']);
                return;
            }

            // Delete user (cascades will handle related records)
            $stmt = $conn->prepare("DELETE FROM users WHERE id = :id");
            $stmt->execute([':id' => $userId]);

            echo json_encode([
                'success' => true,
                'message' => 'Account deleted successfully'
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to delete account: ' . $e->getMessage()]);
        }
    }
}
