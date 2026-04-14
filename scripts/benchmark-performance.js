const { initTestDb, loadHandlers } = require('../tests/integration/setup');
const { performance } = require('perf_hooks');

async function benchmark(name, fn) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    console.log(`${name}: ${(end - start).toFixed(2)}ms`);
    return end - start;
}

async function runBenchmarks() {
    console.log('--- Benchmarking IPC Handlers ---');
    try {
        await initTestDb();
        loadHandlers();

        // Seed some data for benchmarking
        const { sequelize } = require('../src-electron/database');
        const { Student } = require('../src-electron/models/StudentModel');
        const { User } = require('../src-electron/models/UserModel');
        const { Exam } = require('../src-electron/models/ExamModel');
        const Payment = require('../src-electron/models/payment');
        const { Question } = require('../src-electron/models/QuestionModel');

        console.log('Seeding data for benchmark...');

        // Use a transaction for faster seeding
        await sequelize.transaction(async (t) => {
            const user = await User.create({
                username: 'teststudent',
                password: 'password',
                role: 'student',
                first_name: 'Test',
                last_name: 'Student',
                email: 'test@student.com'
            }, { transaction: t });

            const student = await Student.create({
                user_id: user.id,
                status: 'active',
                enrollment_date: new Date()
            }, { transaction: t });

            const exam = await Exam.create({
                name: 'Benchmark Exam',
                description: 'Test',
                total_questions: 10,
                passing_score: 50,
                duration: 30,
                start_time: new Date(),
                end_time: new Date()
            }, { transaction: t });

            // Create 100 student exams
            const studentExams = [];
            for (let i = 0; i < 100; i++) {
                studentExams.push({
                    student_id: student.id,
                    exam_id: exam.id,
                    score: Math.floor(Math.random() * 100),
                    completed_at: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30 * 6) // Last 6 months
                });
            }
            await sequelize.getQueryInterface().bulkInsert('student_exams', studentExams, { transaction: t });

            // Create 1000 questions
            const questions = [];
            for (let i = 0; i < 1000; i++) {
                questions.push({
                    question_text: `Question ${i}`,
                    answer: 'A',
                    exam_id: exam.id
                });
            }
            await Question.bulkCreate(questions, { transaction: t });

            // Create 500 payments
            const payments = [];
            for (let i = 0; i < 500; i++) {
                payments.push({
                    amount: Math.random() * 100,
                    type: i % 2 === 0 ? 'income' : 'expense',
                    payment_date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30 * 6),
                    status: 'completed',
                    transaction_id: `TXN-${i}`
                });
            }
            await Payment.bulkCreate(payments, { transaction: t });
        });

        console.log('Data seeded. Running benchmarks...\n');

        // Establish session
        const { setSession } = require('../src-electron/utils/session');
        setSession({ id: 1, role: 'admin' });

        const iterations = 5;

        const results = {
            'get-student-progress': [],
            'get-question-stats': [],
            'get-financial-stats': []
        };

        for (let i = 0; i < iterations; i++) {
            results['get-student-progress'].push(await benchmark(`get-student-progress (Run ${i+1})`, () =>
                global.invokeIPC('get-student-progress', { studentId: 1 })
            ));

            results['get-question-stats'].push(await benchmark(`get-question-stats (Run ${i+1})`, () =>
                global.invokeIPC('get-question-stats')
            ));

            results['get-financial-stats'].push(await benchmark(`get-financial-stats (Run ${i+1})`, () =>
                global.invokeIPC('get-financial-stats')
            ));
            console.log('');
        }

        console.log('--- Averages ---');
        for (const key in results) {
            const avg = results[key].reduce((a, b) => a + b, 0) / iterations;
            console.log(`${key}: ${avg.toFixed(2)}ms`);
        }

    } catch (error) {
        console.error('Benchmark failed:', error);
    }
}

runBenchmarks();
