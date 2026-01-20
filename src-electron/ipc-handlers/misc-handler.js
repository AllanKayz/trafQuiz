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
ipcMain.handle('add-specialization', async (event, specialization) => {
    try {
        const { run } = require('../db');
        const result = await run('INSERT INTO specialization (specialization, description) VALUES (?, ?)', [specialization.specialization, specialization.description]);
        return { success: true, id: result.lastID };
    } catch (e) {
        console.error('Add specialization error:', e);
        return { success: false, message: e.message };
    }
});

ipcMain.handle('update-specialization', async (event, specialization) => {
    try {
        const { run } = require('../db');
        await run('UPDATE specialization SET specialization = ?, description = ? WHERE id = ?', [specialization.specialization, specialization.description, specialization.id]);
        return { success: true };
    } catch (e) {
        console.error('Update specialization error:', e);
        return { success: false, message: e.message };
    }
});

ipcMain.handle('add-certification', async (event, certification) => {
    try {
        const { run } = require('../db');
        const result = await run('INSERT INTO certification (certification, description) VALUES (?, ?)', [certification.certification, certification.description]);
        return { success: true, id: result.lastID };
    } catch (e) {
        console.error('Add certification error:', e);
        return { success: false, message: e.message };
    }
});

ipcMain.handle('update-certification', async (event, certification) => {
    try {
        const { run } = require('../db');
        await run('UPDATE certification SET certification = ?, description = ? WHERE id = ?', [certification.certification, certification.description, certification.id]);
        return { success: true };
    } catch (e) {
        console.error('Update certification error:', e);
        return { success: false, message: e.message };
    }
});
ipcMain.handle('update-package', async (event, pkg) => {
    try {
        const { run } = require('../db');
        await run('UPDATE packages SET package = ?, description = ?, amount = ? WHERE id = ?', [pkg.package, pkg.description, pkg.amount, pkg.id]);
        return { success: true };
    } catch (e) {
        console.error('Update package error:', e);
        return { success: false, message: e.message };
    }
});


ipcMain.handle('get-question-categories', async () => {
    try {
        const data = await query('SELECT id, name as category FROM exams'); 
        return { success: true, data };
    } catch (e) {
        console.error('Get categories error:', e);
        return { success: false, message: e.message };
    }
});

ipcMain.handle('add-category', async (event, category) => {
    try {
        const { run } = require('../db');
        // If category is simple string, or object { category: 'name' }
        const name = typeof category === 'string' ? category : (category.category || category.name);
        const result = await run('INSERT INTO exams (name, start_time, end_time) VALUES (?, ?, ?)', 
            [name, '0000-00-00 00:00:00', '0000-00-00 00:00:00']);
        return { success: true, id: result.lastID };
    } catch (e) {
        console.error('Add category error:', e);
        return { success: false, message: e.message };
    }
});

