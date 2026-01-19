const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

/**
 * Load questions from questions.sql into SQLite database
 * Parses and executes INSERT statements individually for better compatibility
 */

const dbPath = path.join(__dirname, 'trafquiz_app.db');
const questionsPath = path.join(__dirname, 'questions.sql');

console.log('=== Questions Database Loader ===\n');

// Check files
if (!fs.existsSync(questionsPath)) {
    console.error(`❌ File not found: ${questionsPath}`);
    process.exit(1);
}

console.log(`📖 Reading: ${path.basename(questionsPath)}`);
const fullSql = fs.readFileSync(questionsPath, 'utf8');
const fileSize = (fs.statSync(questionsPath).size / 1024).toFixed(1);
console.log(`   Size: ${fileSize} KB\n`);

console.log('🔧 Parsing INSERT statements...');

// Split by "INSERT INTO `questions`" but keep the delimiter
const parts = fullSql.split(/(INSERT INTO `questions`)/);
const statements = [];

// Reconstruct complete INSERT statements
for (let i = 1; i < parts.length; i += 2) {
    if (i + 1 < parts.length) {
        // Reconstruct the INSERT statement
        let statement = parts[i] + parts[i + 1];
        
        // Find the proper ending - look for ');' followed by newline or end
        const properEnd = statement.search(/\)\s*;\s*(\n|$)/);
        if (properEnd !== -1) {
            statement = statement.substring(0, properEnd + 2); // Include ');'
            statements.push(statement);
        }
    }
}

console.log(`   ✓ Found ${statements.length} INSERT statements\n`);

if (statements.length === 0) {
    console.error('❌ No INSERT statements found!');
    process.exit(1);
}

// Open database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Database error:', err.message);
        process.exit(1);
    }
    console.log('✓ Database connected\n');
});

// Execute statements
db.serialize(() => {
    console.log('📝 Loading questions...\n');
    
    db.run('BEGIN TRANSACTION');
    
    console.log('   Clearing existing questions...');
    db.run('DELETE FROM questions', (err) => {
        if (err) {
            console.error('   ❌ Error:', err.message);
            db.run('ROLLBACK');
            process.exit(1);
        }
        
        console.log('   ✓ Questions cleared\n');
        
        let processed = 0;
        let errors = 0;
        const errorDetails = [];
        
        console.log('   Inserting data:');
        
        statements.forEach((sql, index) => {
            db.exec(sql, (err) => {
                if (err) {
                    errorDetails.push({
                        batch: index + 1,
                        error: err.message,
                        preview: sql.substring(0, 100) + '...'
                    });
                    errors++;
                }
                
                processed++;
                const pct = ((processed / statements.length) * 100).toFixed(0);
                process.stdout.write(`\r   Progress: ${pct}% (${processed}/${statements.length}) - Errors: ${errors}`);
                
                if (processed === statements.length) {
                    console.log('\n');
                    
                    if (errors > 0) {
                        console.warn(`   ⚠️  ${errors} errors encountered:\n`);
                        errorDetails.slice(0, 3).forEach(e => {
                            console.log(`      Batch #${e.batch}: ${e.error}`);
                        });
                        if (errorDetails.length > 3) {
                            console.log(`      ... and ${errorDetails.length - 3} more\n`);
                        }
                    }
                    
                    console.log('   Committing transaction...');
                    db.run('COMMIT', (err) => {
                        if (err) {
                            console.error('   ❌ Commit error:', err.message);
                            process.exit(1);
                        }
                        
                        // Verify count
                        db.get('SELECT COUNT(*) as count FROM questions', (err, row) => {
                            console.log('\n🔍 Verification:');
                            
                            if (err) {
                                console.error('   ❌ Count error:', err.message);
                            } else {
                                console.log(`   ✓ Total questions loaded: ${row.count}`);
                                console.log(`   Expected: ~${statements.length * 200} questions\n`);
                            }
                            
                            // Show questions per exam
                            db.all(`
                                SELECT exam_id, COUNT(*) as count 
                                FROM questions 
                                WHERE exam_id IS NOT NULL
                                GROUP BY exam_id 
                                ORDER BY exam_id
                                LIMIT 10
                            `, (err, rows) => {
                                if (!err && rows && rows.length > 0) {
                                    console.log('   Questions by exam:');
                                    rows.forEach(r => {
                                        console.log(`      Exam ${r.exam_id}: ${r.count} questions`);
                                    });
                                    if (rows.length >= 10) {
                                        console.log('      ... (showing first 10 exams)');
                                    }
                                }
                                
                                console.log('\n✅ Questions loaded successfully!\n');
                                
                                db.close();
                                process.exit(0);
                            });
                        });
                    });
                }
            });
        });
    });
});

// Handle errors
process.on('uncaughtException', (err) => {
    console.error('\n❌ Unexpected error:', err.message);
    db.close();
    process.exit(1);
});
