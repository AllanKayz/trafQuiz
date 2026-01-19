const { ipcMain } = require('electron');

ipcMain.handle('seed-lessons', async (event, { count = 5 }) => {
    try {
        const LessonModel = require('../models/LessonModel');
        const instructors = await require('../models/InstructorModel').all();
        const students = await require('../models/StudentModel').all();
        
        if (instructors.length === 0) {
           return { success: false, message: 'No instructors found to assign lessons to.' };
        }

        const seeded = [];
        for (let i = 0; i < count; i++) {
            const lessonData = {
                title: `Auto-Seeded Lesson ${i + 1}`,
                subject: i % 2 === 0 ? 'Theory' : 'Practical',
                startTime: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19),
                instructorId: instructors[i % instructors.length].id,
                studentId: students.length > 0 ? students[i % students.length].id : null,
                status: 'upcoming',
                type: i % 2 === 0 ? 'group' : 'individual',
                capacity: 10
            };
            const result = await LessonModel.create(lessonData);
            seeded.push(result.lastID);
        }
        
        return { success: true, message: `Successfully seeded ${seeded.length} lessons.`, ids: seeded };
    } catch (error) {
        console.error('Seed Lessons Error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('check-lessons', async () => {
    try {
        const { query } = require('../db');
        const stats = await query('SELECT status, COUNT(*) as count FROM lessons GROUP BY status');
        const total = stats.reduce((acc, curr) => acc + curr.count, 0);
        
        return { 
            success: true, 
            status: total > 0 ? 'Data present' : 'Empty',
            stats,
            total
        };
    } catch (error) {
        console.error('Check Lessons Error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('get-all-users', async () => {
    try {
         const { query } = require('../db');
         // Join with students/instructors/etc if needed for extra info, but basic users list is mostly from users table
         // Just return users row for now, omit passwords
         const users = await query('SELECT id, username, first_name, last_name, email, role, phone, created_at FROM users');
         
         const formatted = users.map(u => ({
             ...u,
             name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username
         }));

         return { success: true, data: formatted };
    } catch (error) {
        console.error('Get All Users Error:', error);
        return { success: false, message: error.message };
    }
});
