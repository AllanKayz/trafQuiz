const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'trafquiz_app.db');
const schemaPath = path.join(__dirname, 'sqlite_schema.sql');

console.log('Reading schema file...');
const sql = fs.readFileSync(schemaPath, 'utf8');

console.log('Opening database...');
const db = new sqlite3.Database(dbPath);

console.log('Executing SQL...');
db.exec(sql, (err) => {
    if (err) {
        console.error('Error executing SQL:', err);
        process.exit(1);
    }
    
    console.log('Database populated successfully!');
    
    // Verify questions count
    db.get('SELECT COUNT(*) as count FROM questions', (err, row) => {
        if (err) {
            console.error('Error counting questions:', err);
        } else {
            console.log(`Total questions in database: ${row.count}`);
        }
        
        db.close();
        process.exit(0);
    });
});
