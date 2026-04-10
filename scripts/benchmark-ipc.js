const { initTestDb, loadHandlers } = require('../tests/integration/setup');
const { setSession } = require('../src-electron/utils/session');
const { performance } = require('perf_hooks');

async function benchmark() {
    console.log('--- IPC Handler Benchmarking ---');
    await initTestDb();
    loadHandlers();

    // Setup sessions and data
    const { Student } = require('../src-electron/models/StudentModel');
    const { Instructor } = require('../src-electron/models/InstructorModel');
    const { User } = require('../src-electron/models/UserModel');
    const { Exam } = require('../src-electron/models/ExamModel');
    const { QuestionModel } = require('../src-electron/models/QuestionModel');
    const { CategoryModel } = require('../src-electron/models/CategoryModel');
    const Payment = require('../src-electron/models/payment');
    const { sequelize } = require('../src-electron/database');

    // Create an admin user
    let adminUser = await User.findOne({ where: { username: 'admin' } });
    if (!adminUser) {
        adminUser = await User.create({
            username: 'admin',
            password: 'password',
            role: 'admin',
            first_name: 'Admin',
            last_name: 'User'
        });
    }

    // Create students and instructors
    for (let i = 0; i < 50; i++) {
        const u = await User.create({
            username: `student${i}`,
            password: 'password',
            role: 'student',
            first_name: 'Student',
            last_name: i.toString()
        });
        await Student.create({ user_id: u.id, status: 'active' });
    }

    for (let i = 0; i < 10; i++) {
        const u = await User.create({
            username: `instructor${i}`,
            password: 'password',
            role: 'instructor',
            first_name: 'Instructor',
            last_name: i.toString()
        });
        await Instructor.create({
            user_id: u.id,
            status: 'active',
            license_number: `LIC-${i}`,
            experience: 5
        });
    }

    const student = await Student.findOne();

    // Create exams and scores
    const now = new Date();
    const future = new Date(now.getTime() + 3600000);
    const exam = await Exam.create({
        name: 'General Theory',
        duration: 30,
        passing_score: 50,
        start_time: now,
        end_time: future
    });
    for (let i = 0; i < 100; i++) {
        await sequelize.query(
            'INSERT INTO student_exams (student_id, exam_id, score, completed_at) VALUES (?, ?, ?, ?)',
            { replacements: [student.id, exam.id, Math.floor(Math.random() * 100), new Date(Date.now() - (i % 30) * 86400000).toISOString().replace('T', ' ').replace('Z', '')] }
        );
    }

    // Create payments
    for (let i = 0; i < 200; i++) {
        await Payment.create({
            student_id: student.id,
            amount: Math.floor(Math.random() * 500) + 50,
            type: i % 3 === 0 ? 'expense' : 'income',
            category: 'test',
            method: 'cash',
            transaction_id: `TXN-${i}-${Date.now()}`,
            status: 'completed',
            payment_date: new Date(Date.now() - (i % 180) * 86400000).toISOString().replace('T', ' ').replace('Z', '')
        });
    }

    // Create questions and categories
    const cat = await CategoryModel.create({ name: 'Road Signs', description: 'Test category' });
    for (let i = 0; i < 500; i++) {
        await QuestionModel.create({
            question_text: `Question ${i}?`,
            option_a: 'A',
            option_b: 'B',
            option_c: 'C',
            answer: 'A',
            category_id: cat.id,
            exam_id: exam.id
        });
    }

    const tests = [
        {
            name: 'get-dashboard-stats (admin)',
            channel: 'get-dashboard-stats',
            args: [{ role: 'admin' }],
            user: adminUser
        },
        {
            name: 'get-financial-stats (admin)',
            channel: 'get-financial-stats',
            args: [],
            user: adminUser
        },
        {
            name: 'get-question-stats',
            channel: 'get-question-stats',
            args: [],
            user: adminUser
        },
        {
            name: 'get-student-progress',
            channel: 'get-student-progress',
            args: [{ studentId: student.id }],
            user: adminUser
        }
    ];

    console.log('Running Benchmarks...');
    const results = [];

    for (const test of tests) {
        setSession(test.user);

        // Warm up
        await global.invokeIPC(test.channel, ...test.args);

        const start = performance.now();
        const iterations = 20;
        for (let i = 0; i < iterations; i++) {
            await global.invokeIPC(test.channel, ...test.args);
        }
        const end = performance.now();
        const avgLatency = (end - start) / iterations;

        results.push({ name: test.name, avgLatency: avgLatency.toFixed(2) + 'ms' });
    }

    console.table(results);
    process.exit(0);
}

benchmark().catch(err => {
    console.error(err);
    process.exit(1);
});
