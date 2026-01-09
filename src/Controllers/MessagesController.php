<?php

namespace TrafQuiz\Controllers;

use TrafQuiz\Models\MessageModel;

class MessagesController {
    public function getConversations() {
        header('Content-Type: application/json');
        $userId = $_GET['userId'] ?? null;
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['message' => 'Missing userId']);
            return;
        }
        $conversations = MessageModel::getConversations((int)$userId);
        echo json_encode($conversations);
    }

    public function getMessages() {
        header('Content-Type: application/json');
        $conversationId = $_GET['conversationId'] ?? null;
        if (!$conversationId) {
            http_response_code(400);
            echo json_encode(['message' => 'Missing conversationId']);
            return;
        }
        $messages = MessageModel::getMessages((int)$conversationId);
        echo json_encode($messages);
    }

    public function sendMessage() {
        header('Content-Type: application/json');
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        
        $conversationId = $input['conversationId'] ?? null;
        $senderId = $input['senderId'] ?? null;
        $senderName = $input['senderName'] ?? null;
        $text = $input['text'] ?? null;
        $participantIds = $input['participantIds'] ?? null; // For starting new conversation

        try {
            if (!$conversationId && $participantIds) {
                // Start a new conversation if it doesn't exist
                $conversationId = MessageModel::startConversation($participantIds, $input['title'] ?? null);
            }

            if (!$conversationId || !$senderId || !$text) {
                http_response_code(400);
                echo json_encode(['message' => 'Missing required message fields']);
                return;
            }

            MessageModel::sendMessage((int)$conversationId, (int)$senderId, $senderName, $text);
            echo json_encode(['success' => true, 'conversationId' => $conversationId]);

        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to send message: ' . $e->getMessage()]);
        }
    }
}
