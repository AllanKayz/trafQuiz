const { ipcMain } = require('electron');
const { query, get } = require('../db');
const { broadcastChange } = require('../utils/broadcast');
const { isAdmin } = require('../utils/session');

// Packages


// Specializations


// Certifications


// Time
ipcMain.handle('get-exam-duration', async () => {
     try {
         // Default to generic period or specific exam query. 
         // Since this is seemingly global, we might pick the default setting or first one.
         const res = await get('SELECT period FROM exam_timeframe LIMIT 1');
         return { success: true, data: { period: res ? res.period : '30' } };
     } catch (e) {
         console.error('Get exam duration error:', e);
         return { success: false, message: 'Internal service error' };
     }
});




ipcMain.handle('delete-specialization', async (event, { id }) => {
    try {
        if (!isAdmin()) return { success: false, message: 'Unauthorized' };
        const { run } = require('../db');
        await run('DELETE FROM specialization WHERE id = ?', [id]);
        broadcastChange('specializations', 'delete', { id });
        return { success: true };
    } catch (e) {
        console.error('Delete specialization error:', e);
        return { success: false, message: 'Internal service error' };
    }
});

ipcMain.handle('update-specialization', async (event, specialization) => {
    try {
        if (!isAdmin()) return { success: false, message: 'Unauthorized' };
        const { run } = require('../db');
        await run('UPDATE specialization SET specialization = ?, description = ? WHERE id = ?', [specialization.specialization, specialization.description, specialization.id]);
        broadcastChange('specializations', 'update', specialization);
        return { success: true };
    } catch (e) {
        console.error('Update specialization error:', e);
        return { success: false, message: 'Internal service error' };
    }
});



ipcMain.handle('delete-certification', async (event, { id }) => {
    try {
        if (!isAdmin()) return { success: false, message: 'Unauthorized' };
        const { run } = require('../db');
        await run('DELETE FROM certification WHERE id = ?', [id]);
        broadcastChange('certifications', 'delete', { id });
        return { success: true };
    } catch (e) {
        console.error('Delete certification error:', e);
        return { success: false, message: 'Internal service error' };
    }
});

ipcMain.handle('update-certification', async (event, certification) => {
    try {
        if (!isAdmin()) return { success: false, message: 'Unauthorized' };
        const { run } = require('../db');
        await run('UPDATE certification SET certification = ?, description = ? WHERE id = ?', [certification.certification, certification.description, certification.id]);
        broadcastChange('certifications', 'update', certification);
        return { success: true };
    } catch (e) {
        console.error('Update certification error:', e);
        return { success: false, message: 'Internal service error' };
    }
});
ipcMain.handle('update-package', async (event, pkg) => {
    try {
        if (!isAdmin()) return { success: false, message: 'Unauthorized' };
        const { run } = require('../db');
        await run('UPDATE packages SET package = ?, description = ?, amount = ? WHERE id = ?', [pkg.package, pkg.description, pkg.amount, pkg.id]);
        return { success: true };
    } catch (e) {
        console.error('Update package error:', e);
        return { success: false, message: 'Internal service error' };
    }
});


ipcMain.handle('get-question-categories', async () => {
    try {
        // Updated to use true categories table
        const data = await query('SELECT id, name as category, description FROM categories'); 
        return { success: true, data };
    } catch (e) {
        console.error('Get categories error:', e);
        return { success: false, message: 'Internal service error' };
    }
});

ipcMain.handle('add-category', async (event, category) => {
    try {
        if (!isAdmin()) return { success: false, message: 'Unauthorized' };
        const { run } = require('../db');
        // Expecting { name: '...', description: '...' }
        const name = category.name || category.category;
        const desc = category.description || '';
        
        const result = await run('INSERT INTO categories (name, description) VALUES (?, ?)', [name, desc]);
        broadcastChange('categories', 'create', { id: result.lastID, category: name, description: desc });
        return { success: true, id: result.lastID, data: { id: result.lastID, category: name, description: desc } };
    } catch (e) {
        console.error('Add category error:', e);
        return { success: false, message: 'Internal service error' };
    }
});

ipcMain.handle('update-category', async (event, category) => {
    try {
        if (!isAdmin()) return { success: false, message: 'Unauthorized' };
        const { run } = require('../db');
        const name = category.name || category.category;
        const desc = category.description || '';
        await run('UPDATE categories SET name = ?, description = ? WHERE id = ?', [name, desc, category.id]);
        broadcastChange('categories', 'update', { id: category.id, category: name, description: desc });
        return { success: true };
    } catch (e) {
        console.error('Update category error:', e);
        return { success: false, message: 'Internal service error' };
    }
});

ipcMain.handle('delete-category', async (event, { id }) => {
    try {
        if (!isAdmin()) return { success: false, message: 'Unauthorized' };
        const { run } = require('../db');
        await run('DELETE FROM categories WHERE id = ?', [id]);
        broadcastChange('categories', 'delete', { id });
        return { success: true };
    } catch (e) {
        console.error('Delete category error:', e);
        return { success: false, message: 'Internal service error' };
    }
});

