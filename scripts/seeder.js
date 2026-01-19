const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { init, exec, query } = require('../src-electron/db');

// Path to the MySQL dump
const MYSQL_DUMP_PATH = path.join(__dirname, '..', 'traffiquiz_normalized.sql');

async function seed() {
    console.log('Starting Dedicated Seeder (Fixed Scope)...');
    
    let counts = {};

    try {
        // Ensure DB is initialized (tables created)
        await init();
        
        // Disable foreign keys temporarily
        await exec('PRAGMA foreign_keys = OFF');
        console.log('Foreign keys disabled for import.');

        const fileStream = fs.createReadStream(MYSQL_DUMP_PATH);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let currentTable = null;
        let insertBuffer = '';
        let isInsert = false;

        console.log('Parsing SQL dump and importing data...');

        for await (const line of rl) {
            const trimmedLine = line.trim();
            
            // Detect INSERT INTO statements
            const insertMatch = trimmedLine.match(/^INSERT INTO `([^`]+)`/);
            
            if (insertMatch) {
                currentTable = insertMatch[1];
                isInsert = true;
                insertBuffer = trimmedLine;
                
                // If it ends with semicolon on the same line
                if (trimmedLine.endsWith(';')) {
                    await processInsert(insertBuffer, currentTable);
                    isInsert = false;
                    insertBuffer = '';
                }
                continue;
            }

            if (isInsert) {
                insertBuffer += ' ' + trimmedLine;
                if (trimmedLine.endsWith(';')) {
                    await processInsert(insertBuffer, currentTable);
                    isInsert = false;
                    insertBuffer = '';
                }
            }
        }

        // Re-enable foreign keys
        await exec('PRAGMA foreign_keys = ON');
        console.log('Foreign keys re-enabled.');

        console.log(`Seeding Complete!`);
        console.log(`Summary:`);
        for (const [table, count] of Object.entries(counts)) {
            console.log(`- ${table}: ${count} rows processed`);
        }
        
        // Final check for questions
        const qFinal = await query('SELECT COUNT(*) as count FROM questions');
        console.log(`- Total Questions in DB: ${qFinal[0].count}`);

    } catch (error) {
        console.error('Seeding Error:', error);
    }
    
    process.exit(0);

    async function processInsert(sql, table) {
        // Basic translation for SQLite
        let translatedSql = sql.replace(/\\'/g, "''");
        translatedSql = translatedSql.replace(/^INSERT INTO/, "INSERT OR REPLACE INTO");
        
        try {
            await exec(translatedSql);
            const valuesMatch = translatedSql.match(/\(([^)]+)\)/g);
            const batchCount = valuesMatch ? valuesMatch.length : 1;
            counts[table] = (counts[table] || 0) + batchCount;
        } catch (err) {
            console.warn(`Warning: Could not import into ${table}: ${err.message}`);
        }
    }
}

seed();
