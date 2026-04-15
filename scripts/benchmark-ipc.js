const { initTestDb, loadHandlers } = require('../tests/integration/setup');
const { performance } = require('perf_hooks');
const { setSession } = require('../src-electron/utils/session');
const { seed } = require('./benchmark-seeder');

async function benchmark(name, fn) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    console.log(`${name}: ${(end - start).toFixed(2)}ms`);
    return end - start;
}

async function runBenchmarks() {
    console.log('--- Starting IPC Benchmarks ---');
    try {
        await initTestDb();
        await seed();
        loadHandlers();

        // Mock a session for authorized calls
        setSession({ id: 1, role: 'admin', username: 'admin' });

        console.log('\nRunning benchmarks...');
        // 1. get-financial-stats
        await benchmark('get-financial-stats', () => global.invokeIPC('get-financial-stats'));

        // 2. get-dashboard-stats (admin)
        await benchmark('get-dashboard-stats (admin)', () => global.invokeIPC('get-dashboard-stats', { role: 'admin' }));

        // 3. get-question-stats
        await benchmark('get-question-stats', () => global.invokeIPC('get-question-stats'));

        // 4. get-student-progress
        await benchmark('get-student-progress', () => global.invokeIPC('get-student-progress', { studentId: 1 }));

    } catch (error) {
        console.error('Benchmark failed:', error);
    }
}

runBenchmarks();
