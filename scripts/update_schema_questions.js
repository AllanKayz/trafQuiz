const fs = require('fs');
const path = require('path');

const SCHEMA_PATH = path.join(__dirname, '..', 'src-electron', 'sqlite_schema.sql');
const DUMP_PATH = path.join(__dirname, '..', 'traffiquiz_normalized.sql');

function updateSchema() {
    console.log('Updating sqlite_schema.sql with all questions...');
    
    let schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    const dump = fs.readFileSync(DUMP_PATH, 'utf8');

    // 1. Find and remove existing questions seeding in schema
    // It starts after "-- Questions (Sample batch)"
    const separator = '-- Questions (Sample batch)';
    const parts = schema.split(separator);
    
    if (parts.length < 2) {
        console.error('Could not find questions separator in schema.');
        return;
    }

    let newSchema = parts[0] + separator + '\n';

    // 2. Extract all INSERT INTO `questions` from dump
    const lines = dump.split('\n');
    let questionInserts = [];
    let isQuestion = false;

    for (const line of lines) {
        if (line.includes('INSERT INTO `questions`')) {
            isQuestion = true;
            questionInserts.push(line.replace(/\\'/g, "''").replace(/`/g, '`'));
            continue;
        }

        if (isQuestion) {
            questionInserts.push(line.replace(/\\'/g, "''"));
            if (line.trim().endsWith(';')) {
                isQuestion = false;
            }
        }
    }

    newSchema += questionInserts.join('\n') + '\n';

    fs.writeFileSync(SCHEMA_PATH, newSchema);
    console.log(`Successfully updated ${SCHEMA_PATH} with ${questionInserts.length} lines of questions.`);
}

updateSchema();
