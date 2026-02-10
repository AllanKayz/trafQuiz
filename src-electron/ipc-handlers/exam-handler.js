const { ipcMain } = require("electron");
const {
  Exam,
  ExamModel,
  StudentExamHistory,
  ExamTimeframe,
  StudentExam,
} = require("../models/ExamModel");
const { broadcastChange } = require("../utils/broadcast");
const { Question, QuestionModel } = require("../models/QuestionModel");
const { Student } = require("../models/StudentModel");
const { sequelize } = require("../database");
const { Op } = require("sequelize");
const { isAuthenticated, isAdmin } = require("../utils/session");

async function getFairExam(studentId) {
  const allExams = await Exam.findAll({ attributes: ["id"] });
  if (!allExams || allExams.length === 0) {
    const questionExams = await Question.findAll({
      attributes: [
        [sequelize.fn("DISTINCT", sequelize.col("exam_id")), "exam_id"],
      ],
      raw: true,
    });
    if (questionExams && questionExams.length > 0) {
      return questionExams[Math.floor(Math.random() * questionExams.length)]
        .exam_id;
    }
    throw new Error("No exams found in the system.");
  }

  const examIds = allExams.map((e) => e.id);
  const history = await StudentExamHistory.findAll({
    attributes: [
      "exam_id",
      [sequelize.fn("count", sequelize.col("id")), "count"],
    ],
    where: { student_id: studentId },
    group: ["exam_id"],
    raw: true,
  });

  const usageMap = {};
  examIds.forEach((id) => (usageMap[id] = 0));
  history.forEach((h) => {
    if (usageMap[h.exam_id] !== undefined) {
      usageMap[h.exam_id] = h.count;
    }
  });

  let minCount = Infinity;
  Object.values(usageMap).forEach((c) => {
    if (c < minCount) minCount = c;
  });

  const candidates = examIds.filter((id) => usageMap[id] === minCount);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

ipcMain.handle("get-exam-questions", async (event, userId) => {
  try {
    if (!isAuthenticated()) return { success: false, message: "Unauthorized" };
    let studentId = null;
    if (userId) {
      const student = await Student.findOne({ where: { user_id: userId } });
      if (student) studentId = student.id;
    }

    let examId;
    if (studentId) {
      try {
        examId = await getFairExam(studentId);
      } catch (e) {
        console.error("Fair exam selection failed:", e);
      }
    }

    if (!examId) {
      const randomQ = await Question.findOne({ order: sequelize.random() });
      if (randomQ) examId = randomQ.exam_id;
      else throw new Error("No questions available.");
    }

    const questions = await Question.findAll({
      where: { exam_id: examId },
      order: sequelize.random(),
      limit: 25,
    });

    const durationRow = await ExamTimeframe.findOne({
      where: { exam_id: examId },
    });
    const duration = durationRow ? durationRow.period : 30;

    if (studentId) {
      try {
        await StudentExamHistory.create({
          student_id: studentId,
          exam_id: examId,
        });
      } catch (err) {
        console.error("Failed to record exam history:", err.message);
      }
    }

    return {
      success: true,
      data: {
        examId: examId,
        questions: questions.map((q) => ({
          id: q.id,
          question: q.question_text,
          option_a: q.option_a,
          option_b: q.option_b,
          option_c: q.option_c,
          answer: q.answer,
          photo: q.img_insert,
          exam_id: q.exam_id,
        })),
        duration: duration,
      },
    };
  } catch (error) {
    console.error("Error fetching exam questions:", error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle("get-exams", async (event) => {
  try {
    if (!isAuthenticated()) return { success: false, message: "Unauthorized" };
    const exams = await ExamModel.findAll();
    return { success: true, data: exams };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle("add-exam", async (event, exam) => {
  try {
    if (!isAdmin()) return { success: false, message: "Unauthorized" };
    const result = await ExamModel.create(exam);
    broadcastChange("exams", "create", result);
    return { success: true, id: result.id };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle("update-exam", async (event, exam) => {
  try {
    if (!isAdmin()) return { success: false, message: "Unauthorized" };
    const result = await ExamModel.update(exam.id, exam);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle("delete-exam", async (event, id) => {
  try {
    if (!isAdmin()) return { success: false, message: "Unauthorized" };
    await ExamModel.delete(id);
    broadcastChange("exams", "delete", { id });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle("get-exam-statistics", async () => {
  try {
    if (!isAdmin()) return { success: false, message: "Unauthorized" };
    const passCount = await StudentExam.count({
      where: { score: { [Op.gte]: 50 } },
    });
    const failCount = await StudentExam.count({
      where: { score: { [Op.lt]: 50 } },
    });

    const [recentExams] = await sequelize.query(`
            SELECT e.id, e.name, COUNT(se.id) as candidates 
            FROM exams e 
            LEFT JOIN student_exams se ON e.id = se.exam_id 
            GROUP BY e.id 
            ORDER BY e.id DESC 
            LIMIT 5
        `);

    return {
      success: true,
      data: {
        pass_count: passCount,
        fail_count: failCount,
        recent_exams: recentExams || [],
      },
    };
  } catch (error) {
    console.error("Get exam statistics error:", error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle("get-exam-timeframe", async () => {
  try {
    if (!isAdmin()) return { success: false, message: "Unauthorized" };
    const timeframe = await ExamTimeframe.findOne({ where: { exam_id: 0 } });
    return {
      success: true,
      data: { period: timeframe ? timeframe.period : 30 },
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle("set-exam-timeframe", async (event, data) => {
  try {
    if (!isAdmin()) return { success: false, message: "Unauthorized" };
    const [timeframe, created] = await ExamTimeframe.findOrCreate({
      where: { exam_id: 0 },
      defaults: { period: data.period },
    });

    if (!created) {
      await timeframe.update({ period: data.period });
    }

    return { success: true, data: timeframe };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle("auto-allocate-exams", async (event, { date, capacity }) => {
  try {
    if (!isAdmin()) return { success: false, message: "Unauthorized" };
    if (!date || !capacity) {
      return { success: false, message: 'Date and capacity are required' };
    }

    // Allocate exams to available students for the given date and capacity
    const allocations = await StudentExam.findAll({
      where: {
        exam_date: date,
        status: { [Op.in]: ['pending', 'scheduled'] }
      },
      limit: capacity,
      raw: true
    });

    if (allocations.length === 0) {
      return { 
        success: true, 
        message: `No exams allocated for ${date}`,
        data: { allocated: 0, date, capacity }
      };
    }

    // Update the allocated exams status
    await StudentExam.update(
      { status: 'allocated' },
      {
        where: {
          id: allocations.map(a => a.id)
        }
      }
    );

    broadcastChange('exams', 'allocate', { date, count: allocations.length });

    return { 
      success: true, 
      message: `${allocations.length} exams allocated successfully`,
      data: { allocated: allocations.length, date, capacity }
    };
  } catch (error) {
    console.error('Auto-allocate exams error:', error);
    return { success: false, message: error.message };
  }
});
