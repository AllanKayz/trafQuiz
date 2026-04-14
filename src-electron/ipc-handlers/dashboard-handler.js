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

    if (role === "admin") {
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const [total_students, total_instructors, exams_today, revenueResult, passRateResult] = await Promise.all([
        Student.count({ where: { status: "active" } }),
        Instructor.count(),
        // Optimized: Range comparison instead of fn('date') to use indexes
        Exam.count({
          where: {
            start_time: {
              [Op.between]: [startOfDay, endOfDay]
            }
          }
        }),
        // Optimized: Combined into Promise.all
        sequelize.query(`
          SELECT sum(amount) as total FROM payments
          WHERE type="income" AND strftime("%Y-%m", payment_date) = strftime("%Y-%m", "now")
        `),
        sequelize.query(`
          SELECT (CAST(SUM(CASE WHEN score >= 50 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*)) * 100 as rate
          FROM student_exams
        `)
      ]);

      stats.total_students = total_students;
      stats.total_instructors = total_instructors;
      stats.exams_today = exams_today;
      stats.monthly_revenue = revenueResult[0][0]?.total || 0;
      stats.pass_rate = Math.round(passRateResult[0][0]?.rate || 0);
      stats.system_alerts = 0;
    } else if (role === "instructor") {
      const instructor = await Instructor.findOne({
        where: { user_id: userId },
      });
      const instructorId = instructor?.id;

      if (instructorId) {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        const { Vehicle } = require("../models/OperationalModels");

        const [lessons_today, assigned_students, allocated_vehicle, upcoming_lessons] = await Promise.all([
          // Optimized: Range comparison
          Lesson.count({
            where: {
              instructor_id: instructorId,
              start_time: { [Op.between]: [startOfDay, endOfDay] }
            },
          }),
          Lesson.count({
            where: { instructor_id: instructorId },
            distinct: true,
            col: "student_id",
          }),
          Vehicle.findOne({
            where: { instructor_id: instructorId, status: "active" },
            raw: true,
          }),
          Lesson.findAll({
            where: {
              instructor_id: instructorId,
              start_time: { [Op.gte]: new Date() },
            },
            limit: 5,
            order: [["start_time", "ASC"]],
            raw: true,
          })
        ]);

        stats.lessons_today = lessons_today;
        stats.assigned_students = assigned_students;
        stats.allocated_vehicle = allocated_vehicle;
        stats.upcoming_lessons = upcoming_lessons;
      } else {
        stats.lessons_today = 0;
        stats.assigned_students = 0;
        stats.allocated_vehicle = null;
        stats.upcoming_lessons = [];
      }

      stats.reports_pending = 0;
      stats.vehicle_issues = 0;
    } else if (role === "student") {
      const student = await Student.findOne({ where: { user_id: userId } });
      const studentId = student?.id;

      if (studentId) {
        const [lessons_attended, examStats, upcoming_lessons] = await Promise.all([
          Lesson.count({
            where: { student_id: studentId, status: "completed" },
          }),
          sequelize.query(
            `
              SELECT count(*) as count, AVG(score) as avg
              FROM student_exams WHERE student_id = ?
            `,
            { replacements: [studentId] }
          ),
          Lesson.count({
            where: { student_id: studentId, status: "upcoming" },
          })
        ]);

        stats.lessons_attended = lessons_attended;
        stats.exams_taken = examStats[0][0]?.count || 0;
        stats.success_rate = Math.round(examStats[0][0]?.avg || 0);
        stats.upcoming_lessons = upcoming_lessons;
      } else {
        stats.lessons_attended = 0;
        stats.exams_taken = 0;
        stats.success_rate = 0;
        stats.upcoming_lessons = 0;
      }
    }

    return { success: true, data: stats };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return { success: false, message: error.message };
  }
});
