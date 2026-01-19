const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../src-electron/trafquiz_app.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Add column if not exists
    db.run("ALTER TABLE vehicles ADD COLUMN instructor_id INTEGER REFERENCES instructors(id) ON DELETE SET NULL", (err) => {
        if (err && err.message.includes('duplicate column name')) {
            console.log('Column instructor_id already exists.');
        } else if (err) {
            console.error('Error adding column:', err.message);
        } else {
            console.log('Added instructor_id column to vehicles.');
        }
    });

    // Assign vehicle 1 to instructor 1 for testing
    db.run("UPDATE vehicles SET instructor_id = 1 WHERE id = 1", (err) => {
        if (err) console.error('Error assigning vehicle:', err);
        else console.log('Assigned Vehicle 1 to Instructor 1.');
    });
});

db.close();
