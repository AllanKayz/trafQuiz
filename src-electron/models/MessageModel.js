const { Conversation, ConversationParticipant, Message } = require('./MessagingModels');
const { User } = require('./UserModel');
const { sequelize } = require('../database');
const { Op } = require('sequelize');

class MessageModel {
    static async getConversations(userId) {
        // Find conversations where user is a participant
        const participants = await ConversationParticipant.findAll({
            where: { user_id: userId },
            include: [{
                model: Conversation,
                include: [
                    {
                        model: ConversationParticipant,
                        include: [{ model: User, attributes: ['id', 'first_name', 'last_name', 'username', 'role'] }]
                    },
                    {
                        model: Message,
                        limit: 1,
                        order: [['timestamp', 'DESC']]
                    }
                ]
            }]
        });

        return participants.map(p => {
            const conv = p.Conversation;
            const otherParticipants = conv.ConversationParticipants.filter(cp => cp.user_id !== userId);
            const partner = otherParticipants[0]?.User;
            const lastMsg = conv.Messages[0];

            return {
                id: conv.id,
                title: conv.title,
                name: partner ? `${partner.first_name} ${partner.last_name}` : conv.title,
                partnerId: partner?.id,
                lastMessage: lastMsg?.text,
                lastSender: lastMsg?.sender_name,
                last_message_at: conv.last_message_at,
                unread: 0, // Placeholder
                participants: conv.ConversationParticipants.map(cp => cp.user_id)
            };
        });
    }

    static async getMessages(conversationId) {
        return await Message.findAll({
            where: { conversation_id: conversationId },
            order: [['timestamp', 'ASC']],
            raw: true
        });
    }

    static async sendMessage(data) {
        let { conversationId, senderId, senderName, text, type = 'text', attachment = null, recipientId = null } = data;

        const transaction = await sequelize.transaction();
        try {
            if (!conversationId && recipientId) {
                // Find existing private conversation
                const existing = await Conversation.findOne({
                    include: [
                        { model: ConversationParticipant, where: { user_id: senderId } },
                        { model: ConversationParticipant, where: { user_id: recipientId } }
                    ],
                    group: ['Conversation.id'],
                    having: sequelize.literal('count(ConversationParticipants.id) = 2')
                });

                if (existing) {
                    conversationId = existing.id;
                } else {
                    const conv = await Conversation.create({ title: `Chat between ${senderId} and ${recipientId}` }, { transaction });
                    await ConversationParticipant.bulkCreate([
                        { conversation_id: conv.id, user_id: senderId },
                        { conversation_id: conv.id, user_id: recipientId }
                    ], { transaction });
                    conversationId = conv.id;
                }
            }

            const message = await Message.create({
                conversation_id: conversationId,
                sender_id: senderId,
                sender_name: senderName,
                text: text,
                type: type,
                attachment_url: attachment?.url,
                attachment_name: attachment?.name,
                attachment_type: attachment?.type
            }, { transaction });

            await Conversation.update(
                { last_message_at: sequelize.literal('CURRENT_TIMESTAMP') },
                { where: { id: conversationId }, transaction }
            );

            await transaction.commit();
            return message.get({ plain: true });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async markAsRead(conversationId, userId) {
        return await Message.update(
            { is_read: 1 },
            { where: { conversation_id: conversationId, sender_id: { [Op.ne]: userId } } }
        );
    }
}

module.exports = MessageModel;
