<?php
require __DIR__ . '/../vendor/autoload.php';

use TrafQuiz\Core\Database;

try {
    $db = new Database();
    $pdo = $db->getConnection();

    echo "Fixing lessons table schema...\n";

    $migrations = [
        "ALTER TABLE lessons ADD COLUMN IF NOT EXISTS subject VARCHAR(100) DEFAULT NULL AFTER title",
        "ALTER TABLE lessons ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT NULL AFTER end_time",
        "ALTER TABLE lessons ADD COLUMN IF NOT EXISTS online_link VARCHAR(512) DEFAULT NULL AFTER location",
        "ALTER TABLE lessons ADD COLUMN IF NOT EXISTS student_count INT NOT NULL DEFAULT 0 AFTER online_link",
        "ALTER TABLE lessons ADD COLUMN IF NOT EXISTS resources TEXT DEFAULT NULL AFTER notes",
        "ALTER TABLE lessons ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'group' AFTER student_id"
    ];

    foreach ($migrations as $sql) {
        try {
            $pdo->exec($sql);
            echo "Executed: $sql\n";
        } catch (Exception $e) {
            echo "Error executing $sql: " . $e->getMessage() . "\n";
        }
    }

    echo "Database schema aligned with LessonModel.\n";
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
