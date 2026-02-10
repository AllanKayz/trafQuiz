const { initTestDb, loadHandlers } = require('./setup');
const path = require('path');
const fs = require('fs');

async function run() {
    console.log('--- Starting Integration Tests ---');
    try {
        await initTestDb();
        console.log('Test database initialized.');

        loadHandlers();
        console.log('IPC Handlers loaded.');

        const testFiles = fs.readdirSync(__dirname).filter(f => f.endsWith('.test.js'));
        let total = 0;
        let passed = 0;

        for (const file of testFiles) {
            console.log(`\nRunning ${file}...`);
            const testSuite = require(path.join(__dirname, file));
            const results = await testSuite.runTests();
            total += results.total;
            passed += results.passed;
        }

        console.log(`\n--- Test Results: ${passed}/${total} passed ---`);
        if (passed < total) {
            process.exit(1);
        }
    } catch (error) {
        console.error('Test suite failed to run:', error);
        process.exit(1);
    }
}

run();
