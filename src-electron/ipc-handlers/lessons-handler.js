const { ipcMain } = require('electron');
const LessonModel = require('../models/LessonModel');

ipcMain.handle('get-lessons', async (event, { range, instructorId, userId }) => {
    try {
        let sql = 'SELECT * FROM lessons';
        const params = [];
        const conditions = [];

        // Support both parameter names for user ID
        const uid = userId || instructorId;

        if (uid) {
             const instructor = await require('../models/InstructorModel').findByUser(uid);
             if (instructor) {
                 conditions.push('instructor_id = ?');
                 params.push(instructor.id);
             }
        }

        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        
        sql += ' ORDER BY start_time ASC';

        const { query } = require('../db');
        const rows = await query(sql, params);
        
        // We need to map rows to Lesson objects with nested instructor/student objects
        // For now, let's just return rows and maybe join simple info if needed
        // Or better, let's use a JOIN query to get instructor/student names
        // But to keep it simple and safe for now, let's just return fields.
        // Frontend expects "instructor: { id, name }"
        
        // Let's do a better query
        sql = `
            SELECT l.*, 
                   u_i.first_name as i_fname, u_i.last_name as i_lname,
                   u_s.first_name as s_fname, u_s.last_name as s_lname
            FROM lessons l
            LEFT JOIN instructors i ON l.instructor_id = i.id
            LEFT JOIN users u_i ON i.user_id = u_i.id
            LEFT JOIN students s ON l.student_id = s.id
            LEFT JOIN users u_s ON s.user_id = u_s.id
        `;
        
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' AND ');
        }
        sql += ' ORDER BY start_time ASC';
        
        const richRows = await query(sql, params);
        
        const formatted = richRows.map(r => ({
            id: r.id,
            title: r.title,
            subject: r.subject,
            startTime: r.start_time,
            endTime: r.end_time || null,
            durationMinutes: r.duration_minutes,
            location: r.location,
            onlineLink: r.online_link,
            status: r.status,
            studentCount: r.student_count,
            capacity: r.capacity,
            notes: r.notes,
            resources: r.resources,
            type: r.type,
            instructor: {
                id: r.instructor_user_id || r.instructor_id, // Front end expects user ID usually? Or separate ID?
                // Actually frontend Lesson model expects instructor object. 
                // Let's provide what we can.
                id: r.instructor_id, // This is instructor ID
                name: `${r.i_fname || ''} ${r.i_lname || ''}`.trim() 
            },
            studentName: `${r.s_fname || ''} ${r.s_lname || ''}`.trim()
        }));

        return { success: true, data: formatted };
    } catch (error) {
        console.error('Error fetching lessons:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('get-lesson', async (event, id) => {
    try {
        const lesson = await LessonModel.find(id);
        return { success: true, data: lesson };
    } catch (error) {
        console.error('Error fetching lesson:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('add-lesson', async (event, data) => {
    try {
        const newLesson = await LessonModel.create(data);
        return { success: true, data: newLesson };
    } catch (error) {
        console.error('Error adding lesson:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('update-lesson', async (event, { id, ...data }) => {
    try {
        const updatedLesson = await LessonModel.update(id, data);
        return { success: true, data: updatedLesson };
    } catch (error) {
        console.error('Error updating lesson:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('delete-lesson', async (event, id) => {
    try {
        await LessonModel.delete(id);
        return { success: true };
    } catch (error) {
        console.error('Error deleting lesson:', error);
        return { success: false, message: error.message };
    }
});
