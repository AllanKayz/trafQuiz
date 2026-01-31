const { sequelize } = require('../database');
const { DataTypes, Model } = require('sequelize');
const { User } = require('./UserModel');

class Conversation extends Model {}
Conversation.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING(255) },
  last_message_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { sequelize, modelName: 'Conversation', tableName: 'conversations', underscored: true });

class ConversationParticipant extends Model {}
ConversationParticipant.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  conversation_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false }
}, {
    sequelize,
    modelName: 'ConversationParticipant',
    tableName: 'conversation_participants',
    underscored: true,
    indexes: [{ unique: true, fields: ['conversation_id', 'user_id'] }]
});

class Message extends Model {}
Message.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  conversation_id: { type: DataTypes.INTEGER, allowNull: false },
  sender_id: { type: DataTypes.INTEGER, allowNull: false },
  sender_name: { type: DataTypes.STRING(255) },
  text: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.STRING(50), defaultValue: 'text' },
  attachment_url: { type: DataTypes.STRING(255) },
  attachment_name: { type: DataTypes.STRING(255) },
  attachment_type: { type: DataTypes.STRING(100) },
  duration: { type: DataTypes.INTEGER },
  call_status: { type: DataTypes.STRING(50) },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  is_read: { type: DataTypes.TINYINT(1), defaultValue: 0 }
}, { sequelize, modelName: 'Message', tableName: 'messages', underscored: true, timestamps: false });

// Associations
Conversation.hasMany(Message, { foreignKey: 'conversation_id' });
Message.belongsTo(Conversation, { foreignKey: 'conversation_id' });

Conversation.hasMany(ConversationParticipant, { foreignKey: 'conversation_id' });
ConversationParticipant.belongsTo(Conversation, { foreignKey: 'conversation_id' });

User.hasMany(ConversationParticipant, { foreignKey: 'user_id' });
ConversationParticipant.belongsTo(User, { foreignKey: 'user_id' });

Message.belongsTo(User, { as: 'Sender', foreignKey: 'sender_id' });

module.exports = { Conversation, ConversationParticipant, Message };
