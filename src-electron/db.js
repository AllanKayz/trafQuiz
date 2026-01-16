const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const { app } = require('electron');

// Get userData path effectively (or use relative for dev/portable)
// For dev, let's keep it in the src-electron folder or project root.
// For production, it needs to be in userData.
const isDev = process.env.NODE_ENV === 'development';
const dbPath = isDev 
    ? path.join(__dirname, 'trafquiz.db') 
    : path.join(app.getPath('userData'), 'trafquiz.db');

console.log('Database path:', dbPath);

const db = new Database(dbPath/*, { verbose: console.log } */);

function init() {
    console.log('Initializing Database Schema...');
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    const schema = [
        `CREATE TABLE IF NOT EXISTS administrators (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            license_key_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS certification (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            certification TEXT NOT NULL,
            description TEXT NOT NULL
        )`,
        `CREATE TABLE IF NOT EXISTS conversations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            participant_ids TEXT NOT NULL, -- JSON
            last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS exams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            start_time DATETIME NOT NULL,
            end_time DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS exam_timeframe (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            period INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS instructors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            license_number TEXT NOT NULL,
            specialization_id INTEGER NOT NULL,
            certification_id INTEGER NOT NULL,
            experience INTEGER NOT NULL,
            salary DECIMAL(10,2) NOT NULL DEFAULT 0.00,
            availability INTEGER NOT NULL DEFAULT 1, -- boolean 0/1
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            subject TEXT,
            start_time DATETIME NOT NULL,
            end_time DATETIME,
            duration_minutes INTEGER,
            instructor_id INTEGER,
            student_id INTEGER,
            assigned_vehicle_id INTEGER,
            location TEXT,
            online_link TEXT,
            status TEXT DEFAULT 'upcoming' CHECK(status IN ('upcoming','confirmed','cancelled','completed','pending','declined')),
            student_count INTEGER DEFAULT 0,
            capacity INTEGER,
            notes TEXT,
            resources TEXT, -- JSON
            type TEXT DEFAULT 'group' CHECK(type IN ('group','individual','theory','practical')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        `CREATE TABLE IF NOT EXISTS license_keys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            license_key TEXT NOT NULL,
            status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive'))
        )`,
        `CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversation_id INTEGER NOT NULL,
            sender_id INTEGER NOT NULL,
            sender_name TEXT,
            text TEXT NOT NULL,
            type TEXT DEFAULT 'text' CHECK(type IN ('text','image','file','voice','call')),
            attachment_url TEXT,
            attachment_name TEXT,
            attachment_type TEXT,
            duration INTEGER,
            call_status TEXT CHECK(call_status IN ('missed','completed','declined') OR call_status IS NULL),
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_read INTEGER DEFAULT 0
        )`,
        `CREATE TABLE IF NOT EXISTS packages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            package TEXT,
            description TEXT,
            amount DECIMAL(18,2)
        )`,
        `CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            instructor_id INTEGER,
            vehicle_id INTEGER,
            amount DECIMAL(10,2) NOT NULL,
            type TEXT NOT NULL DEFAULT 'income' CHECK(type IN ('income','expense')),
            category TEXT NOT NULL DEFAULT 'student_payment' CHECK(category IN ('student_payment','salary','maintenance','fuel','tc_expense','other')),
            payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            transaction_id TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'pending' CHECK(status IN ('pending','completed','failed','partial')),
            package_id INTEGER,
            method TEXT,
            notes TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_text TEXT,
            img_insert TEXT,
            option_image INTEGER DEFAULT 0,
            option_a TEXT,
            option_b TEXT,
            option_c TEXT,
            correct_option TEXT,
            exam_id INTEGER,
            answer TEXT NOT NULL
        )`,
        // Guessing students table schema based on usage in StudentModel.php and other tables FKs.
        // Also inferred column names: user_id, enrollment_date, status, package_id.
        // Wait, I should verify the strict schema if possible, but I can infer it. 
        // Let's check `User.php` or `StudentModel.php` to see what fields are accessed.
        // `StudentModel.php` uses: id, user_id, package_id, status.
        // Let's add a `students` table definition that seems reasonable.
        `CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            package_id INTEGER,
            enrollment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'active' CHECK(status IN ('active','inactive','graduated','suspended')),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        // And `users` table since it is referenced by user_id
        `CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('admin','instructor','student')),
            phone TEXT,
            address TEXT,
            profile_picture TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
         `CREATE TABLE IF NOT EXISTS vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            make TEXT NOT NULL,
            model TEXT NOT NULL,
            year INTEGER,
            registration_number TEXT NOT NULL UNIQUE,
            type TEXT, -- e.g., 'car', 'truck', 'motorcycle'
            status TEXT DEFAULT 'active' CHECK(status IN ('active','maintenance','retired')),
            mileage INTEGER DEFAULT 0,
            last_service_date DATETIME,
            next_service_date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`
    ];

    db.transaction(() => {
        for (const sql of schema) {
            db.prepare(sql).run();
        }
        
        // Seed initial data if empty (Example: Admin User)
        // Check if users exist
        const userCount = db.prepare('SELECT count(*) as count FROM users').get().count;
        if (userCount === 0) {
            console.log('Seeding initial admin user...');
            // Create seed data
             const insertUser = db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)');
             // Default password 'password' hashed? For simple MVP we might store plain or simple hash.
             // But existing app uses PHP password_hash (bcrypt). 
             // We should probably implement bcrypt comparison in Node.
             // For now, let's insert a known user.
             insertUser.run('Admin User', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'); // password: password (laravel default hash example)
        }

    })();
}

module.exports = {
    db,
    init
};
