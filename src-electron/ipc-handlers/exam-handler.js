const { ipcMain } = require('electron');
const { db, get, query, run } = require('../db');

// Helper to determine the best exam for a student
async function getFairExam(studentId) {
    // 1. Get all available exams from questions table (or exams table if authoritative)
    // We'll use exams table as the source of truth for IDs.
    const allExams = await query('SELECT id FROM exams');
    
    if (!allExams || allExams.length === 0) {
        // Fallback if no exams defined? Or just return null which causes error downstream
        // Let's trying grabbing IDs from questions table as backup
        const questionExams = await query('SELECT DISTINCT exam_id FROM questions');
        if (questionExams && questionExams.length > 0) {
             return questionExams[Math.floor(Math.random() * questionExams.length)].exam_id;
        }
        throw new Error('No exams found in the system.');
    }

    const examIds = allExams.map(e => e.id);

    // 2. Get history for this student
    const history = await query('SELECT exam_id, count(*) as count FROM student_exam_history WHERE student_id = ? GROUP BY exam_id', [studentId]);
    
    // Map exam_id -> count
    const usageMap = {};
    examIds.forEach(id => usageMap[id] = 0);
    
    history.forEach(h => {
        if (usageMap[h.exam_id] !== undefined) {
             usageMap[h.exam_id] = h.count;
        }
    });

    // 3. Find the minimum usage count
    let minCount = Infinity;
    Object.values(usageMap).forEach(c => {
        if (c < minCount) minCount = c;
    });

    // 4. Filter exams that have this minimum count
    const candidates = examIds.filter(id => usageMap[id] === minCount);

    // 5. Randomly pick one candidate
    const selectedExamId = candidates[Math.floor(Math.random() * candidates.length)];
    
    return selectedExamId;
}

ipcMain.handle('get-exam-questions', async (event, userId) => {
    try {
        console.log(`Fetching questions for User ID: ${userId}`);
        
        // Resolve Student ID from User ID
        let studentId = null;
        if (userId) {
            const studentRow = await get('SELECT id FROM students WHERE user_id = ?', [userId]);
            if (studentRow) {
                studentId = studentRow.id;
            }
        }
        
        console.log(`Resolved Student ID: ${studentId}`);

        let examId;
        
        if (studentId) {
            try {
                examId = await getFairExam(studentId);
            } catch (e) {
                console.error("Fair exam selection failed, falling back to random:", e);
                // Fallback inside catch handled below
            }
        }
        
        // If Fair Exam failed or no student ID (e.g. admin), fallback to random
        if (!examId) {
            const randomQ = await get('SELECT exam_id FROM questions ORDER BY RANDOM() LIMIT 1');
            if (randomQ) examId = randomQ.exam_id;
            else throw new Error("No questions available.");
        }
        
        console.log(`Selected Exam ID: ${examId}`);

        // Fetch 25 random questions for this exam
        const questions = await query(
            'SELECT * FROM questions WHERE exam_id = ? ORDER BY RANDOM() LIMIT 25',
            [examId]
        );

        // Fetch duration
        let durationRow = await get('SELECT period FROM exam_timeframe WHERE exam_id = ?', [examId]);
        let duration = 30; // Default
        
        if (durationRow) {
            duration = durationRow.period;
        }

        // Record this distribution in history ONLY if valid student
        if (studentId) {
             try {
                await run('INSERT INTO student_exam_history (student_id, exam_id) VALUES (?, ?)', [studentId, examId]);
             } catch (err) {
                 console.error("Failed to record exam history:", err.message);
                 // Don't block the exam start for this
             }
        }

        // Map questions to expected format
        const mappedQuestions = questions.map(q => ({
            id: q.id,
            question: q.question_text,
            option_a: q.option_a,
            option_b: q.option_b,
            option_c: q.option_c,
            answer: q.answer,
            photo: q.img_insert,
            exam_id: q.exam_id
        }));

        return {
            success: true,
            data: {
                examId: examId,
                questions: mappedQuestions,
                duration: duration
            }
        };

    } catch (error) {
        console.error('Error fetching exam questions:', error);
        return { success: false, message: error.message };
    }
});
