const { initTestDb, loadHandlers } = require('../tests/integration/setup');
const { performance } = require('perf_hooks');
const session = require('../src-electron/utils/session');

async function benchmark() {
    console.log('--- Starting IPC Benchmark ---');
    try {
        await initTestDb();
        loadHandlers();

        // Seed some data for realistic benchmarking
        const { sequelize } = require('../src-electron/database');

        // Add some payments
        const payments = [];
        for (let i = 0; i < 500; i++) {
            payments.push({
                amount: Math.random() * 100,
                type: i % 2 === 0 ? 'income' : 'expense',
                payment_date: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 180).toISOString(),
                status: 'completed',
                transaction_id: 'TXN-' + i
            });
        }
        await sequelize.models.Payment.bulkCreate(payments);

        // Add some student exams
        const studentExams = [];
        for (let i = 0; i < 200; i++) {
            studentExams.push({
                student_id: 1,
                exam_id: 1,
                score: Math.random() * 100,
                completed_at: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 30).toISOString()
            });
        }
        // Need to ensure student and exam exist if foreign keys are on
        const now = new Date().toISOString();
        await sequelize.query('PRAGMA foreign_keys = OFF');
        await sequelize.query('INSERT INTO students (id, user_id, status) VALUES (1, 1, "active")');
        await sequelize.query('INSERT INTO instructors (id, user_id, license_number, experience) VALUES (1, 2, "LIC123", 5)');
        await sequelize.query('INSERT INTO exams (id, name, start_time, end_time) VALUES (1, "Test Exam", ?, ?)', { replacements: [now, now] });
        await sequelize.query('INSERT INTO categories (id, name) VALUES (1, "Category 1")');
        await sequelize.query('INSERT INTO questions (id, question_text, exam_id, answer, option_a, option_b, option_c) VALUES (1, "Q1", 1, "a", "a", "b", "c")');
        await sequelize.query('PRAGMA foreign_keys = ON');

        // Using raw query to avoid model definition issues if not fully loaded
        for (const se of studentExams) {
            await sequelize.query('INSERT INTO student_exams (student_id, exam_id, score, completed_at) VALUES (?, ?, ?, ?)',
                { replacements: [se.student_id, se.exam_id, se.score, se.completed_at] });
        }

        const iterations = 10;

        const targets = [
            { name: 'get-financial-stats', channel: 'get-financial-stats', args: [] },
            { name: 'get-student-progress', channel: 'get-student-progress', args: [{ studentId: 1 }] },
            { name: 'get-dashboard-stats (admin)', channel: 'get-dashboard-stats', args: [{ role: 'admin', userId: 1 }] },
            { name: 'get-question-stats', channel: 'get-question-stats', args: [] }
        ];

        // Mock auth
        session.setSession({ id: 1, username: 'admin', role: 'admin' });

        for (const target of targets) {
            console.log(`Benchmarking ${target.name}...`);
            // Warm up
            const warmUpResult = await global.invokeIPC(target.channel, ...target.args);
            if (!warmUpResult.success) {
                 console.log(`Warm up result failed: ${warmUpResult.message}`);
                 continue;
            }

            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                await global.invokeIPC(target.channel, ...target.args);
            }
            const end = performance.now();
            console.log(`Average time for ${target.name}: ${((end - start) / iterations).toFixed(2)}ms`);
        }

    } catch (error) {
        console.error('Benchmark failed:', error);
    }
}

benchmark();
