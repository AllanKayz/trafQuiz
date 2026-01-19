const { get, run } = require('../db');
const bcrypt = require('bcryptjs');

class UserModel {
    static async findByEmail(email) {
        return await get('SELECT * FROM users WHERE email = ?', [email]);
    }

    static async findByUsername(username) {
        return await get('SELECT * FROM users WHERE username = ?', [username]);
    }

    static async find(id) {
        return await get('SELECT * FROM users WHERE id = ?', [id]);
    }

    static async verifyPassword(user, password) {
        if (!user || !user.password) return false;
        // In existing PHP app, passwords are hashed with bcrypt ($2y$).
        // bcryptjs supports this.
        return await bcrypt.compare(password, user.password);
    }

    static async create(data) {
        const { username, firstName, lastName, email, password, role = 'student', phone } = data;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        try {
            const info = await run(
                'INSERT INTO users (username, first_name, last_name, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [username, firstName, lastName, email, hashedPassword, role, phone]
            );
            return await this.find(info.lastID);
        } catch (error) {
            console.error('Error creating user:', error);
            throw new Error('Failed to create user: ' + error.message);
        }
    }

    static async update(id, data) {
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(data)) {
            if (key === 'id' || key === 'password') continue;
            // Map camelCase to snake_case if necessary, 
            // but here we'll assume the keys match the schema or we handle them
            const column = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            fields.push(`${column} = ?`);
            values.push(value);
        }

        if (fields.length === 0) return await this.find(id);

        values.push(id);
        await run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
        return await this.find(id);
    }
}

module.exports = UserModel;
