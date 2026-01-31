const { ipcMain } = require('electron');
const { QuestionModel } = require('../models/QuestionModel');

ipcMain.handle('get-questions', async (event) => {
    try {
        const questions = await QuestionModel.findAll();
        const data = questions.map(q => ({
            id: q.id,
            question: q.question_text,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            answer: q.answer,
            photo: q.img_insert,
            exam_id: q.exam_id,
            flagged: false 
        }));
        return { success: true, data };
    } catch (error) {
        console.error('Get questions error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('add-question', async (event, question) => {
    try {
        const result = await QuestionModel.create(question);
        return { success: true, data: {
            id: result.id,
            question: result.question_text,
            option_a: result.option_a,
            option_b: result.option_b,
            option_c: result.option_c,
            answer: result.answer,
            photo: result.img_insert,
            exam_id: result.exam_id
        }};
    } catch (error) {
        console.error('Add question error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('update-question', async (event, question) => {
    try {
        const result = await QuestionModel.update(question.id, question);
        return { success: true, data: {
            id: result.id,
            question: result.question_text,
            option_a: result.option_a,
            option_b: result.option_b,
            option_c: result.option_c,
            answer: result.answer,
            photo: result.img_insert,
            exam_id: result.exam_id
        }};
    } catch (error) {
        console.error('Update question error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('delete-question', async (event, { id }) => {
    try {
        await QuestionModel.delete(id);
        return { success: true };
    } catch (error) {
        console.error('Delete question error:', error);
        return { success: false, message: error.message };
    }
});
