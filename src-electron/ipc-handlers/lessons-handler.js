const { ipcMain } = require('electron');
const { LessonModel } = require('../models/LessonModel');

ipcMain.handle('get-lessons', async (event, filters) => {
    try {
        const lessons = await LessonModel.findAll(filters);
        return { success: true, data: lessons };
    } catch (error) {
        console.error('Get lessons error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('add-lesson', async (event, lesson) => {
    try {
        const result = await LessonModel.create(lesson);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('update-lesson', async (event, lesson) => {
    try {
        const result = await LessonModel.update(lesson.id, lesson);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('delete-lesson', async (event, { id }) => {
    try {
        await LessonModel.delete(id);
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
});
