const { ipcMain } = require('electron');
const { InstructorModel } = require('../models/InstructorModel');
const { broadcastChange } = require('../utils/broadcast');

ipcMain.handle('get-instructors', async (event) => {
    try {
        const instructors = await InstructorModel.findAll();
        return { success: true, data: instructors };
    } catch (error) {
        console.error('Get instructors error:', error);
        return { success: false, message: 'Internal service error' };
    }
});

ipcMain.handle('add-instructor', async (event, instructor) => {
    try {
        const result = await InstructorModel.create(instructor);
        broadcastChange('instructors', 'create', result);
        return { success: true, data: result };
    } catch (error) {
        console.error('Add instructor error:', error);
        return { success: false, message: 'Internal service error' };
    }
});

ipcMain.handle('update-instructor', async (event, instructor) => {
    try {
        const result = await InstructorModel.update(instructor.id, instructor);
        broadcastChange('instructors', 'update', result);
        return { success: true, data: result };
    } catch (error) {
        console.error('Update instructor error:', error);
        return { success: false, message: 'Internal service error' };
    }
});

ipcMain.handle('delete-instructor', async (event, { id }) => {
    try {
        const success = await InstructorModel.delete(id);
        if (success) broadcastChange('instructors', 'delete', { id });
        return { success, message: success ? 'Instructor deleted' : 'Instructor not found' };
    } catch (error) {
        console.error('Delete instructor error:', error);
        return { success: false, message: 'Internal service error' };
    }
});
