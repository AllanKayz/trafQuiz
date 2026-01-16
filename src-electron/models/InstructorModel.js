const { db } = require('../db');

class InstructorModel {
    static all() {
        const stmt = db.prepare(`
            SELECT i.*, u.name, u.email, u.phone, u.profile_picture
            FROM instructors i
            JOIN users u ON i.user_id = u.id
        `);
        return stmt.all();
    }

    static find(id) {
         const stmt = db.prepare(`
            SELECT i.*, u.name, u.email, u.phone, u.profile_picture
            FROM instructors i
            JOIN users u ON i.user_id = u.id
            WHERE i.id = ?
        `);
        return stmt.get(id);
    }

    static create(data) {
        const { name, email, password, phone, address, license_number, specialization_id, certification_id, experience } = data;

        return db.transaction(() => {
             const userStmt = db.prepare('INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)');
             const info = userStmt.run(name, email, password, 'instructor', phone, address);
             const userId = info.lastInsertRowid;

             const instStmt = db.prepare(`
                INSERT INTO instructors (user_id, license_number, specialization_id, certification_id, experience)
                VALUES (?, ?, ?, ?, ?)
             `);
             const instInfo = instStmt.run(userId, license_number, specialization_id, certification_id, experience);
             
             return this.find(instInfo.lastInsertRowid);
        })();
    }
}

module.exports = InstructorModel;
