const { initTestDb, loadHandlers } = require('../tests/integration/setup');
const { setSession } = require('../src-electron/utils/session');
const { performance } = require('perf_hooks');

async function runBenchmark() {
    console.log('--- IPC Handler Benchmark ---');

    await initTestDb();
    loadHandlers();

    // Set admin session for permission-restricted handlers
    setSession({ id: 1, username: 'admin', role: 'admin' });

    const handlers = [
        { name: 'get-dashboard-stats', params: { role: 'admin' } },
        { name: 'get-financial-stats', params: null },
        { name: 'get-question-stats', params: null }
    ];

    const results = [];

    for (const handler of handlers) {
        // Warmup
        await global.invokeIPC(handler.name, handler.params);

        const start = performance.now();
        const iterations = 10;
        for (let i = 0; i < iterations; i++) {
            await global.invokeIPC(handler.name, handler.params);
        }
        const end = performance.now();
        const avg = (end - start) / iterations;

        results.push({
            handler: handler.name,
            avgLatency: avg.toFixed(2) + 'ms'
        });
    }

    console.table(results);
    process.exit(0);
}

runBenchmark().catch(err => {
    console.error(err);
    process.exit(1);
});
