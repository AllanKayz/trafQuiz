const { get, query, run, exec } = require('../db');
const bcrypt = require('bcryptjs');

class InstructorModel {
    static async all() {
        return await query(`
            SELECT i.*, u.username, u.first_name as firstName, u.last_name as lastName, u.email, u.phone, u.avatar as profilePicture
            FROM instructors i
            JOIN users u ON i.user_id = u.id
        `);
    }

    static async find(id) {
        return await get(`
            SELECT i.*, u.username, u.first_name as firstName, u.last_name as lastName, u.email, u.phone, u.avatar as profilePicture
            FROM instructors i
            JOIN users u ON i.user_id = u.id
            WHERE i.id = ?
        `, [id]);
    }

    static async create(data) {
        const { username, firstName, lastName, email, password, phone, address, license_number, specialization_id, certification_id, experience } = data;
        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            await exec('BEGIN TRANSACTION');
            const userInfo = await run(
                'INSERT INTO users (username, first_name, last_name, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [username, firstName, lastName, email, hashedPassword, 'instructor', phone]
            );
            const userId = userInfo.lastID;

            const instInfo = await run(`
                INSERT INTO instructors (user_id, license_number, specialization_id, certification_id, experience)
                VALUES (?, ?, ?, ?, ?)
            `, [userId, license_number, specialization_id, certification_id, experience]);
            
            await exec('COMMIT');
            return await this.find(instInfo.lastID);
        } catch (error) {
            await exec('ROLLBACK');
            throw error;
        }
    }
}

module.exports = InstructorModel;
