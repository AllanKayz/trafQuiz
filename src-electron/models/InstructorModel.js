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

    static async findByUserId(userId) {
        return await get('SELECT * FROM instructors WHERE user_id = ?', [userId]);
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

    static async update(id, data) {
        const instructor = await this.find(id);
        if (!instructor) return null;

        try {
            await exec('BEGIN TRANSACTION');
            
            // Build User update fields
            const userFields = [];
            const userValues = [];
            if (data.username) { userFields.push('username = ?'); userValues.push(data.username); }
            if (data.firstName) { userFields.push('first_name = ?'); userValues.push(data.firstName); }
            if (data.lastName) { userFields.push('last_name = ?'); userValues.push(data.lastName); }
            if (data.email) { userFields.push('email = ?'); userValues.push(data.email); }
            if (data.phone) { userFields.push('phone = ?'); userValues.push(data.phone); }
            if (data.profilePicture) { userFields.push('avatar = ?'); userValues.push(data.profilePicture); }

            if (userFields.length > 0) {
                userValues.push(instructor.user_id);
                await run(`UPDATE users SET ${userFields.join(', ')} WHERE id = ?`, userValues);
            }

            // Build Instructor update fields
            const instFields = [];
            const instValues = [];
            if (data.license_number) { instFields.push('license_number = ?'); instValues.push(data.license_number); }
            if (data.specialization_id) { instFields.push('specialization_id = ?'); instValues.push(data.specialization_id); }
            if (data.certification_id) { instFields.push('certification_id = ?'); instValues.push(data.certification_id); }
            if (data.experience !== undefined) { instFields.push('experience = ?'); instValues.push(data.experience); }
            if (data.availability) { instFields.push('availability = ?'); instValues.push(data.availability); }

            if (instFields.length > 0) {
                instValues.push(id);
                await run(`UPDATE instructors SET ${instFields.join(', ')} WHERE id = ?`, instValues);
            }

            await exec('COMMIT');
            return await this.find(id);
        } catch (error) {
            await exec('ROLLBACK');
            throw error;
        }
    }

    static async delete(id) {
        const instructor = await get('SELECT user_id FROM instructors WHERE id = ?', [id]);
        if (!instructor) return false;

        try {
            await exec('BEGIN TRANSACTION');
            await run('DELETE FROM instructors WHERE id = ?', [id]);
            await run('DELETE FROM users WHERE id = ?', [instructor.user_id]);
            await exec('COMMIT');
            return true;
        } catch (error) {
            await exec('ROLLBACK');
            throw error;
        }
    }
}

module.exports = InstructorModel;
