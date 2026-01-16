const { db } = require('../db');

class LessonModel {
    static all() {
        // Join with instructors, students, vehicles for full details
        return db.prepare(`
            SELECT l.*, 
                   i.license_number as instructor_license,
                   u_inst.name as instructor_name,
                   u_stud.name as student_name,
                   v.registration_number as vehicle_reg
            FROM lessons l
            LEFT JOIN instructors i ON l.instructor_id = i.id
            LEFT JOIN users u_inst ON i.user_id = u_inst.id
            LEFT JOIN students s ON l.student_id = s.id
            LEFT JOIN users u_stud ON s.user_id = u_stud.id
            LEFT JOIN vehicles v ON l.assigned_vehicle_id = v.id
        `).all();
    }

    static find(id) {
        return db.prepare(`
            SELECT l.*, 
                   i.license_number as instructor_license,
                   u_inst.name as instructor_name,
                   u_stud.name as student_name,
                   v.registration_number as vehicle_reg
            FROM lessons l
            LEFT JOIN instructors i ON l.instructor_id = i.id
            LEFT JOIN users u_inst ON i.user_id = u_inst.id
            LEFT JOIN students s ON l.student_id = s.id
            LEFT JOIN users u_stud ON s.user_id = u_stud.id
            LEFT JOIN vehicles v ON l.assigned_vehicle_id = v.id
            WHERE l.id = ?
        `).get(id);
    }

    static create(data) {
        const stmt = db.prepare(`
            INSERT INTO lessons (
                title, subject, start_time, end_time, duration_minutes,
                instructor_id, student_id, assigned_vehicle_id, location,
                online_link, status, student_count, capacity, notes, type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const info = stmt.run(
            data.title, data.subject, data.start_time, data.end_time, data.duration_minutes,
            data.instructor_id, data.student_id, data.assigned_vehicle_id, data.location,
            data.online_link, data.status || 'upcoming', data.student_count || 0,
            data.capacity, data.notes, data.type || 'group'
        );
        return this.find(info.lastInsertRowid);
    }

    static update(id, data) {
         const keys = Object.keys(data);
        if (keys.length === 0) return this.find(id);

        const setClause = keys.map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(data), id];

        db.prepare(`UPDATE lessons SET ${setClause} WHERE id = ?`).run(...values);
        return this.find(id);
    }
}

module.exports = LessonModel;
