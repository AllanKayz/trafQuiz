const { ipcMain } = require("electron");
const { User } = require("../models/UserModel");
const { Student } = require("../models/StudentModel");
const { Instructor } = require("../models/InstructorModel");
const { Exam, StudentExam } = require("../models/ExamModel");
const { Lesson } = require("../models/OperationalModels");
const Payment = require("../models/payment");
const { sequelize } = require("../database");
const { Op } = require("sequelize");
const { isAuthenticated } = require("../utils/session");

ipcMain.handle("get-dashboard-stats", async (event, params) => {
  try {
    if (!isAuthenticated()) return { success: false, message: "Unauthorized" };
    const { role, userId } = params;
    const stats = {};

    if (role === "admin") {
      stats.total_students = await Student.count({
        where: { status: "active" },
      });
      stats.total_instructors = await Instructor.count();

      // Use index-friendly range queries for dates
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const endOfToday = new Date();
      endOfToday.setHours(23, 59, 59, 999);

      stats.exams_today = await Exam.count({
        where: {
          start_time: {
            [Op.between]: [startOfToday, endOfToday],
          },
        },
      });

      // Monthly Revenue optimization: use range query and Payment model
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const endOfMonth = new Date(
        startOfMonth.getFullYear(),
        startOfMonth.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      stats.monthly_revenue =
        (await Payment.sum("amount", {
          where: {
            type: "income",
            payment_date: {
              [Op.between]: [startOfMonth, endOfMonth],
            },
          },
        })) || 0;

      // Pass Rate optimization: use StudentExam model
      const totalExams = await StudentExam.count();
      if (totalExams > 0) {
        const passedExams = await StudentExam.count({
          where: {
            score: { [Op.gte]: 50 },
          },
        });
        stats.pass_rate = Math.round((passedExams / totalExams) * 100);
      } else {
        stats.pass_rate = 0;
      }
      stats.system_alerts = 0;
    } else if (role === "instructor") {
      const instructor = await Instructor.findOne({
        where: { user_id: userId },
      });
      const instructorId = instructor?.id;

      const startOfTodayForInst = new Date();
      startOfTodayForInst.setHours(0, 0, 0, 0);
      const endOfTodayForInst = new Date();
      endOfTodayForInst.setHours(23, 59, 59, 999);

      stats.lessons_today = instructorId
        ? await Lesson.count({
            where: {
              instructor_id: instructorId,
              start_time: {
                [Op.between]: [startOfTodayForInst, endOfTodayForInst],
              },
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
