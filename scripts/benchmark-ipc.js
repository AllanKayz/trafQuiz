const { initTestDb, loadHandlers } = require('../tests/integration/setup');
const { performance } = require('perf_hooks');

async function benchmark(name, fn, iterations = 10) {
    // Warm up
    await fn();

    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        await fn();
    }
    const end = performance.now();
    const avg = (end - start) / iterations;
    console.log(`${name}: ${avg.toFixed(2)}ms (avg over ${iterations} iterations)`);
    return avg;
}

async function run() {
    console.log('--- IPC Handler Benchmarks ---');
    try {
        await initTestDb();
        loadHandlers();

        // Need to set up some data for meaningful benchmarks
        // For now, we'll just run them on empty/minimal DB

        const { setSession } = require('../src-electron/utils/session');
        setSession({ role: 'admin', userId: 1 });

        await benchmark('get-financial-stats', () => global.invokeIPC('get-financial-stats'));
        await benchmark('get-question-stats', () => global.invokeIPC('get-question-stats'));
        await benchmark('get-dashboard-stats (admin)', () => global.invokeIPC('get-dashboard-stats', { role: 'admin' }));

        // Setup a student for progress report
        const { Student } = require('../src-electron/models/StudentModel');
        const { User } = require('../src-electron/models/UserModel');
        const user = await User.create({ username: 'teststudent', role: 'student', password: '123' });
        const student = await Student.create({ user_id: user.id });

        await benchmark('get-student-progress', () => global.invokeIPC('get-student-progress', { studentId: student.id }));

    } catch (error) {
        console.error('Benchmark failed:', error);
    }
}

run();
