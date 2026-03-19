const { ipcMain } = require("electron");
const { User } = require("../models/UserModel");
const { Student } = require("../models/StudentModel");
const { Instructor } = require("../models/InstructorModel");
const { Exam } = require("../models/ExamModel");
const { Lesson } = require("../models/OperationalModels");
const { sequelize } = require("../database");
const { Op } = require("sequelize");
const { isAuthenticated } = require("../utils/session");

ipcMain.handle("get-dashboard-stats", async (event, params) => {
  try {
    if (!isAuthenticated()) return { success: false, message: "Unauthorized" };
    const { role, userId } = params;
    const stats = {};

    // Define common date ranges once to reuse and ensure index-friendly queries
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    if (role === "admin") {
      stats.total_students = await Student.count({
        where: { status: "active" },
      });
      stats.total_instructors = await Instructor.count();

      stats.exams_today = await Exam.count({
        where: {
          start_time: {
            [Op.between]: [todayStart, todayEnd]
          }
        }
      });

      // Revenue - needs Payment model, but let's assume it's in OperationalModels or similar
      // Optimized: Use index-friendly date range for the current month (start and end)
      const monthStart = new Date(todayStart);
      monthStart.setDate(1);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setMilliseconds(-1);

      const [revenueResult] = await sequelize.query(`
                SELECT sum(amount) as total FROM payments
                WHERE type="income" AND payment_date BETWEEN ? AND ?
            `, {
              replacements: [
                monthStart.toISOString().replace('T', ' ').replace('Z', ''),
                monthEnd.toISOString().replace('T', ' ').replace('Z', '')
              ]
            });
      stats.monthly_revenue = revenueResult[0]?.total || 0;

      const [passRateResult] = await sequelize.query(`
                SELECT (CAST(SUM(CASE WHEN score >= 50 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*)) * 100 as rate
                FROM student_exams
            `);
      stats.pass_rate = Math.round(passRateResult[0]?.rate || 0);
      stats.system_alerts = 0;
    } else if (role === "instructor") {
      const instructor = await Instructor.findOne({
        where: { user_id: userId },
      });
      const instructorId = instructor?.id;

      stats.lessons_today = instructorId
        ? await Lesson.count({
            where: {
              instructor_id: instructorId,
              start_time: {
                [Op.between]: [todayStart, todayEnd]
              }
            },
          })
        : 0;

      stats.assigned_students = instructorId
        ? await Lesson.count({
            where: { instructor_id: instructorId },
            distinct: true,
            col: "student_id",
          })
        : 0;

      // Fetch allocated vehicle
      const { Vehicle } = require("../models/OperationalModels");
      stats.allocated_vehicle = instructorId
        ? await Vehicle.findOne({
            where: { instructor_id: instructorId, status: "active" },
            raw: true,
          })
        : null;

      // Fetch upcoming lessons (next 5)
      stats.upcoming_lessons = instructorId
        ? await Lesson.findAll({
            where: {
              instructor_id: instructorId,
              start_time: { [Op.gte]: new Date() },
            },
            limit: 5,
            order: [["start_time", "ASC"]],
            raw: true,
          })
        : [];

      stats.reports_pending = 0;
      stats.vehicle_issues = 0;
    } else if (role === "student") {
      const student = await Student.findOne({ where: { user_id: userId } });
      const studentId = student?.id;

      stats.lessons_attended = studentId
        ? await Lesson.count({
            where: { student_id: studentId, status: "completed" },
          })
        : 0;

      // Student Exams
      const [examStats] = await sequelize.query(
        `
                SELECT count(*) as count, AVG(score) as avg
                FROM student_exams WHERE student_id = ?
            `,
        { replacements: [studentId] },
      );

      stats.exams_taken = examStats[0]?.count || 0;
      stats.success_rate = Math.round(examStats[0]?.avg || 0);

      stats.upcoming_lessons = studentId
        ? await Lesson.count({
            where: { student_id: studentId, status: "upcoming" },
          })
        : 0;
    }

    return { success: true, data: stats };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return { success: false, message: error.message };
  }
});
