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
