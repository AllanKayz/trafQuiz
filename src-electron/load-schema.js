const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

/**
 * TrafQuiz Database Schema Loader
 * 
 * Loads the complete database schema from sqlite_schema.sql
 * Handles CREATE TABLE statements and INSERT statements separately
 */

const dbPath = path.join(__dirname, 'trafquiz_app.db');
const schemaPath = path.join(__dirname, 'sqlite_schema.sql');

// Command line options
const args = process.argv.slice(2);
const dropTables = args.includes('--drop-tables') || args.includes('--fresh');

console.log('=== TrafQuiz Database Schema Loader ===\n');
if (dropTables) console.log('⚠️  Fresh mode enabled\n');

// Check schema file exists
if (!fs.existsSync(schemaPath)) {
    console.error(`❌ Schema file not found: ${schemaPath}`);
    process.exit(1);
}

// Read schema file
console.log(`📖 Reading: ${path.basename(schemaPath)}`);
const fullSql = fs.readFileSync(schemaPath, 'utf8');
const fileSize = (fs.statSync(schemaPath).size / 1024).toFixed(1);
console.log(`   Size: ${fileSize} KB\n`);

// Open database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database error:', err.message);
        process.exit(1);
    }
});

/**
 * Parse SQL into manageable chunks
 * Separates CREATE TABLE and INSERT statements
 */
function parseSql(sql) {
    const createStatements = [];
    const insertStatements = [];
    
    // Extract CREATE TABLE statements
    const createRegex = /CREATE TABLE[^;]+;/gis;
    let match;
    while ((match = createRegex.exec(sql)) !== null) {
        createStatements.push(match[0].trim());
    }
    
    // Extract INSERT statements more carefully
    // Match: INSERT INTO `table` ... VALUES (...);
    const insertRegex = /INSERT INTO `\w+`[^;]+;/gis;
    while ((match = insertRegex.exec(sql)) !== null) {
        insertStatements.push(match[0].trim());
    }
    
    return { createStatements, insertStatements };
}

const { createStatements, insertStatements } = parseSql(fullSql);

console.log(`📊 Parsed SQL:`);
console.log(`   CREATE statements: ${createStatements.length}`);
console.log(`   INSERT statements: ${insertStatements.length}\n`);

/**
 * Execute SQL statements with progress tracking
 */
async function executeStatements(statements, label) {
    return new Promise((resolve, reject) => {
        let completed = 0;
        let errors = 0;
        const errorLog = [];
        
        if (statements.length === 0) {
            return resolve({ completed, errors, errorLog });
        }
        
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            statements.forEach((stmt, index) => {
                db.run(stmt, function(err) {
                    if (err && !err.message.includes('already exists')) {
                        errors++;
                        errorLog.push({
                            index: index + 1,
                            error: err.message,
                            preview: stmt.substring(0, 80) + '...'
                        });
                    }
                    
                    completed++;
                    const pct = ((completed / statements.length) * 100).toFixed(0);
                    process.stdout.write(`\r   ${label}: ${pct}% (${completed}/${statements.length})`);
                    
                    if (completed === statements.length) {
                        console.log('');
                        
                        if (errorLog.length > 0) {
                            console.log(`\n   ⚠️  ${errorLog.length} errors:`);
                            errorLog.slice(0, 5).forEach(e => {
                                console.log(`      #${e.index}: ${e.error}`);
                            });
                            if (errorLog.length > 5) {
                                console.log(`      ... and ${errorLog.length - 5} more\n`);
                            }
                        }
                        
                        db.run('COMMIT', (err) => {
                            if (err) return reject(err);
                            resolve({ completed, errors, errorLog });
                        });
                    }
                });
            });
        });
    });
}

/**
 * Drop all tables
 */
async function dropAllTables() {
    return new Promise((resolve, reject) => {
        db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", (err, tables) => {
            if (err) return reject(err);
            if (tables.length === 0) return resolve();
            
            console.log(`🗑️  Dropping ${tables.length} tables...`);
            
            db.serialize(() => {
                db.run('PRAGMA foreign_keys = OFF');
                let dropped = 0;
                
                tables.forEach(t => {
                    db.run(`DROP TABLE IF EXISTS \`${t.name}\``, (err) => {
                        if (!err) console.log(`   ✓ ${t.name}`);
                        dropped++;
                        if (dropped === tables.length) {
                            db.run('PRAGMA foreign_keys = ON');
                            console.log('');
                            resolve();
                        }
                    });
                });
            });
        });
    });
}

/**
 * Verify database contents
 */
async function verify() {
    return new Promise((resolve) => {
        const tables = ['users', 'students', 'instructors', 'vehicles', 'lessons', 
                       'exams', 'questions', 'payments', 'packages'];
        
        console.log('🔍 Verification:\n');
        let checked = 0;
        
        tables.forEach(table => {
            db.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
                checked++;
                if (!err) {
                    const icon = row.count > 0 ? '✓' : '⚠️ ';
                    console.log(`   ${icon} ${table.padEnd(15)}: ${row.count.toString().padStart(5)} records`);
                }
                if (checked === tables.length) {
                    console.log('');
                    resolve();
                }
            });
        });
    });
}

/**
 * Main execution
 */
(async () => {
    try {
        if (dropTables) {
            await dropAllTables();
        }
        
        console.log('⚙️  Creating tables...');
        await executeStatements(createStatements, 'Tables');
        
        console.log('\n📝 Inserting data...');
        await executeStatements(insertStatements, 'Inserts');
        
        console.log('');
        await verify();
        
        console.log('✅ Database loaded successfully!\n');
        
        db.close();
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        db.close();
        process.exit(1);
    }
})();
