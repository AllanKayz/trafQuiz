const { initTestDb, loadHandlers } = require('../tests/integration/setup');
const path = require('path');
const { performance } = require('perf_hooks');

async function benchmark() {
    console.log('--- IPC Performance Benchmark ---');
    try {
        await initTestDb();
        loadHandlers();

        // Seed some data for better measurement
        const { sequelize } = require('../src-electron/database');

        console.log('Seeding benchmark data...');
        // Add some students, exams, student_exams, payments
        await sequelize.query("INSERT INTO users (username, password, role, first_name, last_name, email) VALUES ('admin_bench', 'hash', 'admin', 'Admin', 'User', 'admin@test.com')");
        const [[admin]] = await sequelize.query("SELECT id FROM users WHERE username='admin_bench' LIMIT 1");

        await sequelize.query("INSERT INTO students (user_id, status) VALUES (?, 'active')", { replacements: [admin.id] });
        const [[student]] = await sequelize.query("SELECT id FROM students LIMIT 1");

        // Seed payments
        const payments = [];
        for (let i = 0; i < 100; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - Math.floor(Math.random() * 12));
            const dateStr = date.toISOString().replace('T', ' ').substring(0, 19);
            payments.push(`(${student.id}, 100, '${i % 2 === 0 ? 'income' : 'expense'}', 'test', 'cash', 'TXN-${i}', 'completed', '${dateStr}')`);
        }
        await sequelize.query(`INSERT INTO payments (student_id, amount, type, category, method, transaction_id, status, payment_date) VALUES ${payments.join(',')}`);

        // Seed student_exams
        await sequelize.query("INSERT INTO exams (name, start_time, end_time) VALUES ('Test Exam', '2026-01-01 09:00:00', '2026-01-01 10:00:00')");
        const [[exam]] = await sequelize.query("SELECT id FROM exams LIMIT 1");

        const studentExams = [];
        for (let i = 0; i < 100; i++) {
            studentExams.push(`(${student.id}, ${exam.id}, ${Math.floor(Math.random() * 100)}, '2026-01-01 10:00:00')`);
        }
        await sequelize.query(`INSERT INTO student_exams (student_id, exam_id, score, completed_at) VALUES ${studentExams.join(',')}`);

        // Set up session
        const { setSession } = require('../src-electron/utils/session');
        setSession({ id: admin.id, role: 'admin' });

        const targets = [
            { name: 'get-question-stats', channel: 'get-question-stats', args: [] },
            { name: 'get-financial-stats', channel: 'get-financial-stats', args: [] },
            { name: 'get-dashboard-stats (admin)', channel: 'get-dashboard-stats', args: [{ role: 'admin', userId: admin.id }] },
            { name: 'get-student-progress', channel: 'get-student-progress', args: [{ studentId: student.id }] }
        ];

        console.log('\nStarting measurements (50 iterations each)...');
        for (const target of targets) {
            // Warm up
            await global.invokeIPC(target.channel, ...target.args);

            const start = performance.now();
            for (let i = 0; i < 50; i++) {
                await global.invokeIPC(target.channel, ...target.args);
            }
            const end = performance.now();
            console.log(`${target.name.padEnd(30)}: ${(end - start) / 50}ms (avg)`);
        }

    } catch (error) {
        console.error('Benchmark failed:', error);
    }
    process.exit(0);
}

benchmark();
