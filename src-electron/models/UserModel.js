const { db } = require('../db');
const bcrypt = require('bcryptjs');

class UserModel {
    static findByEmail(email) {
        return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    }

    static find(id) {
        return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    }

    static async verifyPassword(user, password) {
        if (!user || !user.password) return false;
        // In existing PHP app, passwords are hashed with bcrypt ($2y$).
        // bcryptjs supports this.
        return await bcrypt.compare(password, user.password);
    }

    static async create(data) {
        const { name, email, password, role = 'student', phone, address } = data;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const stmt = db.prepare('INSERT INTO users (name, email, password, role, phone, address) VALUES (?, ?, ?, ?, ?, ?)');
        const info = stmt.run(name, email, hashedPassword, role, phone, address);
        return this.find(info.lastInsertRowid);
    }
}

module.exports = UserModel;
