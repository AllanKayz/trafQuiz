const { initTestDb, loadHandlers } = require('../tests/integration/setup');
const { setSession } = require('../src-electron/utils/session');
const { performance } = require('perf_hooks');
const { User } = require('../src-electron/models/UserModel');
const { Student } = require('../src-electron/models/StudentModel');

async function benchmark(label, fn, iterations = 10) {
    // Warm up
    await fn();

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        await fn();
    }
    const end = performance.now();
    const avg = (end - start) / iterations;
    console.log(`${label}: ${avg.toFixed(2)}ms (average over ${iterations} iterations)`);
    return avg;
}

async function run() {
    console.log('--- Starting IPC Handler Benchmark ---');
    try {
        await initTestDb();
        loadHandlers();

        // Seed some data for realistic benchmarks
        const user = await User.create({
            username: 'student1',
            password: 'password',
            role: 'student',
            first_name: 'Student',
            last_name: 'One'
        });
        await Student.create({
            user_id: user.id,
            status: 'active'
        });

        // Mock an admin session
        setSession({ id: 1, role: 'admin', username: 'admin' });

        console.log('\nBaselines:');

        await benchmark('get-dashboard-stats (admin)', async () => {
            await global.invokeIPC('get-dashboard-stats', { role: 'admin', userId: 1 });
        });

        await benchmark('get-financial-stats', async () => {
            await global.invokeIPC('get-financial-stats');
        });

        await benchmark('get-question-stats', async () => {
            await global.invokeIPC('get-question-stats');
        });

        // Mock a student session
        setSession({ id: user.id, role: 'student', username: 'student1' });
        await benchmark('get-dashboard-stats (student)', async () => {
            await global.invokeIPC('get-dashboard-stats', { role: 'student', userId: user.id });
        });

    } catch (error) {
        console.error('Benchmark failed:', error);
    }
}

run();
