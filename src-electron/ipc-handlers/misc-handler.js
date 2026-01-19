const { ipcMain } = require('electron');
const { query, get } = require('../db');

// Packages
ipcMain.handle('get-packages', async () => {
    try {
        const data = await query('SELECT * FROM packages');
        return { success: true, data };
    } catch (error) {
        console.error('Get packages error:', error);
        return { success: false, message: error.message };
    }
});

// Specializations
ipcMain.handle('get-specializations', async () => {
    try {
        const data = await query('SELECT * FROM specialization');
        return { success: true, data };
    } catch (e) {
        console.error('Get specializations error:', e);
        return { success: false, message: e.message };
    }
});

// Certifications
ipcMain.handle('get-certifications', async () => {
    try {
        const data = await query('SELECT * FROM certification');
        return { success: true, data };
    } catch (e) {
        console.error('Get certifications error:', e);
        return { success: false, message: e.message };
    }
});

// Time
ipcMain.handle('get-exam-duration', async () => {
     try {
         const res = await get('SELECT period FROM exam_timeframe LIMIT 1');
         return { success: true, data: { period: res ? res.period : '30' } };
     } catch (e) {
         console.error('Get exam duration error:', e);
         return { success: false, message: e.message };
     }
});
