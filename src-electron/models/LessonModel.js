const { query, get, run } = require('../db');

class LessonModel {
    static mapRow(row) {
        if (!row) return null;
        return {
            id: row.id,
            title: row.title,
            subject: row.subject,
            startTime: row.start_time,
            endTime: row.end_time,
            durationMinutes: row.duration_minutes,
            instructor: {
                id: row.instructor_id,
                name: (row.instructor_first_name || '') + ' ' + (row.instructor_last_name || '')
            },
            student: {
                id: row.student_id,
                name: (row.student_first_name || '') + ' ' + (row.student_last_name || '')
            },
            assignedVehicleId: row.assigned_vehicle_id,
            vehicleReg: row.vehicle_reg,
            location: row.location,
            onlineLink: row.online_link,
            status: row.status,
            studentCount: row.student_count,
            capacity: row.capacity,
            notes: row.notes,
            type: row.type,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }

    static async all() {
        const rows = await query(`
            SELECT l.*, 
                   u_inst.first_name as instructor_first_name,
                   u_inst.last_name as instructor_last_name,
                   u_stud.first_name as student_first_name,
                   u_stud.last_name as student_last_name,
                   v.registration as vehicle_reg
            FROM lessons l
            LEFT JOIN instructors i ON l.instructor_id = i.id
            LEFT JOIN users u_inst ON i.user_id = u_inst.id
            LEFT JOIN students s ON l.student_id = s.id
            LEFT JOIN users u_stud ON s.user_id = u_stud.id
            LEFT JOIN vehicles v ON l.assigned_vehicle_id = v.id
            ORDER BY l.start_time DESC
        `);
        return rows.map(row => this.mapRow(row));
    }

    static async find(id) {
        const row = await get(`
            SELECT l.*, 
                   u_inst.first_name as instructor_first_name,
                   u_inst.last_name as instructor_last_name,
                   u_stud.first_name as student_first_name,
                   u_stud.last_name as student_last_name,
                   v.registration as vehicle_reg
            FROM lessons l
            LEFT JOIN instructors i ON l.instructor_id = i.id
            LEFT JOIN users u_inst ON i.user_id = u_inst.id
            LEFT JOIN students s ON l.student_id = s.id
            LEFT JOIN users u_stud ON s.user_id = u_stud.id
            LEFT JOIN vehicles v ON l.assigned_vehicle_id = v.id
            WHERE l.id = ?
        `, [id]);
        return this.mapRow(row);
    }

    static async create(data) {
        const {
            title, subject, startTime, endTime, durationMinutes,
            instructorId, studentId, assignedVehicleId, location,
            onlineLink, status, studentCount, capacity, notes, type
        } = data;

        const info = await run(`
            INSERT INTO lessons (
                title, subject, start_time, end_time, duration_minutes,
                instructor_id, student_id, assigned_vehicle_id, location,
                online_link, status, student_count, capacity, notes, type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            title, subject, startTime, endTime, durationMinutes,
            instructorId, studentId, assignedVehicleId, location,
            onlineLink, status || 'upcoming', studentCount || 0,
            capacity, notes, type || 'practical'
        ]);

        return await this.find(info.lastID);
    }

    static async update(id, data) {
        const mapping = {
            title: 'title',
            subject: 'subject',
            startTime: 'start_time',
            endTime: 'end_time',
            durationMinutes: 'duration_minutes',
            instructorId: 'instructor_id',
            studentId: 'student_id',
            assignedVehicleId: 'assigned_vehicle_id',
            location: 'location',
            onlineLink: 'online_link',
            status: 'status',
            studentCount: 'student_count',
            capacity: 'capacity',
            notes: 'notes',
            type: 'type'
        };

        const keys = Object.keys(data).filter(k => mapping[k]);
        if (keys.length === 0) return await this.find(id);

        const setClause = keys.map(key => `${mapping[key]} = ?`).join(', ');
        const values = [...keys.map(key => data[key]), id];

        await run(`UPDATE lessons SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
        return await this.find(id);
    }

    static async delete(id) {
        return await run('DELETE FROM lessons WHERE id = ?', [id]);
    }
}

module.exports = LessonModel;
