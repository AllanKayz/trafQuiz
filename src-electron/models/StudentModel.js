const { get, query, run, exec } = require('../db');
const bcrypt = require('bcryptjs');

class StudentModel {
    static async all() {
        return await query(`
            SELECT s.*, u.username, u.first_name as firstName, u.last_name as lastName, u.email, u.phone, u.avatar as profilePicture, p.package as package_name
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN packages p ON s.package_id = p.id
        `);
    }

    static async find(id) {
        return await get(`
            SELECT s.*, u.username, u.first_name as firstName, u.last_name as lastName, u.email, u.phone, u.avatar as profilePicture, p.package as package_name
            FROM students s
            JOIN users u ON s.user_id = u.id
            LEFT JOIN packages p ON s.package_id = p.id
            WHERE s.id = ?
        `, [id]);
    }

    static async findByUserId(userId) {
        return await get('SELECT * FROM students WHERE user_id = ?', [userId]);
    }

    static async create(data) {
        const { username, firstName, lastName, email, password, role = 'student', phone, address, package_id } = data;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            await exec('BEGIN TRANSACTION');
            const userInfo = await run(
                'INSERT INTO users (username, first_name, last_name, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [username, firstName, lastName, email, hashedPassword, role, phone]
            );
            const userId = userInfo.lastID;

            const studentInfo = await run(
                'INSERT INTO students (user_id, address, package_id) VALUES (?, ?, ?)',
                [userId, address, package_id]
            );
            await exec('COMMIT');
            return await this.find(studentInfo.lastID);
        } catch (error) {
            await exec('ROLLBACK');
            throw error;
        }
    }

    static async update(id, data) {
        const student = await this.find(id);
        if (!student) return null;

        try {
            await exec('BEGIN TRANSACTION');
            if (data.username || data.firstName || data.lastName || data.email || data.phone || data.address || data.profilePicture) {
                const fields = [];
                const values = [];
                if (data.username) { fields.push('username = ?'); values.push(data.username); }
                if (data.firstName) { fields.push('first_name = ?'); values.push(data.firstName); }
                if (data.lastName) { fields.push('last_name = ?'); values.push(data.lastName); }
                if (data.email) { fields.push('email = ?'); values.push(data.email); }
                if (data.phone) { fields.push('phone = ?'); values.push(data.phone); }
                if (data.address) { fields.push('address = ?'); values.push(data.address); }
                if (data.profilePicture) { fields.push('avatar = ?'); values.push(data.profilePicture); }
                
                values.push(student.user_id);
                await run(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
            }

            if (data.package_id || data.status) {
                const fields = [];
                const values = [];
                if (data.package_id) { fields.push('package_id = ?'); values.push(data.package_id); }
                if (data.status) { fields.push('status = ?'); values.push(data.status); }
                
                values.push(id);
                await run(`UPDATE students SET ${fields.join(', ')} WHERE id = ?`, values);
            }
            await exec('COMMIT');
            return await this.find(id);
        } catch (error) {
            await exec('ROLLBACK');
            throw error;
        }
    }

    static async delete(id) {
        const student = await get('SELECT user_id FROM students WHERE id = ?', [id]);
        if (!student) return false;

        try {
            await exec('BEGIN TRANSACTION');
            await run('DELETE FROM students WHERE id = ?', [id]);
            await run('DELETE FROM users WHERE id = ?', [student.user_id]);
            await exec('COMMIT');
            return true;
        } catch (error) {
            await exec('ROLLBACK');
            throw error;
        }
    }
}

module.exports = StudentModel;
