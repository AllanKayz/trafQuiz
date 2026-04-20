const { initTestDb, loadHandlers } = require('../tests/integration/setup');
const { setSession } = require('../src-electron/utils/session');
const { User } = require('../src-electron/models/UserModel');
const { Student } = require('../src-electron/models/StudentModel');
const { Instructor } = require('../src-electron/models/InstructorModel');
const { Exam } = require('../src-electron/models/ExamModel');
const { Lesson, Vehicle } = require('../src-electron/models/OperationalModels');
const Payment = require('../src-electron/models/payment');
const { sequelize } = require('../src-electron/database');

async function seedBenchmarkData() {
  console.log('Seeding benchmark data...');

  // Create an admin user
  const adminUser = await User.create({
    username: 'admin_bench',
    password: 'password',
    role: 'admin',
    first_name: 'Admin',
    last_name: 'Bench'
  });

  // Create an instructor
  const instructorUser = await User.create({
    username: 'instr_bench',
    password: 'password',
    role: 'instructor',
    first_name: 'Instr',
    last_name: 'Bench'
  });
  const instructor = await Instructor.create({
    user_id: instructorUser.id,
    license_number: 'L123456',
    experience: 5
  });

  // Create a student
  const studentUser = await User.create({
    username: 'stud_bench',
    password: 'password',
    role: 'student',
    first_name: 'Stud',
    last_name: 'Bench'
  });
  const student = await Student.create({
    user_id: studentUser.id,
    status: 'active'
  });

  // Seed some payments
  const payments = [];
  for (let i = 0; i < 500; i++) {
    payments.push({
      student_id: student.id,
      amount: 50 + Math.random() * 100,
      type: i % 2 === 0 ? 'income' : 'expense',
      payment_date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30 * 6), // Last 6 months
      status: 'completed',
      category: 'tuition',
      method: 'cash',
      transaction_id: `TXN-${i}`
    });
  }
  await Payment.bulkCreate(payments);

  // Seed some lessons
  const lessons = [];
  for (let i = 0; i < 50; i++) {
    lessons.push({
      student_id: student.id,
      instructor_id: instructor.id,
      title: `Lesson ${i}`,
      start_time: new Date(Date.now() + (i - 25) * 1000 * 60 * 60 * 24),
      end_time: new Date(Date.now() + (i - 25) * 1000 * 60 * 60 * 24 + 1000 * 60 * 60),
      status: i < 25 ? 'completed' : 'upcoming'
    });
  }
  await Lesson.bulkCreate(lessons);

  // Seed some exams
  const exams = [];
  for (let i = 0; i < 10; i++) {
    exams.push({
      name: `Exam ${i}`,
      start_time: new Date(),
      end_time: new Date(Date.now() + 1000 * 60 * 60)
    });
  }
  await Exam.bulkCreate(exams);

  // Seed student_exams
  for (let i = 0; i < 20; i++) {
    await sequelize.query(`
      INSERT INTO student_exams (student_id, exam_id, score, completed_at)
      VALUES (?, ?, ?, ?)
    `, {
      replacements: [student.id, (i % 10) + 1, Math.floor(Math.random() * 100), new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30 * 3)]
    });
  }

  return { adminUser, instructorUser, studentUser, student, instructor };
}

async function benchmark(name, fn, iterations = 5) {
  console.log(`\nBenchmarking ${name}...`);
  const durations = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    durations.push(end - start);
  }
  const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
  console.log(`Average duration over ${iterations} iterations: ${avg.toFixed(4)}ms`);
  return avg;
}

async function run() {
  try {
    await initTestDb();
    loadHandlers();
    const seeds = await seedBenchmarkData();

    // Benchmark get-dashboard-stats (Admin)
    setSession(seeds.adminUser);
    await benchmark('get-dashboard-stats (Admin)', async () => {
      await global.invokeIPC('get-dashboard-stats', { role: 'admin', userId: seeds.adminUser.id });
    });

    // Benchmark get-financial-stats
    await benchmark('get-financial-stats', async () => {
      await global.invokeIPC('get-financial-stats');
    });

    // Benchmark get-question-stats
    await benchmark('get-question-stats', async () => {
      await global.invokeIPC('get-question-stats');
    });

    // Benchmark get-student-progress
    setSession(seeds.studentUser);
    await benchmark('get-student-progress', async () => {
      await global.invokeIPC('get-student-progress', { userId: seeds.studentUser.id });
    });

    console.log('\n--- Benchmarking Complete ---');
  } catch (error) {
    console.error('Benchmark failed:', error);
  } finally {
    process.exit(0);
  }
}

run();
