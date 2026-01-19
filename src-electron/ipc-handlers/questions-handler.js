const { ipcMain } = require('electron');
const { query, run } = require('../db');

ipcMain.handle('get-questions', async (event) => {
    try {
        const questions = await query('SELECT * FROM questions');
        const data = questions.map(q => ({
            id: q.id,
            question: q.question_text,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            answer: q.answer,
            photo: q.img_insert,
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
        const info = await run(
            'INSERT INTO questions (question_text, option_a, option_b, option_c, answer, img_insert) VALUES (?, ?, ?, ?, ?, ?)',
            [question.question, question.option_a, question.option_b, question.option_c, question.answer, question.photo]
        );
        return { success: true, data: { id: info.lastID } };
    } catch (error) {
        console.error('Add question error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('delete-question', async (event, { id }) => {
    try {
        await run('DELETE FROM questions WHERE id = ?', [id]);
        return { success: true };
    } catch (error) {
        console.error('Delete question error:', error);
        return { success: false, message: error.message };
    }
});
