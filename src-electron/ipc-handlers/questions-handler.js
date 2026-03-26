const { ipcMain } = require('electron');
const { QuestionModel } = require('../models/QuestionModel');
const { CategoryModel } = require('../models/CategoryModel');
const { broadcastChange } = require('../utils/broadcast');
const { isAdmin } = require('../utils/session');

ipcMain.handle('get-question-stats', async () => {
    try {
        const [total, categories, reviewed] = await Promise.all([
            QuestionModel.count(),
            CategoryModel.count(),
            QuestionModel.countReviewed()
        ]);

        return {
            success: true,
            data: {
                total,
                categories,
                reviewed
            }
        };
    } catch (e) {
        console.error('Get question stats error:', e);
        return { success: false, message: e.message };
    }
});

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
        if (!isAdmin()) return { success: false, message: 'Unauthorized' };
        const result = await QuestionModel.create(question);
        broadcastChange('questions', 'create', result);
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
        if (!isAdmin()) return { success: false, message: 'Unauthorized' };
        const result = await QuestionModel.update(question.id, question);
        broadcastChange('questions', 'update', result);
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

ipcMain.handle('bulk-add-questions', async (event, questions) => {
    try {
        if (!isAdmin()) return { success: false, message: 'Unauthorized' };
        await QuestionModel.bulkCreate(questions);
        broadcastChange('questions', 'bulk-create', null);
        return { success: true };
    } catch (error) {
        console.error('Bulk add questions error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('delete-question', async (event, { id }) => {
    try {
        if (!isAdmin()) return { success: false, message: 'Unauthorized' };
        await QuestionModel.delete(id);
        broadcastChange('questions', 'delete', { id });
        return { success: true };
    } catch (error) {
        console.error('Delete question error:', error);
        return { success: false, message: error.message };
    }
});
