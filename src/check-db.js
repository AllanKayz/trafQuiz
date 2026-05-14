const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// Helper to log with timestamps
const log = (msg, type = 'info') => {
  const timestamp = new Date().toISOString();
  const icons = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️' };
  console.log(`[${timestamp}] ${icons[type] || ''} ${msg}`);
};

async function runDiagnostics() {
  console.log('========================================');
  log('Starting TrafQuiz Database Diagnostics...', 'info');
  console.log('========================================');
  
  // 1. Check Environment
  const isElectron = process.versions.electron;
  if (!isElectron && !process.env.IS_TEST) {
    log('Running in Node.js environment.', 'warn');
    console.log('   Note: If your database relies on Electron paths (e.g. app.getPath),');
    console.log('   please run this script using: npx electron src-electron/check-db.js');
  } else {
    log(`Running in Electron v${process.versions.electron}`, 'info');
  }

  // 2. Verify Database File Existence
  const dbPath = path.join(__dirname, '..', 'src-electron', 'db.js');
  if (!fs.existsSync(dbPath)) {
    log(`db.js not found at ${dbPath}`, 'error');
    process.exit(1);
  }

  try {
    // 3. Load Database Module from src-electron
    log('Loading database module...', 'info');
    const dbModule = require(dbPath);

    if (!dbModule || typeof dbModule.init !== 'function' || typeof dbModule.query !== 'function') {
      log('db.js does not export expected functions (init, query).', 'error');
      console.error('   Exported value:', dbModule);
      process.exit(1);
    }

    // 4. Initialize Database
    log('Initializing database via db.init()...', 'info');
    await dbModule.init();
    log('Database initialization completed.', 'success');

    // 5. Test Connection with a query
    log('Verifying database is operational by querying tables...', 'info');
    const tables = await dbModule.query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;");

    if (tables.length > 0) {
      log(`Database is operational. Found ${tables.length} tables.`, 'success');
      console.log(`   Tables: ${tables.map(t => t.name).join(', ')}`);
    } else {
      log('Database is connected, but no application tables were found.', 'warn');
      log('Diagnostics complete.', 'info');
      process.exit(0);
    }

    // 6. Test Query Functionality for each table
    log('Verifying all tables are queryable...', 'info');
    let errors = 0;

    for (const table of tables) {
        const tableName = table.name;
        try {
        // Perform a lightweight query (count) to ensure table exists and is readable
        const countResult = await dbModule.get(`SELECT COUNT(*) as count FROM "${tableName}"`);
        console.log(`   ✔ ${tableName}: Operational (Records: ${countResult.count})`);
        } catch (err) {
        console.error(`   ❌ ${tableName}: Query Failed - ${err.message}`);
          errors++;
        }
      }

      if (errors === 0) {
        console.log('----------------------------------------');
        log('All database tables are functional.', 'success');
      } else {
        console.log('----------------------------------------');
        log(`${errors} models failed verification. Check logs above.`, 'error');
      }

  } catch (err) {
    log(`Critical failure: ${err.message}`, 'error');
    if (err.original) console.error(err.original);
    process.exit(1);
  }

  log('Diagnostics complete.', 'info');
  process.exit(0);
}

runDiagnostics();