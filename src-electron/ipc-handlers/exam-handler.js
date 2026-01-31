const { ipcMain } = require('electron');
const { Exam, ExamModel, StudentExamHistory, ExamTimeframe } = require('../models/ExamModel');
const { Question, QuestionModel } = require('../models/QuestionModel');
const { Student } = require('../models/StudentModel');
const { sequelize } = require('../database');
const { Op } = require('sequelize');

async function getFairExam(studentId) {
    const allExams = await Exam.findAll({ attributes: ['id'] });
    if (!allExams || allExams.length === 0) {
        const questionExams = await Question.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('exam_id')), 'exam_id']],
            raw: true
        });
        if (questionExams && questionExams.length > 0) {
             return questionExams[Math.floor(Math.random() * questionExams.length)].exam_id;
        }
        throw new Error('No exams found in the system.');
    }

    const examIds = allExams.map(e => e.id);
    const history = await StudentExamHistory.findAll({
        attributes: ['exam_id', [sequelize.fn('count', sequelize.col('id')), 'count']],
        where: { student_id: studentId },
        group: ['exam_id'],
        raw: true
    });
    
    const usageMap = {};
    examIds.forEach(id => usageMap[id] = 0);
    history.forEach(h => {
        if (usageMap[h.exam_id] !== undefined) {
             usageMap[h.exam_id] = h.count;
        }
    });

    let minCount = Infinity;
    Object.values(usageMap).forEach(c => {
        if (c < minCount) minCount = c;
    });

    const candidates = examIds.filter(id => usageMap[id] === minCount);
    return candidates[Math.floor(Math.random() * candidates.length)];
}

ipcMain.handle('get-exam-questions', async (event, userId) => {
    try {
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
            limit: 25
        });

        const durationRow = await ExamTimeframe.findOne({ where: { exam_id: examId } });
        const duration = durationRow ? durationRow.period : 30;

        if (studentId) {
            try {
                await StudentExamHistory.create({ student_id: studentId, exam_id: examId });
            } catch (err) {
                console.error("Failed to record exam history:", err.message);
            }
        }

        return {
            success: true,
            data: {
                examId: examId,
                questions: questions.map(q => ({
                    id: q.id,
                    question: q.question_text,
                    option_a: q.option_a,
                    option_b: q.option_b,
                    option_c: q.option_c,
                    answer: q.answer,
                    photo: q.img_insert,
                    exam_id: q.exam_id
                })),
                duration: duration
            }
        };
    } catch (error) {
        console.error('Error fetching exam questions:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('get-exams', async (event) => {
    try {
        const exams = await ExamModel.findAll();
        return { success: true, data: exams };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('add-exam', async (event, exam) => {
    try {
        const result = await ExamModel.create(exam);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('update-exam', async (event, exam) => {
    try {
        const result = await ExamModel.update(exam.id, exam);
        return { success: true, data: result };
    } catch (error) {
        return { success: false, message: error.message };
    }
});

ipcMain.handle('delete-exam', async (event, id) => {
    try {
        await ExamModel.delete(id);
        return { success: true };
    } catch (error) {
        return { success: false, message: error.message };
    }
});
