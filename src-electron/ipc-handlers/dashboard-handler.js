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

      // Performance Optimization: Use range-based query for today's exams to utilize indexes
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      stats.exams_today = await Exam.count({
        where: {
          start_time: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
      });

      // Performance Optimization: Use range-based query for monthly revenue
      const firstDayOfMonth = new Date();
      firstDayOfMonth.setDate(1);
      firstDayOfMonth.setHours(0, 0, 0, 0);

      const lastDayOfMonth = new Date(
        firstDayOfMonth.getFullYear(),
        firstDayOfMonth.getMonth() + 1,
        0,
      );
      lastDayOfMonth.setHours(23, 59, 59, 999);

      stats.monthly_revenue =
        (await Payment.sum("amount", {
          where: {
            type: "income",
            payment_date: {
              [Op.between]: [firstDayOfMonth, lastDayOfMonth],
            },
          },
        })) || 0;

      // Performance Optimization: Use single query for pass rate to minimize round-trips
      const examStats = await StudentExam.findOne({
        attributes: [
          [sequelize.fn("COUNT", sequelize.col("id")), "total"],
          [
            sequelize.fn(
              "SUM",
              sequelize.literal("CASE WHEN score >= 50 THEN 1 ELSE 0 END"),
            ),
            "passCount",
          ],
        ],
        raw: true,
      });
      const totalExams = Number(examStats?.total) || 0;
      const passCount = Number(examStats?.passCount) || 0;
      stats.pass_rate =
        totalExams > 0 ? Math.round((passCount / totalExams) * 100) : 0;
      stats.system_alerts = 0;
    } else if (role === "instructor") {
      const instructor = await Instructor.findOne({
        where: { user_id: userId },
      });
      const instructorId = instructor?.id;

      // Performance Optimization: Use range-based query for today's lessons
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      stats.lessons_today = instructorId
        ? await Lesson.count({
            where: {
              instructor_id: instructorId,
              start_time: {
                [Op.between]: [startOfDay, endOfDay],
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

      // Performance Optimization: Use StudentExam model for student stats
      if (studentId) {
        stats.exams_taken = await StudentExam.count({
          where: { student_id: studentId },
        });
        const avgScore = await StudentExam.findOne({
          attributes: [[sequelize.fn("AVG", sequelize.col("score")), "avg"]],
          where: { student_id: studentId },
          raw: true,
        });
        stats.success_rate = Math.round(avgScore?.avg || 0);
      } else {
        stats.exams_taken = 0;
        stats.success_rate = 0;
      }

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
