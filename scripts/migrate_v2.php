<?php

require_once __DIR__ . '/../src/Core/Database.php';

use TrafQuiz\Core\Database;

try {
    $db = new Database();
    $conn = $db->getConnection();

    echo "Starting migration...\n";

    // 1. Update lessons table
    echo "Updating lessons table...\n";
    $conn->exec("ALTER TABLE lessons 
        MODIFY COLUMN status ENUM('upcoming', 'cancelled', 'completed', 'rescheduled', 'pending', 'confirmed', 'declined') DEFAULT 'upcoming',
        ADD COLUMN IF NOT EXISTS student_name VARCHAR(255) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS type ENUM('group', 'private') DEFAULT 'group',
        ADD COLUMN IF NOT EXISTS assigned_vehicle_id INT(11) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS vehicle_type VARCHAR(100) DEFAULT NULL
    ");

    // 2. Create conversations table
    echo "Creating conversations table...\n";
    $conn->exec("CREATE TABLE IF NOT EXISTS conversations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) DEFAULT NULL,
        participant_ids JSON NOT NULL,
        last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // 3. Create messages table
    echo "Creating messages table...\n";
    $conn->exec("CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        conversation_id INT NOT NULL,
        sender_id INT NOT NULL,
        sender_name VARCHAR(255) DEFAULT NULL,
        text TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_read TINYINT(1) DEFAULT 0,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // 4. Update payments table if needed
    echo "Checking payments table...\n";
    $conn->exec("ALTER TABLE payments 
        ADD COLUMN IF NOT EXISTS status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
        ADD COLUMN IF NOT EXISTS package_id INT(11) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS method VARCHAR(50) DEFAULT NULL
    ");

    echo "Migration completed successfully!\n";

} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
