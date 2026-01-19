# Loading Questions into SQLite Database

This guide explains how to load questions from SQL files into your TrafQuiz SQLite database.

## Available Scripts

### 1. `load-questions.js` ⭐ (New - Dedicated for questions.sql)

**Purpose:** Load questions specifically from `questions.sql` file.

**Usage:**

```bash
node load-questions.js
```

**What it does:**

- Clears all existing questions from database
- Parses INSERT statements from phpMyAdmin dump format
- Loads questions in a transaction
- Verifies the loaded data
- Shows progress and error reporting

**Expected Results:**

```
=== Questions Database Loader ===

📖 Reading: questions.sql
   Size: 306.0 KB

🔧 Parsing INSERT statements...
   ✓ Found 7 INSERT statements

📝 Loading questions...
   Progress: 100% (7/7)

🔍 Verification:
   ✓ Total questions loaded: 51+
   
   Questions by exam:
      Exam 1: 25 questions
      Exam 2: 26 questions
      ...

✅ Questions loaded successfully!
```

### 2. `load-schema.js` (For complete schema)

**Purpose:** Load everything from `sqlite_schema.sql` (tables + all data including questions).

**Usage:**

```bash
# Fresh database
node load-schema.js --drop-tables

# Update existing
node load-schema.js
```

### 3. `insert-questions.js` (Alternative for sqlite_schema.sql)

**Purpose:** Load questions from the questions section in `sqlite_schema.sql`.

**Usage:**

```bash
node insert-questions.js
```

## Which Script Should I Use?

| Scenario | Recommended Script |
|----------|-------------------|
| **Load questions from `questions.sql`** | `node load-questions.js` ✅ |
| **Initial database setup** | `node load-schema.js --drop-tables` |
| **Update all data from schema** | `node load-schema.js` |
| **Load questions from `sqlite_schema.sql`** | `node insert-questions.js` |

## File Locations

```
src-electron/
├── questions.sql           # phpMyAdmin dump with questions only
├── sqlite_schema.sql       # Complete schema + all data
├── trafquiz_app.db        # SQLite database file
├── load-questions.js      # ⭐ Load from questions.sql
├── load-schema.js         # Load complete schema
└── insert-questions.js    # Load from sqlite_schema.sql
```

## Quick Reference

### Load Questions Only

```bash
cd src-electron
node load-questions.js
```

### Fresh Database Setup

```bash
cd src-electron
node load-schema.js --drop-tables
```

### Verify Questions Count

```bash
# Using SQLite command line
sqlite3 trafquiz_app.db "SELECT COUNT(*) FROM questions;"

# Or check in the script output after running
```

## Troubleshooting

### "Table already exists" Error

- Use `load-schema.js --drop-tables` to start fresh
- Or the script will skip table creation and just load data

### Fewer Questions Than Expected

- Some complex INSERT statements with special characters may fail parsing
- Check the error output for specific issues
- The script shows how many questions were successfully loaded

### Database Locked

- Make sure no other processes are accessing the database
- Close any SQLite browser tools
- Stop the Electron app if it's running

## Notes

- All scripts use transactions for data integrity
- Progress is shown in real-time
- Errors are logged but don't stop the entire process
- Existing questions are cleared before new ones are loaded
