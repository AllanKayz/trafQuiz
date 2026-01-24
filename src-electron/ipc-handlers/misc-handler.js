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
         // Default to generic period or specific exam query. 
         // Since this is seemingly global, we might pick the default setting or first one.
         const res = await get('SELECT period FROM exam_timeframe LIMIT 1');
         return { success: true, data: { period: res ? res.period : '30' } };
     } catch (e) {
         console.error('Get exam duration error:', e);
         return { success: false, message: e.message };
     }
});

ipcMain.handle('set-exam-timeframe', async (event, { period, exam_id }) => {
    try {
        const { run, get } = require('../db');
        // Check if exists
        const exists = await get('SELECT id FROM exam_timeframe LIMIT 1');
        
        if (exists) {
            await run('UPDATE exam_timeframe SET period = ? WHERE id = ?', [period, exists.id]);
        } else {
             // Default to exam_id 1 if not provided, or handle error. 
             // Ideally exam_timeframe should link to specific exam, 
             // but if treated as global generic setting:
             const firstExam = await get('SELECT id FROM exams LIMIT 1');
             const targetExamId = exam_id || (firstExam ? firstExam.id : 0);
             
            await run('INSERT INTO exam_timeframe (period, exam_id) VALUES (?, ?)', [period, targetExamId]);
        }
        return { success: true };
    } catch (e) {
        console.error('Set exam duration error:', e);
        return { success: false, message: e.message };
    }
});
ipcMain.handle('add-specialization', async (event, specialization) => {
    try {
        const { run } = require('../db');
        const result = await run('INSERT INTO specialization (specialization, description) VALUES (?, ?)', [specialization.specialization, specialization.description]);
        return { success: true, id: result.lastID, data: { id: result.lastID, ...specialization } };
    } catch (e) {
        console.error('Add specialization error:', e);
        return { success: false, message: e.message };
    }
});

ipcMain.handle('delete-specialization', async (event, { id }) => {
    try {
        const { run } = require('../db');
        await run('DELETE FROM specialization WHERE id = ?', [id]);
        return { success: true };
    } catch (e) {
        console.error('Delete specialization error:', e);
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
        return { success: true, id: result.lastID, data: { id: result.lastID, ...certification } };
    } catch (e) {
        console.error('Add certification error:', e);
        return { success: false, message: e.message };
    }
});

ipcMain.handle('delete-certification', async (event, { id }) => {
    try {
        const { run } = require('../db');
        await run('DELETE FROM certification WHERE id = ?', [id]);
        return { success: true };
    } catch (e) {
        console.error('Delete certification error:', e);
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
        // Updated to use true categories table
        const data = await query('SELECT id, name as category, description FROM categories'); 
        return { success: true, data };
    } catch (e) {
        console.error('Get categories error:', e);
        return { success: false, message: e.message };
    }
});

ipcMain.handle('add-category', async (event, category) => {
    try {
        const { run } = require('../db');
        // Expecting { name: '...', description: '...' }
        const name = category.name || category.category;
        const desc = category.description || '';
        
        const result = await run('INSERT INTO categories (name, description) VALUES (?, ?)', [name, desc]);
        return { success: true, id: result.lastID, data: { id: result.lastID, category: name, description: desc } };
    } catch (e) {
        console.error('Add category error:', e);
        return { success: false, message: e.message };
    }
});

ipcMain.handle('update-category', async (event, category) => {
    try {
        const { run } = require('../db');
        const name = category.name || category.category;
        const desc = category.description || '';
        await run('UPDATE categories SET name = ?, description = ? WHERE id = ?', [name, desc, category.id]);
        return { success: true };
    } catch (e) {
        console.error('Update category error:', e);
        return { success: false, message: e.message };
    }
});

ipcMain.handle('delete-category', async (event, { id }) => {
    try {
        const { run } = require('../db');
        await run('DELETE FROM categories WHERE id = ?', [id]);
        return { success: true };
    } catch (e) {
        console.error('Delete category error:', e);
        return { success: false, message: e.message };
    }
});

