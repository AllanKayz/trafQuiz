const { initTestDb, loadHandlers } = require('../tests/integration/setup');
const { performance } = require('perf_hooks');

async function benchmark() {
    console.log('⚡ Starting Bolt Performance Benchmark...');

    try {
        await initTestDb();
        loadHandlers();

        const { sequelize } = require('../src-electron/database');
        const { User } = require('../src-electron/models/UserModel');
        const { Student } = require('../src-electron/models/StudentModel');
        const { Instructor } = require('../src-electron/models/InstructorModel');
        const { Exam } = require('../src-electron/models/ExamModel');

        // Ensure db is empty then seed
        await sequelize.query('DELETE FROM users');
        await sequelize.query('DELETE FROM students');
        await sequelize.query('DELETE FROM instructors');
        await sequelize.query('DELETE FROM exams');

        const user = await User.create({ username: 'admin', password: 'password', role: 'admin' });
        const studentUser = await User.create({ username: 'student', password: 'password', role: 'student' });
        const student = await Student.create({ user_id: studentUser.id, first_name: 'Test', last_name: 'Student' });

        const instructorUser = await User.create({ username: 'instructor', password: 'password', role: 'instructor' });
        await Instructor.create({ user_id: instructorUser.id, first_name: 'Test', last_name: 'Instructor', license_number: 'L123', experience: 5 });

        await Exam.create({ name: 'Final Exam', start_time: new Date(), end_time: new Date(Date.now() + 3600000) });

        // Mock a session for isAuthenticated checks
        const { setSession } = require('../src-electron/utils/session');
        setSession({ id: user.id, role: 'admin', username: 'admin' });

        const iterations = 50;
        const scenarios = [
            { name: 'get-dashboard-stats (Admin)', channel: 'get-dashboard-stats', args: [{ role: 'admin', userId: user.id }] },
            { name: 'get-financial-stats', channel: 'get-financial-stats', args: [] },
            { name: 'get-question-stats', channel: 'get-question-stats', args: [] },
            { name: 'get-student-progress', channel: 'get-student-progress', args: [{ userId: studentUser.id }] }
        ];

        console.log(`\nRunning ${iterations} iterations per scenario...\n`);
        console.log('| Scenario | Average Latency (ms) |');
        console.log('| :--- | :--- |');

        for (const scenario of scenarios) {
            // Warmup
            try {
                await global.invokeIPC(scenario.channel, ...scenario.args);
            } catch (e) {
                console.error(`Warmup failed for ${scenario.name}:`, e);
            }

            const start = performance.now();
            for (let i = 0; i < iterations; i++) {
                await global.invokeIPC(scenario.channel, ...scenario.args);
            }
            const end = performance.now();
            const avg = (end - start) / iterations;

            console.log(`| ${scenario.name} | ${avg.toFixed(2)}ms |`);
        }

        console.log('\n✅ Benchmark complete.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Benchmark failed:', error);
        process.exit(1);
    }
}

benchmark();
