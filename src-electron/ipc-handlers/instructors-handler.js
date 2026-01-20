const { ipcMain } = require('electron');
const InstructorModel = require('../models/InstructorModel');

ipcMain.handle('get-instructors', async () => {
    try {
        const instructors = await InstructorModel.all();
        return { success: true, data: instructors };
    } catch (error) {
        console.error('Get instructors error:', error);
        return { success: false, message: error.message };
    }
});
ipcMain.handle('add-instructor', async (event, instructor) => {
    try {
        const result = await InstructorModel.create(instructor);
        return { success: true, data: result };
    } catch (error) {
        console.error('Add instructor error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('update-instructor', async (event, instructor) => {
    try {
        const result = await InstructorModel.update(instructor.id, instructor);
        return { success: true, data: result };
    } catch (error) {
        console.error('Update instructor error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('delete-instructor', async (event, { id }) => {
    try {
        const success = await InstructorModel.delete(id);
        return { success, message: success ? 'Instructor deleted' : 'Instructor not found' };
    } catch (error) {
        console.error('Delete instructor error:', error);
        return { success: false, message: error.message };
    }
});
