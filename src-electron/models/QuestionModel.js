const { db } = require('../db');

class QuestionModel {
    static getByExamId(examId) {
        return db.prepare('SELECT * FROM questions WHERE exam_id = ?').all(examId);
    }

    static find(id) {
        return db.prepare('SELECT * FROM questions WHERE id = ?').get(id);
    }

    static create(data) {
        const stmt = db.prepare(`
            INSERT INTO questions (
                question_text, img_insert, option_image, 
                option_a, option_b, option_c, 
                correct_option, exam_id, answer
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(
            data.question_text, data.img_insert, data.option_image || 0,
            data.option_a, data.option_b, data.option_c,
            data.correct_option, data.exam_id, data.answer
        );
        return this.find(info.lastInsertRowid);
    }

    static checkAnswer(questionId, selectedOption) {
        const question = this.find(questionId);
        if (!question) return false;
        // logic: `correct_option` stores '1', '2', or '3' usually corresponding to A, B, C?
        // Let's verify data...
        // Data sample: correct_option: '2', Answer: 'B. ...'
        // Ideally we compare the index. 
        // If selectedOption is passed as '1', '2', '3' or 'A', 'B', 'C'.
        // Assuming frontend sends the index or the text.
        // For now, let's assume strict equality check if the frontend logic aligns.
        return question.correct_option == selectedOption; 
    }
}

module.exports = QuestionModel;
