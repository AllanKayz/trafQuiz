const { initTestDb, loadHandlers } = require('../tests/integration/setup');
const assert = require('assert');

async function benchmark() {
    try {
        await initTestDb();
        loadHandlers();

        // Mock session
        const { setSession } = require('../src-electron/utils/session');
        setSession({ id: 1, role: 'admin', username: 'admin' });

        const channel = process.argv[2];
        const params = process.argv[3] ? JSON.parse(process.argv[3]) : {};

        // Warm up
        await global.invokeIPC(channel, params);

        const durations = [];
        for (let i = 0; i < 5; i++) {
            const start = process.hrtime();
            const response = await global.invokeIPC(channel, params);
            const end = process.hrtime(start);
            const durationMs = (end[0] * 1000 + end[1] / 1000000);
            durations.push(durationMs);
        }

        const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
        console.log(`Average duration for ${channel}: ${avg.toFixed(4)}ms`);
    } catch (e) {
        console.error('Benchmark error:', e);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

benchmark();
