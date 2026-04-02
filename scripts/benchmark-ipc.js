const { initTestDb, loadHandlers } = require('../tests/integration/setup');
const { performance } = require('perf_hooks');
const { setSession } = require('../src-electron/utils/session');

async function benchmark() {
    console.log('--- Establishing Performance Baseline ---');
    await initTestDb();
    loadHandlers();

    // Mock admin session
    setSession({ id: 1, role: 'admin', username: 'admin' });

    const targets = [
        { channel: 'get-dashboard-stats', args: [{ role: 'admin', userId: 1 }] },
        { channel: 'get-financial-stats', args: [] },
        { channel: 'get-question-stats', args: [] },
        { channel: 'get-student-progress', args: [{ studentId: 1 }] }
    ];

    for (const target of targets) {
        // Warmup
        try { await global.invokeIPC(target.channel, ...target.args); } catch(e) {
            console.warn(`Warmup failed for ${target.channel}:`, e.message);
        }

        const start = performance.now();
        const iterations = 5;
        let successCount = 0;
        for (let i = 0; i < iterations; i++) {
            try {
                await global.invokeIPC(target.channel, ...target.args);
                successCount++;
            } catch(e) {
                console.error(`Error in ${target.channel} iteration ${i}:`, e.message);
            }
        }
        const end = performance.now();
        if (successCount > 0) {
            console.log(`${target.channel}: ${((end - start) / successCount).toFixed(2)}ms (avg of ${successCount} successful runs)`);
        } else {
            console.log(`${target.channel}: FAILED (0 successful runs)`);
        }
    }
}

benchmark().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
});
