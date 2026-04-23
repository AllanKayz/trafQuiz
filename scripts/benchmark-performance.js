const { initTestDb, loadHandlers } = require('../tests/integration/setup');
const { User } = require('../src-electron/models/UserModel');
const { Student } = require('../src-electron/models/StudentModel');
const { Exam } = require('../src-electron/models/ExamModel');
const { Lesson, Vehicle } = require('../src-electron/models/OperationalModels');
const { Instructor } = require('../src-electron/models/InstructorModel');
const Payment = require('../src-electron/models/payment');
const { sequelize } = require('../src-electron/database');
const { setSession } = require('../src-electron/utils/session');

async function benchmark() {
    console.log('--- Establishing Performance Baseline ---');
    try {
        await initTestDb();
        loadHandlers();

        // Seed data for benchmarking
        const user = await User.create({ username: 'test_student', password: 'password', role: 'student' });
        const student = await Student.create({ user_id: user.id, name: 'Test Student', status: 'active' });
        const instructorUser = await User.create({ username: 'test_instructor', password: 'password', role: 'instructor' });
        const instructor = await Instructor.create({ user_id: instructorUser.id, name: 'Test Instructor', license_number: 'ABC-123', experience: 5 });
        const exam = await Exam.create({ name: 'Final Exam', start_time: new Date(), end_time: new Date() });

        // Create some exam results
        const examResults = [];
        for (let i = 0; i < 50; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - Math.floor(i / 10));
            examResults.push({
                student_id: student.id,
                exam_id: exam.id,
                score: Math.floor(Math.random() * 100),
                completed_at: date
            });
        }
        await sequelize.models.StudentExam.bulkCreate(examResults);

        // Create some lessons
        const lessons = [];
        for (let i = 0; i < 20; i++) {
            lessons.push({
                student_id: student.id,
                instructor_id: instructor.id,
                title: `Lesson ${i}`,
                start_time: new Date(),
                end_time: new Date(),
                status: i % 2 === 0 ? 'completed' : 'upcoming'
            });
        }
        await Lesson.bulkCreate(lessons);

        // Create some payments
        const payments = [];
        for (let i = 0; i < 100; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - Math.floor(i / 15));
            payments.push({
                student_id: student.id,
                amount: Math.floor(Math.random() * 500) + 50,
                type: i % 3 === 0 ? 'expense' : 'income',
                category: 'benchmarking',
                payment_date: date,
                transaction_id: `TXN-BENCH-${i}`,
                status: 'completed'
            });
        }
        await Payment.bulkCreate(payments);

        setSession({ id: user.id, role: 'student' });

        const iterations = 100;

        console.log(`Running benchmarks (${iterations} iterations)...`);

        // Benchmark get-student-progress
        const startProgress = performance.now();
        for (let i = 0; i < iterations; i++) {
            await global.invokeIPC('get-student-progress', { userId: user.id });
        }
        const endProgress = performance.now();
        const avgProgress = (endProgress - startProgress) / iterations;
        console.log(`get-student-progress: ${avgProgress.toFixed(2)}ms (avg)`);

        // Benchmark get-dashboard-stats (student)
        const startDashStudent = performance.now();
        for (let i = 0; i < iterations; i++) {
            await global.invokeIPC('get-dashboard-stats', { role: 'student', userId: user.id });
        }
        const endDashStudent = performance.now();
        const avgDashStudent = (endDashStudent - startDashStudent) / iterations;
        console.log(`get-dashboard-stats (student): ${avgDashStudent.toFixed(2)}ms (avg)`);

        // Benchmark get-dashboard-stats (admin)
        setSession({ id: 999, role: 'admin' });
        const startDashAdmin = performance.now();
        for (let i = 0; i < iterations; i++) {
            await global.invokeIPC('get-dashboard-stats', { role: 'admin', userId: 999 });
        }
        const endDashAdmin = performance.now();
        const avgDashAdmin = (endDashAdmin - startDashAdmin) / iterations;
        console.log(`get-dashboard-stats (admin): ${avgDashAdmin.toFixed(2)}ms (avg)`);

        // Benchmark get-financial-stats
        const startFinances = performance.now();
        for (let i = 0; i < iterations; i++) {
            await global.invokeIPC('get-financial-stats');
        }
        const endFinances = performance.now();
        const avgFinances = (endFinances - startFinances) / iterations;
        console.log(`get-financial-stats: ${avgFinances.toFixed(2)}ms (avg)`);

    } catch (error) {
        console.error('Benchmark failed:', error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

benchmark();
