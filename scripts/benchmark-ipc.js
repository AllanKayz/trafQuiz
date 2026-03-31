const path = require('path');
const Module = require('module');

// Mock Electron environment for testing IPC handlers in Node
const mockIpc = {
    handlers: {},
    handle: (channel, fn) => {
        mockIpc.handlers[channel] = fn;
    }
};

const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
    if (id === 'electron') {
        return { ipcMain: mockIpc };
    }
    return originalRequire.apply(this, arguments);
};

// Load handlers
require('../src-electron/ipc-handlers/finances-handler');
require('../src-electron/ipc-handlers/reports-handler');
require('../src-electron/ipc-handlers/questions-handler');
require('../src-electron/ipc-handlers/dashboard-handler');

// Mock session
const session = require('../src-electron/utils/session');
session.isAuthenticated = () => true;
session.isAdmin = () => true;

async function benchmark(name, fn) {
    // Warmup
    for(let i=0; i<3; i++) await fn();

    const iterations = 10;
    const start = process.hrtime();
    for(let i=0; i<iterations; i++) {
        await fn();
    }
    const end = process.hrtime(start);
    const ms = ((end[0] * 1000) + (end[1] / 1000000)) / iterations;
    console.log(`${name}: ${ms.toFixed(3)}ms`);
    return ms;
}

async function run() {
    console.log('--- IPC Handler Benchmarks ---');

    // Test get-financial-stats
    if (mockIpc.handlers['get-financial-stats']) {
        await benchmark('get-financial-stats', () => mockIpc.handlers['get-financial-stats']());
    }

    // Test get-student-progress
    if (mockIpc.handlers['get-student-progress']) {
        const { get } = require('../src-electron/db');
        const student = await get('SELECT id FROM students LIMIT 1');
        if (student) {
            await benchmark('get-student-progress', () => mockIpc.handlers['get-student-progress']({}, { studentId: student.id }));
        }
    }

    // Test get-question-stats
    if (mockIpc.handlers['get-question-stats']) {
        await benchmark('get-question-stats', () => mockIpc.handlers['get-question-stats']());
    }

    // Test get-dashboard-stats (Admin)
    if (mockIpc.handlers['get-dashboard-stats']) {
        await benchmark('get-dashboard-stats (admin)', () => mockIpc.handlers['get-dashboard-stats']({}, { role: 'admin' }));
    }

    process.exit(0);
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
