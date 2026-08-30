const { query, get } = require('../db');
const { getRecentMonthsBoundaries } = require('../utils/date-utils');

class ProgressModel {
    static async getProgress(studentId) {
        // Parallelize database queries to improve performance
        const [stats, recent, monthly] = await Promise.all([
            // Calculate stats from student_exams
            get(`
                SELECT
                    COUNT(*) as totalTests,
                    AVG(score) as averageScore
                FROM student_exams
                WHERE student_id = ?
            `, [studentId]),

            // Recent activity
            query(`
                SELECT se.*, e.name as examName
                FROM student_exams se
                JOIN exams e ON se.exam_id = e.id
                WHERE se.student_id = ?
                ORDER BY se.completed_at DESC
                LIMIT 5
            `, [studentId]),

            // Monthly performance
            query(`
                SELECT SUBSTR(completed_at, 1, 7) as month, AVG(score) as avgScore
                FROM student_exams
                WHERE student_id = ? AND completed_at BETWEEN ? AND ?
                GROUP BY month
                ORDER BY month ASC
            `, [studentId, getRecentMonthsBoundaries(12).start, getRecentMonthsBoundaries(12).end])
        ]);

        return {
            studentId,
            totalTests: stats.totalTests || 0,
            averageScore: Math.round(stats.averageScore || 0),
            completionRate: Math.min(100, (stats.totalTests || 0) * 5), // Each exam adds 5% towards 'completion'
            recentActivity: recent.map(r => ({
                id: r.id,
                name: r.examName,
                date: r.completed_at,
                score: r.score,
                status: r.score >= 50 ? 'pass' : 'fail'
            })),
            monthlyPerformance: monthly.map(m => ({
                month: m.month,
                score: Math.round(m.avgScore)
            }))
        };
    }
}

module.exports = ProgressModel;
