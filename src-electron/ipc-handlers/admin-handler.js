const { ipcMain } = require('electron');
const { Specialization, Certification } = require('../models/MetadataModels');
const { sequelize } = require('../database');

ipcMain.handle('get-specializations', async () => {
    try {
        const data = await Specialization.findAll({ raw: true });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('add-specialization', async (event, data) => {
    try {
        const result = await Specialization.create(data);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('get-certifications', async () => {
    try {
        const data = await Certification.findAll({ raw: true });
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('add-certification', async (event, data) => {
    try {
        const result = await Certification.create(data);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('get-packages', async () => {
    try {
        // Assuming Package model exists or raw query
        const [data] = await sequelize.query('SELECT * FROM packages');
        return { success: true, data };
    } catch (error) {
        return { success: false, message: error.message };
    }
});
