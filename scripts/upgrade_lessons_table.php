<?php
require __DIR__ . '/../vendor/autoload.php';
use TrafQuiz\Core\Database;

try {
    $db = new Database();
    $pdo = $db->getConnection();

    // Check if lessons table has 'title' column
    $stmt = $pdo->query("SHOW COLUMNS FROM lessons LIKE 'title'");
    $col = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($col) {
        echo "No upgrade needed: 'title' column exists.\n";
        exit(0);
    }

    echo "Upgrading lessons table: adding missing columns...\n";

    $sqls = [
        "ALTER TABLE lessons ADD COLUMN title VARCHAR(255) DEFAULT NULL",
        "ALTER TABLE lessons ADD COLUMN subject VARCHAR(100) DEFAULT NULL",
        "ALTER TABLE lessons ADD COLUMN startTime DATETIME DEFAULT NULL",
        "ALTER TABLE lessons ADD COLUMN endTime DATETIME DEFAULT NULL",
        "ALTER TABLE lessons ADD COLUMN durationMinutes INT DEFAULT NULL",
        "ALTER TABLE lessons ADD COLUMN instructor_name VARCHAR(255) DEFAULT NULL",
        "ALTER TABLE lessons ADD COLUMN instructor_avatar VARCHAR(255) DEFAULT NULL",
        "ALTER TABLE lessons ADD COLUMN location VARCHAR(255) DEFAULT NULL",
        "ALTER TABLE lessons ADD COLUMN onlineLink VARCHAR(512) DEFAULT NULL",
        "ALTER TABLE lessons ADD COLUMN status ENUM('upcoming','cancelled','completed','rescheduled') NOT NULL DEFAULT 'upcoming'",
        "ALTER TABLE lessons ADD COLUMN studentCount INT NOT NULL DEFAULT 0",
        "ALTER TABLE lessons ADD COLUMN capacity INT DEFAULT NULL",
        "ALTER TABLE lessons ADD COLUMN notes TEXT DEFAULT NULL",
        "ALTER TABLE lessons ADD COLUMN resources TEXT DEFAULT NULL",
        "ALTER TABLE lessons ADD COLUMN createdAt DATETIME DEFAULT NULL",
        "ALTER TABLE lessons ADD COLUMN updatedAt DATETIME DEFAULT NULL"
    ];

    foreach ($sqls as $s) {
        $pdo->exec($s);
    }

    echo "Upgrade completed.\n";
} catch (Exception $e) {
    echo "Upgrade failed: " . $e->getMessage() . "\n";
    exit(1);
}
