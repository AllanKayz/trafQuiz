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
      // Calculate start and end of "today" for efficient index-friendly queries
      const now = new Date();
      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const todayEnd = new Date(now.setHours(23, 59, 59, 999));

      // Calculate start of current month
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Parallelize admin dashboard queries
      const [
        totalStudents,
        totalInstructors,
        examsToday,
        revenueResult,
        passRateResult,
      ] = await Promise.all([
        Student.count({ where: { status: "active" } }),
        Instructor.count(),
        Exam.count({
          where: {
            start_time: {
              [Op.between]: [todayStart, todayEnd],
            },
          },
        }),
        sequelize.query(
          `
                SELECT sum(amount) as total FROM payments
                WHERE type="income" AND payment_date >= ?
            `,
          {
            replacements: [monthStart.toISOString()],
            type: sequelize.QueryTypes.SELECT,
          },
        ),
        sequelize.query(
          `
                SELECT (CAST(SUM(CASE WHEN score >= 50 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*)) * 100 as rate
                FROM student_exams
            `,
          { type: sequelize.QueryTypes.SELECT },
        ),
      ]);

      stats.total_students = totalStudents;
      stats.total_instructors = totalInstructors;
      stats.exams_today = examsToday;
      stats.monthly_revenue = revenueResult[0]?.total || 0;
      stats.pass_rate = Math.round(passRateResult[0]?.rate || 0);
      stats.system_alerts = 0;
    } else if (role === "instructor") {
      const instructor = await Instructor.findOne({
        where: { user_id: userId },
      });
      const instructorId = instructor?.id;

      if (instructorId) {
        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const todayEnd = new Date(now.setHours(23, 59, 59, 999));

        const { Vehicle } = require("../models/OperationalModels");

        // Parallelize instructor dashboard queries
        const [
          lessonsToday,
          assignedStudents,
          allocatedVehicle,
          upcomingLessons,
        ] = await Promise.all([
          Lesson.count({
            where: {
              instructor_id: instructorId,
              start_time: {
                [Op.between]: [todayStart, todayEnd],
              },
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
          }),
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
        // Parallelize student dashboard queries
        const [lessonsAttended, examStats, upcomingLessons] = await Promise.all([
          Lesson.count({
            where: { student_id: studentId, status: "completed" },
          }),
          sequelize.query(
            `
                SELECT count(*) as count, AVG(score) as avg
                FROM student_exams WHERE student_id = ?
            `,
            {
              replacements: [studentId],
              type: sequelize.QueryTypes.SELECT,
            },
          ),
          Lesson.count({
            where: { student_id: studentId, status: "upcoming" },
          }),
        ]);

        stats.lessons_attended = lessonsAttended;
        stats.exams_taken = examStats[0]?.count || 0;
        stats.success_rate = Math.round(examStats[0]?.avg || 0);
        stats.upcoming_lessons = upcomingLessons;
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
