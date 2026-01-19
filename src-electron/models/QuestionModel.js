const { get, query, run } = require('../db');

class QuestionModel {
    static async getByExamId(examId) {
        return await query('SELECT * FROM questions WHERE exam_id = ?', [examId]);
    }

    static async find(id) {
        return await get('SELECT * FROM questions WHERE id = ?', [id]);
    }

    static async create(data) {
        const info = await run(`
            INSERT INTO questions (
                question_text, img_insert, option_image, 
                option_a, option_b, option_c, 
                correct_option, exam_id, answer
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            data.question_text, data.img_insert, data.option_image || 0,
            data.option_a, data.option_b, data.option_c,
            data.correct_option, data.exam_id, data.answer
        ]);
        return await this.find(info.lastID);
    }

    static async checkAnswer(questionId, selectedOption) {
        const question = await this.find(questionId);
        if (!question) return false;
        return question.correct_option == selectedOption; 
    }
}

module.exports = QuestionModel;
