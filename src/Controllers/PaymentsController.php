<?php

namespace TrafQuiz\Controllers;

use TrafQuiz\Models\LessonModel;
use TrafQuiz\Models\Dashboard;
use TrafQuiz\Core\Database;

class PaymentsController
{
    public function process()
    {
        header('Content-Type: application/json');

        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

        $studentId = $input['studentId'] ?? null;
        $userId = $input['userId'] ?? null;
        $amount = $input['amount'] ?? null;
        $packageId = $input['packageId'] ?? null;
        $method = $input['method'] ?? 'card';
        $transactionId = $input['transactionId'] ?? ('TXN-' . strtoupper(uniqid()));
        $isNewStudent = $input['isNewStudent'] ?? false;

        // Handle New Student Enrollment
        if ($isNewStudent) {
            try {
                $username = $input['username'] ?? '';
                $password = password_hash($input['password'] ?? 'Student123!', PASSWORD_DEFAULT);
                $firstName = $input['firstName'] ?? '';
                $lastName = $input['lastName'] ?? '';
                $email = $input['email'] ?? '';
                $phone = $input['phone'] ?? '';
                $address = $input['address'] ?? '';
                $role = 'student';

                // 1. Add User
                $newUserId = Dashboard::addUser($username, $password, $role, $firstName, $lastName, $email, $phone);
                
                if (!$newUserId) {
                    throw new \Exception("Failed to create user account.");
                }

                // 2. Add Student
                $fullName = trim($firstName . ' ' . $lastName);
                $res = Dashboard::addStudent($fullName, $email, $phone, $address, 'active', $newUserId, $packageId);
                
                if (!$res['success']) {
                    // Cleanup user if student entry fails
                    Dashboard::deleteUser($newUserId);
                    throw new \Exception("Failed to create student profile: " . $res['message']);
                }

                // 3. Resolve studentId
                $db = new Database();
                $conn = $db->getConnection();
                $stmt = $conn->prepare("SELECT id FROM students WHERE user_id = :uid");
                $stmt->execute([':uid' => $newUserId]);
                $student = $stmt->fetch(\PDO::FETCH_ASSOC);
                if ($student) {
                    $studentId = $student['id'];
                } else {
                    throw new \Exception("Failed to resolve new student ID.");
                }
            } catch (\Exception $e) {
                http_response_code(500);
                echo json_encode(['message' => 'New student enrollment failed: ' . $e->getMessage()]);
                return;
            }
        } else if (!$studentId && $userId) {
            // Resolve studentId from userId for existing student
            $db = new Database();
            $conn = $db->getConnection();
            $stmt = $conn->prepare("SELECT id FROM students WHERE user_id = :uid");
            $stmt->execute([':uid' => $userId]);
            $student = $stmt->fetch(\PDO::FETCH_ASSOC);
            if ($student) {
                $studentId = $student['id'];
            }
        }

        if (!$studentId || !$amount) {
            http_response_code(400);
            echo json_encode(['message' => 'Missing valid student identification (userId or studentId) or amount']);
            return;
        }

        $status = $input['status'] ?? 'pending';

        try {
            $db = new Database();
            $conn = $db->getConnection();

            $sql = "INSERT INTO payments (student_id, amount, transaction_id, package_id, method, status, payment_date) 
                    VALUES (:sid, :amt, :txid, :pid, :meth, :stat, NOW())";

            $stmt = $conn->prepare($sql);
            $stmt->execute([
                ':sid' => $studentId,
                ':amt' => $amount,
                ':txid' => $transactionId,
                ':pid' => $packageId,
                ':meth' => $method,
                ':stat' => $status
            ]);

            echo json_encode([
                'success' => true,
                'transactionId' => $transactionId,
                'studentId' => $studentId,
                'message' => 'Payment processed and recorded successfully' . ($isNewStudent ? ' (New student enrolled)' : '')
            ]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Payment recording failed: ' . $e->getMessage()]);
        }
    }

    public function approve()
    {
        header('Content-Type: application/json');
        $input = json_decode(file_get_contents('php://input'), true);

        $id = $input['id'] ?? null;
        $status = $input['status'] ?? 'completed';

        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Missing payment ID']);
            return;
        }

        try {
            $db = new Database();
            $conn = $db->getConnection();

            $sql = "UPDATE payments SET status = :status WHERE id = :id";
            $stmt = $conn->prepare($sql);
            $stmt->execute([':status' => $status, ':id' => $id]);

            echo json_encode(['success' => true, 'message' => 'Payment status updated to ' . $status]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update payment: ' . $e->getMessage()]);
        }
    }
}
