const { initTestDb, loadHandlers } = require('../tests/integration/setup');
const { performance } = require('perf_hooks');

async function benchmark(name, fn, iterations = 10) {
    console.log(`\nBenchmarking ${name} (${iterations} iterations)...`);
    const times = [];
    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await fn();
        const end = performance.now();
        times.push(end - start);
    }
    const avg = times.reduce((a, b) => a + b, 0) / iterations;
    const min = Math.min(...times);
    const max = Math.max(...times);
    console.log(`Avg: ${avg.toFixed(2)}ms, Min: ${min.toFixed(2)}ms, Max: ${max.toFixed(2)}ms`);
    return { avg, min, max };
}

async function run() {
    try {
        await initTestDb();
        loadHandlers();

        // Login to establish session
        await global.invokeIPC('login', { username: 'admin', password: '123456' });

        const results = {};

        results['get-dashboard-stats (admin)'] = await benchmark('get-dashboard-stats (admin)', async () => {
            await global.invokeIPC('get-dashboard-stats', { role: 'admin', userId: 1 });
        });

        results['get-financial-stats'] = await benchmark('get-financial-stats', async () => {
            await global.invokeIPC('get-financial-stats');
        });

        results['get-question-stats'] = await benchmark('get-question-stats', async () => {
            await global.invokeIPC('get-question-stats');
        });

        // For student progress, we need a student
        const studentRes = await global.invokeIPC('add-student', {
            username: 'student1',
            password: 'password',
            firstName: 'Test',
            lastName: 'Student',
            email: 'student@test.com'
        });
        const studentId = studentRes.data.id;

        results['get-student-progress'] = await benchmark('get-student-progress', async () => {
            await global.invokeIPC('get-student-progress', { studentId });
        });

        console.log('\n--- Benchmark Summary ---');
        console.table(results);

    } catch (error) {
        console.error('Benchmark failed:', error);
        process.exit(1);
    }
}

run();
