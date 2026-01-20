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
            
            const passRateRow = await get('SELECT (CAST(SUM(CASE WHEN score >= 50 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*)) * 100 as rate FROM student_exams');
            
            stats.total_students = studentCountRow.count;
            stats.monthly_revenue = revenueRow.total || 0;
            stats.exams_today = examCountRow.count;
            stats.pass_rate = Math.round(passRateRow.rate || 0);
            stats.system_alerts = 0;
            
        } else if (role === 'instructor') {
            const instructorRow = await get('SELECT id FROM instructors WHERE user_id = ?', [userId]);
            const instructorId = instructorRow ? instructorRow.id : null;

            const lessonsTodayRow = await get('SELECT count(*) as count FROM lessons WHERE instructor_id = ? AND date(start_time) = date("now")', [instructorId]);
            const assignedStudentsRow = await get('SELECT count(*) as count FROM lessons WHERE instructor_id = ?', [instructorId]);
             
             stats.lessons_today = lessonsTodayRow.count;
             stats.assigned_students = assignedStudentsRow.count;
             stats.reports_pending = 0;
             stats.vehicle_issues = 0;

        } else if (role === 'student') {
            const studentRow = await get('SELECT id FROM students WHERE user_id = ?', [userId]);
            const studentId = studentRow ? studentRow.id : null;

            const lessonsAttendedRow = await get('SELECT count(*) as count FROM lessons WHERE student_id = ? AND status="completed"', [studentId]);
            const examsTakenRow = await get('SELECT count(*) as count FROM student_exams WHERE student_id = ?', [studentId]);
            const upcomingLessonsRow = await get('SELECT count(*) as count FROM lessons WHERE student_id = ? AND status="upcoming"', [studentId]);

             stats.lessons_attended = lessonsAttendedRow.count;
             stats.exams_taken = examsTakenRow.count;
             stats.upcoming_lessons = upcomingLessonsRow.count;
             
             const avgScoreRow = await get('SELECT AVG(score) as avg FROM student_exams WHERE student_id = ?', [studentId]);
             stats.success_rate = Math.round(avgScoreRow.avg || 0);
        }

        return { success: true, data: stats };
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return { success: false, message: error.message };
    }
});
