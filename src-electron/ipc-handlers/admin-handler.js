const { ipcMain } = require('electron');
const { Specialization, Certification } = require('../models/MetadataModels');
const { broadcastChange } = require('../utils/broadcast');
const { sequelize } = require('../database');
const { isAdmin } = require('../utils/session');

ipcMain.handle('get-specializations', async () => {
    try {
        if (!isAdmin()) return { success: false, message: 'Unauthorized' };
        const data = await Specialization.findAll({ raw: true });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('add-specialization', async (event, data) => {
    try {
        if (!isAdmin()) return { success: false, message: 'Unauthorized' };
        const result = await Specialization.create(data);
        broadcastChange('specializations', 'create', result);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('get-certifications', async () => {
    try {
        if (!isAdmin()) return { success: false, message: 'Unauthorized' };
        const data = await Certification.findAll({ raw: true });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('add-certification', async (event, data) => {
    try {
        if (!isAdmin()) return { success: false, message: 'Unauthorized' };
        const result = await Certification.create(data);
        broadcastChange('certifications', 'create', result);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('get-packages', async () => {
    try {
        if (!isAdmin()) return { success: false, message: 'Unauthorized' };
        // Assuming Package model exists or raw query
        const [data] = await sequelize.query('SELECT * FROM packages');
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error.message };
    }
});
