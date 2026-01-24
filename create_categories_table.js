const { run } = require('./src-electron/db');

async function createTable() {
    try {
        console.log('Creating categories table...');
        await run(`
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name varchar(255) NOT NULL,
                description text DEFAULT NULL
            )
        `);
        console.log('Categories table created successfully.');
    } catch (error) {
        console.error('Error creating table:', error);
    }
}

createTable();
