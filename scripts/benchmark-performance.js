const { initTestDb, loadHandlers } = require('../tests/integration/setup');
const { setSession } = require('../src-electron/utils/session');
const { User } = require('../src-electron/models/UserModel');
const { Student } = require('../src-electron/models/StudentModel');
const { Instructor } = require('../src-electron/models/InstructorModel');
const { Exam } = require('../src-electron/models/ExamModel');
const { Lesson, Vehicle } = require('../src-electron/models/OperationalModels');
const Payment = require('../src-electron/models/payment');
const StudentExam = require('../src-electron/models/student_exam');
const { sequelize } = require('../src-electron/database');

async function seedData() {
    // Create an admin user and session
    const adminUser = await User.create({ username: 'admin_perf', role: 'admin', password: 'password', first_name: 'Admin', last_name: 'User' });

    // Create an instructor
    const instructorUser = await User.create({ username: 'instructor_perf', role: 'instructor', password: 'password', first_name: 'Inst', last_name: 'Ructor' });
    const instructor = await Instructor.create({ user_id: instructorUser.id, license_number: 'INST123', experience: 5 });

    // Create a student
    const studentUser = await User.create({ username: 'student_perf', role: 'student', password: 'password', first_name: 'Stu', last_name: 'Dent' });
    const student = await Student.create({ user_id: studentUser.id, status: 'active' });

    // Create an exam
    const exam = await Exam.create({ name: 'Final Exam', start_time: new Date(), end_time: new Date(Date.now() + 3600000) });

    // Create some payments
    await Payment.create({ amount: 100, type: 'income', category: 'tuition', payment_date: new Date(), status: 'completed', transaction_id: 'TX1' });
    await Payment.create({ amount: 50, type: 'expense', category: 'maintenance', payment_date: new Date(), status: 'completed', transaction_id: 'TX2' });

    // Create some student exams
    await StudentExam.create({ student_id: student.id, exam_id: exam.id, score: 85, completed_at: new Date() });

    // Create some lessons
    await Lesson.create({ title: 'Lesson 1', student_id: student.id, instructor_id: instructor.id, start_time: new Date(), end_time: new Date(Date.now() + 3600000), status: 'upcoming' });

    return { adminUser, instructorUser, studentUser, student, instructor };
}

async function benchmark(name, fn) {
    const start = process.hrtime.bigint();
    await fn();
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1_000_000;
    console.log(`${name}: ${duration.toFixed(2)}ms`);
    return duration;
}

async function runBenchmarks() {
    console.log('--- Performance Benchmark ---');
    await initTestDb();
    loadHandlers();
    const { adminUser, instructorUser, studentUser, student } = await seedData();

    // Benchmark Admin Dashboard
    setSession({ id: adminUser.id, role: 'admin' });
    await benchmark('get-dashboard-stats (Admin)', () => global.invokeIPC('get-dashboard-stats', { role: 'admin', userId: adminUser.id }));

    // Benchmark Financial Stats
    await benchmark('get-financial-stats', () => global.invokeIPC('get-financial-stats'));

    // Benchmark Question Stats
    await benchmark('get-question-stats', () => global.invokeIPC('get-question-stats'));

    // Benchmark Instructor Dashboard
    setSession({ id: instructorUser.id, role: 'instructor' });
    await benchmark('get-dashboard-stats (Instructor)', () => global.invokeIPC('get-dashboard-stats', { role: 'instructor', userId: instructorUser.id }));

    // Benchmark Student Dashboard
    setSession({ id: studentUser.id, role: 'student' });
    await benchmark('get-dashboard-stats (Student)', () => global.invokeIPC('get-dashboard-stats', { role: 'student', userId: studentUser.id }));

    // Benchmark Student Progress
    await benchmark('get-student-progress', () => global.invokeIPC('get-student-progress', { userId: studentUser.id }));

    console.log('--- Benchmark Complete ---');
    await sequelize.close();
}

runBenchmarks().catch(err => {
    console.error('Benchmark failed:', err);
    process.exit(1);
});
