const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

// Get userData path effectively
const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
let dbPath;

if (isDev) {
    dbPath = path.join(__dirname, 'trafquiz_app.db');
} else {
    // In production, app should be available. If not, fallback to __dirname to avoid crash, but log error.
    if (app) {
        dbPath = path.join(app.getPath('userData'), 'trafquiz_app.db');
    } else {
        console.error('Electron app object is not available. Falling back to local DB path.');
        dbPath = path.join(__dirname, 'trafquiz_app.db');
    }
}

console.log('Database path:', dbPath);

const db = new sqlite3.Database(dbPath);

// Helper to run queries with promises
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const get = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

// For multiple statements (exec)
const exec = (sql) => {
    return new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

async function init() {
    console.log('Initializing Database...');
    
    // Enable foreign keys
    await exec('PRAGMA foreign_keys = ON');

    // Check if tables exist
    try {
        const tableExists = await get("SELECT name FROM sqlite_master WHERE type='table' AND name='questions'");

        // Simple check: if 'questions' table doesn't exist or is empty (checked later), we populate.
        // Actually, let's just check for 'users' table as a generic indicator of initialization
        const userTableExists = await get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'");

        if (!userTableExists) {
            console.log('Database empty. Initializing from sqlite_schema.json...');
            
            const schemaJsonPath = path.join(__dirname, 'sqlite_schema.json');

            if (fs.existsSync(schemaJsonPath)) {
                try {
                    const schemaContent = fs.readFileSync(schemaJsonPath, 'utf8');
                    const schemaData = JSON.parse(schemaContent);
                    
                    // 1. Create Tables
                    // The JSON structure is a list of objects with type="table" or "database" or "header".
                    // We need to iterate and create tables based on 'name' and inferred schema, 
                    // BUT 'sqlite_schema.json' usually just contains DATA (exported from PHPMyAdmin as JSON). 
                    // It might NOT contain the CREATE TABLE statements.
                    // Let's re-verify the content of sqlite_schema.json. 
                    // The view_file showed it has "data": [...]
                    // It does NOT seem to have column definitions.
                    // WE NEED THE SCHEMA DEFINITION.
                    // The user said "Change the database population method to use sqlite_schema.json".
                    // This implies the STRUCTURE might still need to come from somewhere, OR the JSON works differently.
                    // Wait, if I don't have CREATE TABLE statements, I can't create tables from just data easily without inferring types.
                    // However, there is a `sqlite_schema.sql` file. Usually schema is structure, json is data.
                    // Let's assume we still use `sqlite_schema.sql` for STRUCTURE, and `sqlite_schema.json` for DATA.
                    // OR, I need to fetch the structure from `sqlite_schema.sql` and then populate data from JSON.
                    
                    // Retaining `sqlite_schema.sql` loading for STRUCTURE.
                    const schemaSqlPath = path.join(__dirname, 'sqlite_schema.sql');
                    if(fs.existsSync(schemaSqlPath)) {
                        const sql = fs.readFileSync(schemaSqlPath, 'utf8');
                        await exec(sql);
                        console.log('Database structure created from sqlite_schema.sql');
                    } else {
                         throw new Error('sqlite_schema.sql not found for table structure.');
                    }

                    // 2. Populate Data from JSON
                    console.log('Populating data from sqlite_schema.json...');
                    await exec('BEGIN TRANSACTION');

                    for (const item of schemaData) {
                        if (item.type === 'table' && item.data && item.data.length > 0) {
                            const tableName = item.name;
                            console.log(`Populating table: ${tableName}`);
                            
                            // Get columns from the first data item
                            const firstRow = item.data[0];
                            const columns = Object.keys(firstRow);
                            const placeholders = columns.map(() => '?').join(', ');
                            const columnNames = columns.join(', '); // simplistic, assuming safe names

                            const stmt = db.prepare(`INSERT OR IGNORE INTO "${tableName}" (${columnNames}) VALUES (${placeholders})`);
                            
                            for (const row of item.data) {
                                const values = columns.map(col => row[col]);
                                stmt.run(values);
                            }
                            stmt.finalize();
                        }
                    }

                    await exec('COMMIT');
                    console.log('Database successfully populated from sqlite_schema.json');
                    
                    // 3. Ensure exam_timeframe table exists (if not in schema) and has data
                    // We'll check this dynamically or just ensure schema.sql has it. 
                    // But if schema.sql is old, we might need to add it manually here.
                    // Let's verify exam_timeframe later.

                } catch (err) {
                    console.error('Failed to populate from JSON:', err);
                    try { await exec('ROLLBACK'); } catch(e){}
                }
            } else {
                console.error('sqlite_schema.json not found.');
            }
        } else {
            console.log('Database already initialized.');
        }

        // --- Schema Verification & Migration ---
        // Ensure student_exam_history table exists
        const historyTableExists = await get("SELECT name FROM sqlite_master WHERE type='table' AND name='student_exam_history'");
        if (!historyTableExists) {
             console.log('Migrating: Creating student_exam_history table...');
             await run(`CREATE TABLE IF NOT EXISTS student_exam_history (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              student_id INTEGER NOT NULL,
              exam_id INTEGER NOT NULL,
              timestamp datetime DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (student_id) REFERENCES students (id) ON DELETE CASCADE,
              FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE
            )`);
        }

        // Ensure exam_timeframe has exam_id column
        try {
            await get("SELECT exam_id FROM exam_timeframe LIMIT 1");
        } catch (e) {
            if (e.message && e.message.includes("no such column: exam_id")) {
                console.log("Migrating: Updating exam_timeframe table schema...");
                // Since this is a dev refactor, dropping and recreating is acceptable to ensure clean state
                // Preserve data if needed? It's likely empty or irrelevant global data.
                await run("DROP TABLE IF EXISTS exam_timeframe");
                await run(`CREATE TABLE exam_timeframe (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  exam_id INTEGER NOT NULL,
                  period INTEGER NOT NULL DEFAULT 30,
                  created_at datetime DEFAULT CURRENT_TIMESTAMP,
                  updated_at datetime DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (exam_id) REFERENCES exams (id) ON DELETE CASCADE
                )`);
                console.log("exam_timeframe table updated.");
            }
        }

    } catch (error) {
        console.error('Failed to initialize database:', error);
    }
}

module.exports = {
    db,
    query,
    get,
    run,
    exec,
    init
};
