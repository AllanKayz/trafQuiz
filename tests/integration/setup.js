const { Module } = require('module');
const path = require('path');
const fs = require('fs');

// 1. Set environment to test
process.env.NODE_ENV = 'test';

// 2. Mock Electron
const handlers = {};
const mockElectron = {
    ipcMain: {
        handle: (channel, callback) => {
            handlers[channel] = callback;
        },
        removeHandler: (channel) => {
            delete handlers[channel];
        }
    },
    BrowserWindow: {
        getAllWindows: () => []
    },
    app: {
        getPath: (name) => path.join(__dirname, '../../temp', name),
        isReady: () => true,
        whenReady: () => Promise.resolve()
    }
};

const originalRequire = Module.prototype.require;
Module.prototype.require = function(id) {
    if (id === 'electron') {
        return mockElectron;
    }
    return originalRequire.apply(this, arguments);
};

// 3. Helper to invoke handlers
global.invokeIPC = async (channel, ...args) => {
    if (handlers[channel]) {
        return await handlers[channel]({ sender: { send: () => {} } }, ...args);
    }
    throw new Error(`No IPC handler registered for: ${channel}`);
};

// 4. Initialize Database
async function initTestDb() {
    const dbPath = path.join(__dirname, '../../src-electron/trafquiz_test.db');
    if (fs.existsSync(dbPath)) {
        fs.unlinkSync(dbPath);
    }

    const { sequelize } = require('../../src-electron/database');
    const { runMigrations } = require('../../src-electron/migration-runner');

    // Run migrations to get the real schema
    await runMigrations();

    // Also init the db.js part if needed
    const { init } = require('../../src-electron/db');
    await init();
}

// 5. Load all handlers
function loadHandlers() {
    const handlersDir = path.join(__dirname, '../../src-electron/ipc-handlers');
    fs.readdirSync(handlersDir).forEach(file => {
        if (file.endsWith('.js')) {
            require(path.join(handlersDir, file));
        }
    });
}

module.exports = { initTestDb, loadHandlers };
