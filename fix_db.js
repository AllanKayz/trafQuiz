const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'src-electron', 'trafquiz_app.db');
const schemaPath = path.join(__dirname, 'src-electron', 'sqlite_schema.json');

console.log(`Using database: ${dbPath}`);
console.log(`Using schema: ${schemaPath}`);

if (!fs.existsSync(dbPath)) {
    console.error('Database file not found!');
    process.exit(1);
}

if (!fs.existsSync(schemaPath)) {
    console.error('Schema file not found!');
    process.exit(1);
}

const db = new sqlite3.Database(dbPath);

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
const tableDef = schema.find(t => t.name === 'conversation_participants');

if (!tableDef) {
    console.error('Table definition for conversation_participants not found in schema file');
    process.exit(1);
}

db.serialize(() => {
    // 1. Create the table
    // Schema inferred from src-electron/models/MessagingModels.js
    const createTableSql = `
        CREATE TABLE IF NOT EXISTS conversation_participants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            created_at DATETIME,
            updated_at DATETIME,
            FOREIGN KEY(conversation_id) REFERENCES conversations(id),
            FOREIGN KEY(user_id) REFERENCES users(id),
            UNIQUE(conversation_id, user_id)
        );
    `;

    db.run(createTableSql, (err) => {
        if (err) {
            console.error('❌ Error creating table:', err.message);
            return;
        }
        console.log('✅ Table conversation_participants created or already exists.');

        // 2. Insert data
        const stmt = db.prepare('INSERT OR IGNORE INTO conversation_participants (id, conversation_id, user_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)');
        
        let insertedCount = 0;
        if (tableDef.data && Array.isArray(tableDef.data)) {
             tableDef.data.forEach(row => {
                 stmt.run(row.id, row.conversation_id, row.user_id, row.created_at, row.updated_at, (err) => {
                     if (err) console.error(`   Error inserting row ${row.id}:`, err.message);
                 });
                 insertedCount++;
             });
        }
        
        stmt.finalize(() => {
            console.log(`✅ Processed ${insertedCount} rows for insertion.`);
            db.close();
        });
    });
});
