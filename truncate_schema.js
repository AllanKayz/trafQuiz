const fs = require('fs');
const path = 'src-electron/sqlite_schema.sql';
const lines = fs.readFileSync(path, 'utf8').split('\n');

// Keep lines 1 to 364 (0-indexed: 0 to 363)
const newContent = lines.slice(0, 364).join('\n');

fs.writeFileSync(path, newContent, 'utf8');
console.log(`Truncated sqlite_schema.sql to ${lines.slice(0, 364).length} lines.`);
