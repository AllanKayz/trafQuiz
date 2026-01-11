<?php

namespace TrafQuiz\Controllers;

use TrafQuiz\Models\MessageModel;
use TrafQuiz\Core\TokenHandler;
use TrafQuiz\Core\Database;

class MessagesController
{



    private function validateAuth()
    {
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        if (strpos($authHeader, 'Bearer ') === 0) {
            $token = substr($authHeader, 7);
            $handler = new TokenHandler();
            $payload = $handler->validateToken($token);
            if ($payload) return $payload;
        }

        // Bypassing authorization: allow impersonating a user for development
        $impersonatedId = $headers['X-User-Id'] ?? $_GET['userId'] ?? $_POST['userId'] ?? 1;

        $db = new Database();
        $conn = $db->getConnection();
        $stmt = $conn->prepare("SELECT id, first_name, last_name, role, email FROM users WHERE id = :id");
        $stmt->execute([':id' => $impersonatedId]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);

        if ($user) {
            return [
                'userId' => (int)$user['id'],
                'id' => (int)$user['id'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'role' => $user['role'],
                'email' => $user['email']
            ];
        }

        return [
            'userId' => 1,
            'id' => 1,
            'first_name' => 'Demo',
            'last_name' => 'User',
            'role' => 'admin',
            'email' => 'admin@trafquiz.com'
        ];
    }

    public function getConversations()
    {
        header('Content-Type: application/json');

        $payload = $this->validateAuth();
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['message' => 'Unauthorized']);
            return;
        }

