const { ipcMain } = require('electron');
const { get } = require('../db');

ipcMain.handle('get-dashboard-stats', async (event, params) => {
    try {
        const { role, userId } = params;
        const stats = {};

        if (role === 'admin') {
            const studentCountRow = await get('SELECT count(*) as count FROM students WHERE status="active"');
            const instructorCountRow = await get('SELECT count(*) as count FROM instructors');
            const examCountRow = await get('SELECT count(*) as count FROM exams WHERE date(start_time) = date("now")');
            const revenueRow = await get('SELECT sum(amount) as total FROM payments WHERE type="income" AND strftime("%Y-%m", payment_date) = strftime("%Y-%m", "now")');
            
            stats.total_students = studentCountRow.count;
            stats.monthly_revenue = revenueRow.total || 0;
            stats.exams_today = examCountRow.count;
            stats.system_alerts = 0; // Placeholder
            
        } else if (role === 'instructor') {
            const lessonsTodayRow = await get('SELECT count(*) as count FROM lessons WHERE instructor_id = (SELECT id FROM instructors WHERE user_id = ?) AND date(start_time) = date("now")', [userId]);
            const assignedStudentsRow = await get('SELECT count(*) as count FROM lessons WHERE instructor_id = (SELECT id FROM instructors WHERE user_id = ?)', [userId]);
             
             stats.lessons_today = lessonsTodayRow.count;
             stats.assigned_students = assignedStudentsRow.count;
             stats.reports_pending = 0;
             stats.vehicle_issues = 0;

        } else if (role === 'student') {
            const lessonsAttendedRow = await get('SELECT count(*) as count FROM lessons WHERE student_id = ? AND status="completed"', [userId]);
             stats.lessons_attended = lessonsAttendedRow.count;
             stats.exams_taken = 0;
             stats.upcoming_lessons = 0;
        }

        return { success: true, data: stats };
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return { success: false, message: error.message };
    }
});
