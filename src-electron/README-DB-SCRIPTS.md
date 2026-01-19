# load-schema.js

**Purpose:** Load questions and database schema from `sqlite_schema.sql` into the SQLite database.

## Quick Start

```bash
# Fresh load (recommended for first time)
node load-schema.js --drop-tables

# Update existing database
node load-schema.js
```

## Features

✅ Automatically parses CREATE TABLE and INSERT statements  
✅ Progress tracking with real-time updates  
✅ Transaction support for data integrity  
✅ Verification of loaded data  
✅ Fresh database mode with `--drop-tables` flag  
✅ Error reporting with detailed logging

## Usage Examples

### First Time Setup

```bash
cd src-electron
node load-schema.js --drop-tables
```

This will:

1. Drop all existing tables
2. Create fresh tables from schema
3. Insert all data
4. Verify the results

### Update Existing Data

```bash
node load-schema.js
```

This will add new data but skip already existing tables (you'll see "already exists" warnings, which is normal).

## Output Example

```text
=== TrafQuiz Database Schema Loader ===

📖 Reading: sqlite_schema.sql
   Size: 324.5 KB

📊 Parsed SQL:
   CREATE statements: 20
   INSERT statements: 17

⚙️  Creating tables...
   Tables: 100% (20/20)

📝 Inserting data...
   Inserts: 100% (17/17)

🔍 Verification:

   ✓ users          :     5 records
   ✓ questions      :    51 records
   ...

✅ Database loaded successfully!
```

## Command Line Options

| Option          | Description                                  |
|-----------------|----------------------------------------------|
| `--drop-tables` | Drop all tables before loading (fresh start) |
| `--fresh`       | Alias for `--drop-tables`                    |

## Troubleshooting

### Questions not loading completely

Some complex INSERT statements with special characters may fail. If you see warnings about specific question batches, you can:

- Use `insert-questions.js` for more targeted question loading
- Check `sqlite_schema.sql` for syntax issues in those specific lines

### Tables already exist

This is normal if running without `--drop-tables`. Use the flag for a fresh start.

## Related Scripts

- **populate-db.js** - Simple alternative that executes entire SQL file at once
- **insert-questions.js** - Focused on loading questions only with better parsing

## Database Verification

After loading, the script verifies these tables:

- users
- students
- instructors  
- vehicles
- lessons
- exams
- questions
- payments
- packages

Each table shows a record count to confirm successful loading.
