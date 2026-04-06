const { initTestDb, loadHandlers } = require('../tests/integration/setup');
const { setSession } = require('../src-electron/utils/session');
const { get } = require('../src-electron/db');

async function benchmark(name, fn, iterations = 100) {
    console.log(`\nBenchmarking: ${name} (${iterations} iterations)`);

    // Warm-up
    for (let i = 0; i < 5; i++) {
        await fn();
    }

    const start = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
        await fn();
    }
    const end = process.hrtime.bigint();

    const totalNs = end - start;
    const avgMs = Number(totalNs) / (iterations * 1_000_000);

    console.log(`Average: ${avgMs.toFixed(3)}ms`);
    return avgMs;
}

async function runBenchmarks() {
    try {
        await initTestDb();
        loadHandlers();

        // Setup a student session for tests
        // First find a student in the test db
        const student = await get('SELECT s.id, u.username, u.role FROM students s JOIN users u ON s.user_id = u.id LIMIT 1');
        if (!student) {
            // Need to seed some data if empty, but let's assume initTestDb/init() does it or we can manually
            // Actually, init() might not seed enough for performance testing, but it's a start.
        }

        // Mock Admin session
        setSession({ id: 1, username: 'admin', role: 'admin' });

        await benchmark('get-dashboard-stats (admin)', async () => {
            await global.invokeIPC('get-dashboard-stats', { role: 'admin', userId: 1 });
        });

        await benchmark('get-question-stats', async () => {
            await global.invokeIPC('get-question-stats');
        });

        if (student) {
             setSession({ id: student.id, username: student.username, role: student.role });
             await benchmark('get-student-progress', async () => {
                await global.invokeIPC('get-student-progress', { userId: student.id });
            });
        }

    } catch (error) {
        console.error('Benchmark failed:', error);
    }
}

runBenchmarks();
