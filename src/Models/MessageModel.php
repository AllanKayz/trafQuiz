<?php

namespace TrafQuiz\Models;

use TrafQuiz\Core\Database;

class MessageModel {
    public static function getConversations($userId) {
        $db = new Database();
        $conn = $db->getConnection();
        
        // Find conversations where user is a participant
        // Using JSON_CONTAINS to check participant_ids
        $sql = "SELECT * FROM conversations WHERE JSON_CONTAINS(participant_ids, :uid) ORDER BY last_message_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->execute([':uid' => json_encode($userId)]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public static function getMessages($conversationId) {
        $db = new Database();
        $conn = $db->getConnection();
        
        $sql = "SELECT * FROM messages WHERE conversation_id = :cid ORDER BY timestamp ASC";
        $stmt = $conn->prepare($sql);
        $stmt->execute([':cid' => $conversationId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public static function sendMessage($conversationId, $senderId, $senderName, $text) {
        $db = new Database();
        $conn = $db->getConnection();
        
        $conn->beginTransaction();
        try {
            // 1. Insert message
            $sql = "INSERT INTO messages (conversation_id, sender_id, sender_name, text, timestamp) 
                    VALUES (:cid, :sid, :sname, :txt, NOW())";
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                ':cid' => $conversationId,
                ':sid' => $senderId,
                ':sname' => $senderName,
                ':txt' => $text
            ]);
            
            // 2. Update conversation last_message_at
            $sqlUpd = "UPDATE conversations SET last_message_at = NOW() WHERE id = :cid";
            $stmtUpd = $conn->prepare($sqlUpd);
            $stmtUpd->execute([':cid' => $conversationId]);
            
            $conn->commit();
            return true;
        } catch (\Exception $e) {
            $conn->rollBack();
            throw $e;
        }
    }

    public static function startConversation($participantIds, $title = null) {
        $db = new Database();
        $conn = $db->getConnection();
        
        $sql = "INSERT INTO conversations (participant_ids, title, last_message_at) VALUES (:pids, :title, NOW())";
        $stmt = $conn->prepare($sql);
        $stmt->execute([
            ':pids' => json_encode($participantIds),
            ':title' => $title
        ]);
        
        return $conn->lastInsertId();
    }
}
