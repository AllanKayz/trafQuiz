const { ipcMain } = require('electron');
const ProgressModel = require('../models/ProgressModel');
const { get } = require('../db');
const { isAuthenticated } = require('../utils/session');

ipcMain.handle('get-student-progress', async (event, { userId, studentId }) => {
    try {
        if (!isAuthenticated()) return { success: false, message: 'Unauthorized' };
        let targetStudentId = studentId;
        
        // If only userId is provided, find the associated student_id
        if (!targetStudentId && userId) {
            const student = await get('SELECT id FROM students WHERE user_id = ?', [userId]);
            if (student) {
                targetStudentId = student.id;
            } else {
                throw new Error('Student record not found for this user.');
            }
        }

        if (!targetStudentId) {
            throw new Error('Student ID or User ID is required.');
        }

        const progress = await ProgressModel.getProgress(targetStudentId);
        return { success: true, data: progress };
    } catch (error) {
        console.error('Error fetching student progress:', error);
        return { success: false, message: error.message };
    }
});
