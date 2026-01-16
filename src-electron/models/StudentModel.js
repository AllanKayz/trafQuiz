const { db } = require('../db');

class StudentModel {
    static all() {
        const stmt = db.prepare(`
            SELECT s.*, u.name, u.email, u.phone, u.profile_picture, p.package as package_name
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN packages p ON s.package_id = p.id
        `);
        return stmt.all();
    }

    static find(id) {
        const stmt = db.prepare(`
            SELECT s.*, u.name, u.email, u.phone, u.profile_picture, p.package as package_name
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN packages p ON s.package_id = p.id
            WHERE s.id = ?
        `);
        return stmt.get(id);
    }

    static findByUserId(userId) {
        return db.prepare('SELECT * FROM students WHERE user_id = ?').get(userId);
    }

    static create(data) {
        // data should contain user info + student info
        // We'll need a transaction to create user then student
        // But commonly, the User might be created separately. 
        // For atomic creation:
        const { name, email, password, role = 'student', phone, address, package_id } = data;

        return db.transaction(() => {
             const userStmt = db.prepare('INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)');
             const info = userStmt.run(name, email, password, role, phone, address);
             const userId = info.lastInsertRowid;

             const studentStmt = db.prepare('INSERT INTO students (user_id, package_id) VALUES (?, ?)');
             const studentInfo = studentStmt.run(userId, package_id);
             
             return this.find(studentInfo.lastInsertRowid);
        })();
    }

    static update(id, data) {
         // This is tricky if we are updating user fields too.
         // Assume data has flat structure.
         const student = this.find(id);
         if (!student) return null;

         return db.transaction(() => {
             if (data.name || data.email || data.phone || data.address || data.profile_picture) {
                 const fields = [];
                 const values = [];
                 if (data.name) { fields.push('name = ?'); values.push(data.name); }
                 if (data.email) { fields.push('email = ?'); values.push(data.email); }
                 if (data.phone) { fields.push('phone = ?'); values.push(data.phone); }
                 if (data.address) { fields.push('address = ?'); values.push(data.address); }
                 if (data.profile_picture) { fields.push('profile_picture = ?'); values.push(data.profile_picture); }
                 
                 values.push(student.user_id);
                 db.prepare(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`).run(...values);
             }

             if (data.package_id || data.status) {
                 const fields = [];
                 const values = [];
                 if (data.package_id) { fields.push('package_id = ?'); values.push(data.package_id); }
                 if (data.status) { fields.push('status = ?'); values.push(data.status); }
                 
                 values.push(id);
                 db.prepare(`UPDATE students SET ${fields.join(', ')} WHERE id = ?`).run(...values);
             }
             
             return this.find(id);
         })();
    }

    static delete(id) {
        const student = db.prepare('SELECT user_id FROM students WHERE id = ?').get(id);
        if (!student) return false;

        return db.transaction(() => {
            db.prepare('DELETE FROM students WHERE id = ?').run(id);
            // Optionally delete user? Or keep user record?
            // Usually we might want to soft delete. 
            // For now, hard delete user as well if he is just a student.
            db.prepare('DELETE FROM users WHERE id = ?').run(student.user_id);
            return true;
        })();
    }
}

module.exports = StudentModel;
