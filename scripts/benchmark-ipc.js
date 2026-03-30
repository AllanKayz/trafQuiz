const { initTestDb, loadHandlers } = require('./tests/integration/setup');
const { setSession } = require('./src-electron/utils/session');
const { performance } = require('perf_hooks');

async function measure() {
    console.log('--- Establishing Performance Baseline ---');
    await initTestDb();
    loadHandlers();

    // Set admin session
    setSession({ id: 1, role: 'admin', username: 'admin' });

    // Create a student first
    const studentData = {
        username: 'student1',
        password: 'password123',
        email: 'student1@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '123456789',
        address: '123 Main St',
        packageId: 1
    };
    const studentRes = await global.invokeIPC('add-student', studentData);
    if (!studentRes.success) {
        console.error('Failed to create student:', studentRes.message);
        return;
    }
    const studentId = studentRes.data.id;

    const targets = [
        { name: 'get-financial-stats', channel: 'get-financial-stats', args: [] },
        { name: 'get-dashboard-stats (admin)', channel: 'get-dashboard-stats', args: [{ role: 'admin', userId: 1 }] },
        { name: 'get-question-stats', channel: 'get-question-stats', args: [] },
        { name: 'get-student-progress', channel: 'get-student-progress', args: [{ studentId: studentId }] }
    ];

    for (const target of targets) {
        // Warm up
        await global.invokeIPC(target.channel, ...target.args);

        const start = performance.now();
        const iterations = 50;
        for (let i = 0; i < iterations; i++) {
            await global.invokeIPC(target.channel, ...target.args);
        }
        const end = performance.now();
        console.log(`${target.name}: ${((end - start) / iterations).toFixed(2)}ms (avg over ${iterations} runs)`);
    }
}

measure().catch(console.error);
