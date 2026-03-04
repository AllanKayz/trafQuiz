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
      const today = new Date().toISOString().split("T")[0];
      const currentMonth = today.substring(0, 7);

      // PERFORMANCE: Parallelize admin dashboard queries
      const [studentsCount, instructorsCount, examsTodayCount, revenueResult, passRateResult] = await Promise.all([
        Student.count({ where: { status: "active" } }),
        Instructor.count(),
        Exam.count({
          where: sequelize.where(
            sequelize.fn("date", sequelize.col("start_time")),
            today
          ),
        }),
        sequelize.query(
          `SELECT sum(amount) as total FROM payments
           WHERE type="income" AND strftime("%Y-%m", payment_date) = ?`,
          { replacements: [currentMonth] }
        ),
        sequelize.query(`
          SELECT (CAST(SUM(CASE WHEN score >= 50 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*)) * 100 as rate
          FROM student_exams
        `)
      ]);

      stats.total_students = studentsCount;
      stats.total_instructors = instructorsCount;
      stats.exams_today = examsTodayCount;
      stats.monthly_revenue = revenueResult[0][0]?.total || 0;
      stats.pass_rate = Math.round(passRateResult[0][0]?.rate || 0);
      stats.system_alerts = 0;
    } else if (role === "instructor") {
      const instructor = await Instructor.findOne({
        where: { user_id: userId },
      });
      const instructorId = instructor?.id;

      const today = new Date().toISOString().split("T")[0];
      const { Vehicle } = require("../models/OperationalModels");

      if (instructorId) {
        // PERFORMANCE: Parallelize instructor dashboard queries
        const [lessonsToday, assignedStudents, allocatedVehicle, upcomingLessons] = await Promise.all([
          Lesson.count({
            where: {
              instructor_id: instructorId,
              [Op.and]: sequelize.where(
                sequelize.fn("date", sequelize.col("start_time")),
                today,
              ),
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

        stats.lessons_today = lessonsToday;
        stats.assigned_students = assignedStudents;
        stats.allocated_vehicle = allocatedVehicle;
        stats.upcoming_lessons = upcomingLessons;
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
        // PERFORMANCE: Parallelize student dashboard queries
        const [attendedCount, examStatsResult, upcomingCount] = await Promise.all([
          Lesson.count({
            where: { student_id: studentId, status: "completed" },
          }),
          sequelize.query(
            `SELECT count(*) as count, AVG(score) as avg
             FROM student_exams WHERE student_id = ?`,
            { replacements: [studentId] }
          ),
          Lesson.count({
            where: { student_id: studentId, status: "upcoming" },
          })
        ]);

        stats.lessons_attended = attendedCount;
        stats.exams_taken = examStatsResult[0][0]?.count || 0;
        stats.success_rate = Math.round(examStatsResult[0][0]?.avg || 0);
        stats.upcoming_lessons = upcomingCount;
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
