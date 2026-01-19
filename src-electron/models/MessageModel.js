const { get, query, run } = require('../db');

class MessageModel {
    /**
     * Gets all conversations for a user.
     */
    static async getConversations(userId) {
        // Find conversations where user is a participant
        // Using LIKE with delimiters for safety or JSON_EACH if available (SQLite 3.38+)
        // For simplicity and compatibility, we'll use a broad LIKE and then filter in JS if needed
        const conversations = await query(`
            SELECT c.*, 
                   (SELECT text FROM messages WHERE conversation_id = c.id ORDER BY timestamp DESC LIMIT 1) as last_message,
                   (SELECT sender_name FROM messages WHERE conversation_id = c.id ORDER BY timestamp DESC LIMIT 1) as last_sender
            FROM conversations c
            WHERE c.participant_ids LIKE ?
            ORDER BY c.last_message_at DESC
        `, [`%${userId}%`]);
        
        return conversations.map(c => ({
            ...c,
            participants: JSON.parse(c.participant_ids || '[]'),
            lastMessage: c.last_message,
            lastSender: c.last_sender
        }));
    }

    /**
     * Gets all messages in a conversation.
     */
    static async getMessages(conversationId) {
        return await query(`
            SELECT * FROM messages 
            WHERE conversation_id = ? 
            ORDER BY timestamp ASC
        `, [conversationId]);
    }

    /**
     * Sends a message. If conversationId is null, creates a new conversation.
     */
    static async sendMessage(data) {
        let { conversationId, senderId, senderName, text, type = 'text', attachment = null, recipientId = null } = data;

        if (!conversationId && recipientId) {
            // Find existing conversation between these two
            const existing = await get(`
                SELECT id FROM conversations 
                WHERE participant_ids LIKE ? AND participant_ids LIKE ?
            `, [`%${senderId}%`, `%${recipientId}%`]);

            if (existing) {
                conversationId = existing.id;
            } else {
                // Create new conversation
                const title = `Conversation with ${recipientId}`; // Could be refined
                const participantIds = JSON.stringify([senderId, recipientId]);
                const convResult = await run(
                    'INSERT INTO conversations (title, participant_ids) VALUES (?, ?)',
                    [title, participantIds]
                );
                conversationId = convResult.lastID;
            }
        }

        const msgResult = await run(`
            INSERT INTO messages (conversation_id, sender_id, sender_name, text, type, attachment_url)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [conversationId, senderId, senderName, text, type, attachment ? attachment.url : null]);

        // Update last_message_at
        await run('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?', [conversationId]);

        return await get('SELECT * FROM messages WHERE id = ?', [msgResult.lastID]);
    }

    /**
     * Mark messages as read.
     */
    static async markAsRead(conversationId, userId) {
        return await run('UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id != ?', [conversationId, userId]);
    }
}

module.exports = MessageModel;
