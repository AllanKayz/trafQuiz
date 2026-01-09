<?php

namespace TrafQuiz\Controllers;

use TrafQuiz\Models\LessonModel;
use TrafQuiz\Core\Database;

class PaymentsController {
    public function process() {
        header('Content-Type: application/json');
        
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        
        $studentId = $input['studentId'] ?? null;
        $amount = $input['amount'] ?? null;
        $packageId = $input['packageId'] ?? null;
        $method = $input['method'] ?? 'card';
        $transactionId = $input['transactionId'] ?? ('TXN-' . strtoupper(uniqid()));

        if (!$studentId || !$amount) {
            http_response_code(400);
            echo json_encode(['message' => 'Missing required payment data']);
            return;
        }

        try {
            $db = new Database();
            $conn = $db->getConnection();
            
            $sql = "INSERT INTO payments (student_id, amount, transaction_id, package_id, method, status, payment_date) 
                    VALUES (:sid, :amt, :txid, :pid, :meth, 'completed', NOW())";
            
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                ':sid' => $studentId,
                ':amt' => $amount,
                ':txid' => $transactionId,
                ':pid' => $packageId,
                ':meth' => $method
            ]);

            echo json_encode([
                'success' => true,
                'transactionId' => $transactionId,
                'message' => 'Payment processed and recorded successfully'
            ]);

        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Payment recording failed: ' . $e->getMessage()]);
        }
    }
}
