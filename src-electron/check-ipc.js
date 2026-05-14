const fs = require('fs');
const path = require('path');
const { ipcMain } = require('electron');
const db = require('./db'); // Handlers will likely need the db

// Helper to log with timestamps
const log = (msg, type = 'info') => {
  const timestamp = new Date().toISOString();
  const icons = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️' };
  console.log(`[${timestamp}] ${icons[type] || ''} ${msg}`);
};

// Mock/Intercept ipcMain to capture handlers registered by files
const capturedHandlers = [];
ipcMain.handle = (channel, handler) => {
  capturedHandlers.push({ type: 'handle', channel, handler });
};
ipcMain.on = (channel, handler) => {
  capturedHandlers.push({ type: 'on', channel, handler });
};

async function runIpcTests() {
  console.log('========================================');
  log('Starting IPC Handler Diagnostics...', 'info');
  console.log('========================================');

  try {
    // Initialize DB first, as handlers depend on it.
    log('Initializing database...');
    await db.init();
    log('Database initialized successfully.', 'success');

    const handlersDir = path.join(__dirname, 'ipc-handlers');
    if (!fs.existsSync(handlersDir)) {
      log(`IPC handlers directory not found at ${handlersDir}`, 'error');
      return;
    }

    const handlerFiles = fs.readdirSync(handlersDir).filter(f => f.endsWith('.js'));
    log(`Found ${handlerFiles.length} IPC handler file(s): ${handlerFiles.join(', ')}`);

    let totalHandlers = 0;
    let failedHandlers = 0;

    // Mock event object passed to ipcMain.handle(channel, handler)
    // The handler function receives this as the first argument.
    const mockEvent = {
      sender: {
        // Mock any properties on sender that your handlers might use.
        // For example, if you use event.sender.send() or webContents properties.
        isDestroyed: () => false,
        send: () => {}
      },
      reply: () => {}
    };

    for (const file of handlerFiles) {
      const filePath = path.join(handlersDir, file);
      log(`Testing handlers in ${file}...`, 'info');

      const initialCount = capturedHandlers.length;

      try {
        // Requiring the file should trigger ipcMain.handle/on calls
        const handlerModule = require(filePath);
        
        // Check for handlers captured via ipcMain interception
        const newHandlers = capturedHandlers.slice(initialCount);
        
        // Check for directly exported functions (legacy/alternative pattern)
        const exportedFunctions = Object.keys(handlerModule).filter(
          key => typeof handlerModule[key] === 'function'
        );

        if (newHandlers.length === 0 && exportedFunctions.length === 0) {
          log(`   No IPC handlers registered or exported functions found in ${file}.`, 'warn');
          continue;
        }

        // Test Intercepted Handlers
        for (const { type, channel, handler } of newHandlers) {
          totalHandlers++;
          log(`   -> Testing IPC Channel [${type}] '${channel}'...`);
          try {
            const result = handler(mockEvent);
            if (result instanceof Promise) await result;
            log(`      ✅ SUCCESS: Handler resolved without errors.`, 'success');
          } catch (error) {
            failedHandlers++;
            log(`      ❌ FAILURE: Handler rejected with error: ${error.message}`, 'error');
          }
        }

        // Test Exported Functions
        for (const funcName of exportedFunctions) {
          totalHandlers++;
          log(`   -> Testing Exported Function '${funcName}'...`);
          try {
            await handlerModulefuncName;
            log(`      ✅ SUCCESS: Handler resolved without errors.`, 'success');
          } catch (error) {
            failedHandlers++;
            log(`      ❌ FAILURE: Handler rejected with error: ${error.message}`, 'error');
          }
        }
      } catch (error) {
        log(`   Critical error loading or processing ${file}: ${error.message}`, 'error');
        failedHandlers++;
      }
    }

    console.log('----------------------------------------');
    if (failedHandlers === 0 && totalHandlers > 0) {
      log(`All ${totalHandlers} discovered IPC handlers executed successfully.`, 'success');
    } else if (totalHandlers === 0) {
      log('No IPC handlers were found to test.', 'warn');
    } else {
      log(`${failedHandlers} out of ${totalHandlers} handlers failed.`, 'error');
    }
    console.log('Note: This test calls each handler with a mock event and no arguments.');
    console.log('Failures may occur if a handler requires specific arguments from the frontend.');

  } catch (err) {
    log(`A critical error occurred during setup: ${err.message}`, 'error');
    process.exit(1);
  }

  log('IPC diagnostics complete.', 'info');
  process.exit(0);
}

runIpcTests();