        $userId = $payload['userId'] ?? $payload['id'] ?? null;
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['message' => 'Missing userId in token']);
            return;
        }

        $conversations = MessageModel::getConversations((int)$userId);

        // Enrich conversations with partner info
        $db = new Database();
        $conn = $db->getConnection();

        foreach ($conversations as &$conv) {
            $pids = json_decode($conv['participant_ids'], true);
            $partnerId = null;
            foreach ($pids as $pid) {
                if ($pid != $userId) {
                    $partnerId = $pid;
                    break;
                }
            }

            if ($partnerId) {
                $conv['partnerId'] = $partnerId;
                $stmt = $conn->prepare("SELECT id, first_name, last_name, role FROM users WHERE id = :pid");
                $stmt->execute([':pid' => $partnerId]);
                $partner = $stmt->fetch(\PDO::FETCH_ASSOC);
                if ($partner) {
                    $conv['name'] = trim($partner['first_name'] . ' ' . $partner['last_name']);
                    $conv['role'] = $partner['role'];
                }
            }

            // Get last message info
            $stmtMsg = $conn->prepare("SELECT text, timestamp, type FROM messages WHERE conversation_id = :cid ORDER BY timestamp DESC LIMIT 1");
            $stmtMsg->execute([':cid' => $conv['id']]);
            $last = $stmtMsg->fetch(\PDO::FETCH_ASSOC);
            if ($last) {
                $conv['lastMessage'] = ($last['type'] === 'text') ? $last['text'] : '[' . ucfirst($last['type']) . ']';
                $conv['lastTime'] = $last['timestamp'];
            }

            // Unread count
            $stmtUnread = $conn->prepare("SELECT COUNT(*) as unread FROM messages WHERE conversation_id = :cid AND sender_id != :uid AND is_read = 0");
            $stmtUnread->execute([':cid' => $conv['id'], ':uid' => $userId]);
            $conv['unread'] = (int)$stmtUnread->fetch(\PDO::FETCH_ASSOC)['unread'];
        }

        echo json_encode($conversations);
    }

    public function getMessages()
    {
        header('Content-Type: application/json');

        $payload = $this->validateAuth();
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['message' => 'Unauthorized']);
            return;
        }

        $userId = $payload['userId'] ?? $payload['id'] ?? null;
        $conversationId = $_GET['conversationId'] ?? null;
        if (!$conversationId) {
            http_response_code(400);
            echo json_encode(['message' => 'Missing conversationId']);
            return;
        }

        // Access Control
        $db = new Database();
        $conn = $db->getConnection();
        $stmt = $conn->prepare("SELECT id FROM conversations WHERE id = :cid AND JSON_CONTAINS(participant_ids, :uid)");
        $stmt->execute([':cid' => $conversationId, ':uid' => json_encode($userId)]);

        if ($stmt->rowCount() === 0) {
            http_response_code(403);
            echo json_encode(['message' => 'Access Denied']);
            return;
        }

        // Mark as read
        $stmtRead = $conn->prepare("UPDATE messages SET is_read = 1 WHERE conversation_id = :cid AND sender_id != :uid");
        $stmtRead->execute([':cid' => $conversationId, ':uid' => $userId]);

        $messages = MessageModel::getMessages((int)$conversationId);

        // Add "outgoing" flag for frontend
        foreach ($messages as &$m) {
            $m['outgoing'] = ($m['sender_id'] == $userId);
        }

        echo json_encode($messages);
    }

    public function sendMessage()
    {
        header('Content-Type: application/json');

        $payload = $this->validateAuth();
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['message' => 'Unauthorized']);
            return;
        }

        $userId = $payload['userId'] ?? $payload['id'] ?? null;
        $userName = trim(($payload['first_name'] ?? 'User') . ' ' . ($payload['last_name'] ?? ''));

        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;

        $conversationId = $input['conversationId'] ?? null;
        $text = $input['text'] ?? '';
        $type = $input['type'] ?? 'text';
        $attachment = $input['attachment'] ?? [];
        $recipientId = $input['recipientId'] ?? null;

        try {
            if (!$conversationId && $recipientId) {
                // New conversation between $userId and $recipientId
                // First check if one already exists
                $db = new Database();
                $conn = $db->getConnection();
                $stmtCheck = $conn->prepare("SELECT id FROM conversations WHERE JSON_CONTAINS(participant_ids, :uid) AND JSON_CONTAINS(participant_ids, :rid)");
                $stmtCheck->execute([':uid' => json_encode($userId), ':rid' => json_encode((int)$recipientId)]);
                $existing = $stmtCheck->fetch(\PDO::FETCH_ASSOC);

                if ($existing) {
                    $conversationId = $existing['id'];
                } else {
                    $conversationId = MessageModel::startConversation([$userId, (int)$recipientId]);
                }
            }

            if (!$conversationId) {
                http_response_code(400);
                echo json_encode(['message' => 'Missing conversation reference']);
                return;
            }

            MessageModel::sendMessage((int)$conversationId, (int)$userId, $userName, $text, $type, $attachment);
            echo json_encode(['success' => true, 'conversationId' => $conversationId]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['message' => $e->getMessage()]);
        }
    }

    public function uploadAttachment()
    {
        header('Content-Type: application/json');

        $payload = $this->validateAuth();
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['message' => 'Unauthorized']);
            return;
        }

        if (empty($_FILES['file'])) {
            http_response_code(400);
            echo json_encode(['message' => 'No file uploaded']);
            return;
        }

        $file = $_FILES['file'];
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('msg_') . '.' . $ext;
        $uploadDir = __DIR__ . '/../../public/uploads/messages/';

        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        if (move_uploaded_file($file['tmp_name'], $uploadDir . $filename)) {
            $url = 'uploads/messages/' . $filename;
            echo json_encode([
                'success' => true,
                'url' => $url,
                'name' => $file['name'],
                'type' => $file['type']
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to move uploaded file']);
        }
    }

    public function getRecipientInfo()
    {
        header('Content-Type: application/json');

        $payload = $this->validateAuth();
        if (!$payload) {
            http_response_code(401);
            echo json_encode(['message' => 'Unauthorized']);
            return;
        }

        $recipientId = $_GET['id'] ?? null;
        if (!$recipientId) {
            http_response_code(400);
            echo json_encode(['message' => 'Missing recipient ID']);
            return;
        }

        $db = new Database();
        $conn = $db->getConnection();
        $stmt = $conn->prepare("SELECT id, username, first_name, last_name, email, role, phone FROM users WHERE id = :id");
        $stmt->execute([':id' => $recipientId]);
        $user = $stmt->fetch(\PDO::FETCH_ASSOC);

        if ($user) {
            echo json_encode($user);
        } else {
            http_response_code(404);
            echo json_encode(['message' => 'User not found']);
        }
    }
}
