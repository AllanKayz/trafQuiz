const { ipcMain } = require('electron');
const { broadcastChange } = require('../utils/broadcast');
const MessageModel = require('../models/MessageModel');
const { saveFile } = require('../utils/file-storage');

ipcMain.handle('upload-attachment', async (event, { name, type, data }) => {
    try {
        const result = await saveFile(name, type, data);
        return { success: true, ...result };
    } catch (error) {
        console.error('Upload attachment error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('get-conversations', async (event, { userId }) => {
    try {
        const conversations = await MessageModel.getConversations(userId);
        return { success: true, data: conversations };
    } catch (error) {
        console.error('Get conversations error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('get-messages', async (event, { conversationId }) => {
    try {
        const messages = await MessageModel.getMessages(conversationId);
        return { success: true, data: messages };
    } catch (error) {
        console.error('Get messages error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('send-message', async (event, data) => {
    try {
        const message = await MessageModel.sendMessage(data);
        // Notify all windows about new message
        // Notify all windows about new message
        broadcastChange('messages', 'new-message', message);
        return { success: true, data: message };
    } catch (error) {
        console.error('Send message error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('mark-messages-read', async (event, { conversationId, userId }) => {
    try {
        await MessageModel.markAsRead(conversationId, userId);
        broadcastChange('messages', 'mark-read', { conversationId, userId });
        return { success: true };
    } catch (error) {
        console.error('Mark as read error:', error);
        return { success: false, message: error.message };
    }
});
