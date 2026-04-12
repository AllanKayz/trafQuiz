// Mock Electron environment
process.env.NODE_ENV = 'test';
const { initTestDb, loadHandlers } = require('../tests/integration/setup');
const { setSession } = require('../src-electron/utils/session');

async function benchmark(name, fn, iterations = 10) {
    console.log(`Benchmarking ${name}...`);
    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
        await fn();
    }
    const end = Date.now();
    const avg = (end - start) / iterations;
    console.log(`${name} average: ${avg.toFixed(2)}ms`);
    return avg;
}

async function run() {
    try {
        await initTestDb();
        loadHandlers();

        // Set up session
        setSession({ id: 1, role: 'admin' });

        console.log('--- Baseline Benchmarks ---');

        // Benchmark get-student-progress
        await benchmark('get-student-progress', async () => {
            const result = await global.invokeIPC('get-student-progress', { studentId: 1 });
            if (!result.success) throw new Error(result.message);
        });

        // Benchmark get-question-stats
        await benchmark('get-question-stats', async () => {
            const result = await global.invokeIPC('get-question-stats');
            if (!result.success) throw new Error(result.message);
        });

        // Benchmark get-dashboard-stats (admin)
        await benchmark('get-dashboard-stats (admin)', async () => {
            const result = await global.invokeIPC('get-dashboard-stats', { role: 'admin', userId: 1 });
            if (!result.success) throw new Error(result.message);
        });

        // Benchmark get-financial-stats
        await benchmark('get-financial-stats', async () => {
            const result = await global.invokeIPC('get-financial-stats');
            if (!result.success) throw new Error(result.message);
        });

    } catch (error) {
        console.error('Benchmark failed:', error);
        process.exit(1);
    }
}

run();
