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

ipcMain.handle('set-exam-timeframe', async (event, { time, period, examId }) => {
    try {
        // Accept period (minutes) directly, or convert from time (seconds)
        const durationMinutes = period || Math.ceil(time / 60); 
        if (examId) {
            await run('INSERT INTO exam_timeframe (exam_id, period) VALUES (?, ?) ON CONFLICT(exam_id) DO UPDATE SET period = EXCLUDED.period, updated_at = CURRENT_TIMESTAMP', [examId, durationMinutes]);
        } else {
            // Global update - update all or just the first one?
            // Let's update all existing ones and ensure if none exist, we might have an issue.
            // But usually this would be called for a specific context.
            // For now, let's update all.
            await run('UPDATE exam_timeframe SET period = ?, updated_at = CURRENT_TIMESTAMP', [durationMinutes]);
            // And if none exist?
            const exist = await get('SELECT id FROM exam_timeframe LIMIT 1');
            if(!exist) {
                // If no exams yet, we can't really set a timeframe that links to one.
                // But we can try to find the first exam.
                const firstExam = await get('SELECT id FROM exams LIMIT 1');
                if(firstExam) {
                    await run('INSERT INTO exam_timeframe (exam_id, period) VALUES (?, ?)', [firstExam.id, durationMinutes]);
                }
            }
        }
        return { success: true, message: 'Exam timeframe updated successfully', new_time: time };
    } catch (error) {
        console.error('Set exam timeframe error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('auto-allocate-exams', async (event, { date, capacity }) => {
    try {
        // 1. Find or create an exam for this date
        let exam = await get('SELECT id FROM exams WHERE date(start_time) = ? LIMIT 1', [date]);
        if (!exam) {
            const result = await run('INSERT INTO exams (name, start_time, end_time) VALUES (?, ?, ?)', 
                [`Exam ${date}`, `${date} 09:00:00`, `${date} 11:00:00`]);
            exam = { id: result.lastID };
        }

        // 2. Find students who haven't take this exam and are active
        // Simplistic: just take up to 'capacity' students who haven't taken any exam today
        const students = await query(`
            SELECT s.id 
            FROM students s
            WHERE s.status = 'active'
            AND s.id NOT IN (SELECT student_id FROM student_exams WHERE date(completed_at) = ?)
            LIMIT ?
        `, [date, capacity]);

        let allocatedCount = 0;
        for (const student of students) {
            await run('INSERT OR IGNORE INTO student_exams (student_id, exam_id, score, completed_at) VALUES (?, ?, 0, ?)', 
                [student.id, exam.id, `${date} 09:00:00`]);
            allocatedCount++;
        }

        return { 
            success: true, 
            message: `Successfully allocated ${allocatedCount} students to exam on ${date}` 
        };
    } catch (error) {
        console.error('Auto allocate exams error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('get-exams', async () => {
    try {
        const exams = await query('SELECT * FROM exams ORDER BY start_time DESC');
        return { success: true, data: exams };
    } catch (error) {
        console.error('Get exams error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('add-exam', async (event, data) => {
    try {
        const result = await run(
            'INSERT INTO exams (name, start_time, end_time) VALUES (?, ?, ?)',
            [data.name, data.start_time, data.end_time]
        );
        return { success: true, id: result.lastID };
    } catch (error) {
        console.error('Add exam error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('update-exam', async (event, data) => {
    try {
        await run(
            'UPDATE exams SET name = ?, start_time = ?, end_time = ? WHERE id = ?',
            [data.name, data.start_time, data.end_time, data.id]
        );
        return { success: true };
    } catch (error) {
        console.error('Update exam error:', error);
        return { success: false, message: error.message };
    }
});

ipcMain.handle('delete-exam', async (event, id) => {
    try {
        await run('DELETE FROM exams WHERE id = ?', [id]);
        return { success: true };
    } catch (error) {
        console.error('Delete exam error:', error);
        return { success: false, message: error.message };
    }
});
