const { db } = require('../db');

class ExamModel {
    static all() {
        return db.prepare('SELECT * FROM exams').all();
    }

    static find(id) {
        return db.prepare('SELECT * FROM exams WHERE id = ?').get(id);
    }

    static create(data) {
        const stmt = db.prepare('INSERT INTO exams (name, start_time, end_time) VALUES (?, ?, ?)');
        const info = stmt.run(data.name, data.start_time, data.end_time);
        return this.find(info.lastInsertRowid);
    }
}

module.exports = ExamModel;
