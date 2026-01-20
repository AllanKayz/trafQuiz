const { ipcMain } = require('electron');
const StudentModel = require('../models/StudentModel');

ipcMain.handle('get-students', async (event, params) => {
    try {
        const instructorId = params ? params.instructorId : null;
        const students = await StudentModel.all(instructorId);
        return { success: true, data: students };
    } catch (error) {
        console.error('Get students error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('add-student', async (event, student) => {
    try {
         const result = await StudentModel.create(student);
         return { success: true, data: result };
    } catch (error) {
        console.error('Add student error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('update-student', async (event, student) => {
    try {
         const result = await StudentModel.update(student.id, student);
         return { success: true, data: result };
    } catch (error) {
        console.error('Update student error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('delete-student', async (event, { id }) => {
    try {
         const success = await StudentModel.delete(id);
         return { success, message: success ? 'Student deleted' : 'Student not found' };
    } catch (error) {
        console.error('Delete student error:', error);
        return { success: false, message: error.message };
    }
});
