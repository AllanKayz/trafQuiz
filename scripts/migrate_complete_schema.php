<?php

require(__DIR__ . '/../vendor/autoload.php');
//require '../vendor/autoload.php';

use TrafQuiz\Core\Database;

echo "=== TrafQuiz Complete Schema Migration ===\n\n";

try {
    $db = new Database();
    $conn = $db->getConnection();

    echo "Connected to database successfully.\n\n";

    // Start transaction
    //$conn->beginTransaction();

    if (!$conn->inTransaction()) {
        $conn->beginTransaction(); 
    }

    // 1. CREATE USERS TABLE
    echo "Creating 'users' table...\n";
    $conn->exec("
        CREATE TABLE IF NOT EXISTS `users` (
            `id` INT(11) NOT NULL AUTO_INCREMENT,
            `username` VARCHAR(100) NOT NULL UNIQUE,
            `password` VARCHAR(255) NOT NULL,
            `role` ENUM('admin', 'instructor', 'student') NOT NULL,
            `firstName` VARCHAR(100),
            `lastName` VARCHAR(100),
            `email` VARCHAR(255) UNIQUE,
            `phone` VARCHAR(20),
            `reset_token` VARCHAR(255),
            `reset_token_expires` DATETIME,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            INDEX `idx_username` (`username`),
            INDEX `idx_email` (`email`),
            INDEX `idx_role` (`role`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    ");
    echo "✓ Users table created/verified\n\n";

    // 2. CREATE STUDENTS TABLE
    echo "Creating 'students' table...\n";
    $conn->exec("
        CREATE TABLE IF NOT EXISTS `students` (
            `id` INT(11) NOT NULL AUTO_INCREMENT,
            `userid` INT(11) NOT NULL,
            `firstName` VARCHAR(100) NOT NULL,
            `lastName` VARCHAR(100) NOT NULL,
            `email` VARCHAR(255) NOT NULL,
            `phone` VARCHAR(20),
            `address` TEXT,
            `enrollmentDate` DATE,
            `packageId` INT(11),
            `status` ENUM('active', 'inactive', 'suspended', 'completed') DEFAULT 'active',
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            FOREIGN KEY (`userid`) REFERENCES `users`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`packageId`) REFERENCES `packages`(`id`) ON DELETE SET NULL,
            INDEX `idx_status` (`status`),
            INDEX `idx_email` (`email`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    ");
    echo "✓ Students table created/verified\n\n";

    // 3. DROP AND RECREATE LESSONS TABLE (incompatible schema)
    echo "Updating 'lessons' table...\n";
    $conn->exec("DROP TABLE IF EXISTS `lessons`");
    $conn->exec("
        CREATE TABLE `lessons` (
            `id` INT(11) NOT NULL AUTO_INCREMENT,
            `title` VARCHAR(200) NOT NULL,
            `subject` VARCHAR(100),
            `startTime` DATETIME NOT NULL,
            `endTime` DATETIME,
            `durationMinutes` INT,
            `instructor_id` INT(11),
            `instructor_name` VARCHAR(200),
            `instructor_avatar` VARCHAR(500),
            `student_id` INT(11),
            `student_name` VARCHAR(200),
            `location` VARCHAR(200),
            `onlineLink` VARCHAR(500),
            `status` ENUM('upcoming', 'confirmed', 'cancelled', 'completed', 'pending', 'declined') DEFAULT 'upcoming',
            `studentCount` INT DEFAULT 0,
            `capacity` INT,
            `notes` TEXT,
            `resources` JSON,
            `type` ENUM('group', 'individual', 'theory', 'practical') DEFAULT 'group',
            `assigned_vehicle_id` INT(11),
            `vehicle_type` VARCHAR(50),
            `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            INDEX `idx_status` (`status`),
            INDEX `idx_startTime` (`startTime`),
            INDEX `idx_instructor` (`instructor_id`),
            INDEX `idx_student` (`student_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    ");
    echo "✓ Lessons table recreated with new schema\n\n";

    // 4. CREATE VEHICLES TABLE
    echo "Creating 'vehicles' table...\n";
    $conn->exec("
        CREATE TABLE IF NOT EXISTS `vehicles` (
            `id` INT(11) NOT NULL AUTO_INCREMENT,
            `make` VARCHAR(100) NOT NULL,
            `model` VARCHAR(100) NOT NULL,
            `year` INT,
            `registration` VARCHAR(50) UNIQUE NOT NULL,
            `type` ENUM('car', 'truck', 'motorcycle', 'bus') DEFAULT 'car',
            `status` ENUM('active', 'maintenance', 'retired') DEFAULT 'active',
            `notes` TEXT,
            `createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `updatedAt` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE INDEX `idx_registration` (`registration`),
            INDEX `idx_type` (`type`),
            INDEX `idx_status` (`status`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    ");
    echo "✓ Vehicles table created/verified\n\n";

    // 5. CREATE CONVERSATIONS TABLE
    echo "Creating 'conversations' table...\n";
    $conn->exec("
        CREATE TABLE IF NOT EXISTS `conversations` (
            `id` INT(11) NOT NULL AUTO_INCREMENT,
            `participant_ids` JSON NOT NULL,
            `title` VARCHAR(200),
            `last_message_at` DATETIME,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    ");
    echo "✓ Conversations table created/verified\n\n";

    // 6. CREATE MESSAGES TABLE
    echo "Creating 'messages' table...\n";
    $conn->exec("
        CREATE TABLE IF NOT EXISTS `messages` (
            `id` INT(11) NOT NULL AUTO_INCREMENT,
            `conversation_id` INT(11) NOT NULL,
            `sender_id` INT(11) NOT NULL,
            `sender_name` VARCHAR(200),
            `text` TEXT NOT NULL,
            `timestamp` DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE CASCADE,
            INDEX `idx_conversation` (`conversation_id`),
            INDEX `idx_timestamp` (`timestamp`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    ");
    echo "✓ Messages table created/verified\n\n";

    // 7. UPDATE INSTRUCTORS TABLE
    echo "Updating 'instructors' table...\n";

    // Check if columns exist before adding
    $checkFirstName = $conn->query("SHOW COLUMNS FROM `instructors` LIKE 'firstName'");
    if ($checkFirstName->rowCount() == 0) {
        $conn->exec("ALTER TABLE `instructors` ADD COLUMN `firstName` VARCHAR(100) AFTER `name`");
        echo "  - Added firstName column\n";
    }

    $checkLastName = $conn->query("SHOW COLUMNS FROM `instructors` LIKE 'lastName'");
    if ($checkLastName->rowCount() == 0) {
        $conn->exec("ALTER TABLE `instructors` ADD COLUMN `lastName` VARCHAR(100) AFTER `firstName`");
        echo "  - Added lastName column\n";
    }

    echo "✓ Instructors table updated\n\n";

    // 8. CREATE SPECIALIZATION TABLE IF NOT EXISTS (note: singular naming)
    echo "Creating 'specialization' table if not exists...\n";
    $conn->exec("
        CREATE TABLE IF NOT EXISTS `specialization` (
            `id` INT(11) NOT NULL AUTO_INCREMENT,
            `specialization` VARCHAR(255) NOT NULL,
            `description` TEXT,
            PRIMARY KEY (`id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    ");
    echo "✓ Specialization table verified\n\n";

    // Commit transaction
    //$conn->commit();

    if ($conn->inTransaction()) { $conn->commit(); }

    echo "\n=== Migration Completed Successfully ===\n";
    echo "All tables created/updated.\n";
    echo "\nNext steps:\n";
    echo "1. Run seed scripts to populate initial data\n";
    echo "2. Test API endpoints\n";
    echo "3. Verify frontend integration\n";
} catch (Exception $e) {
    /*if (isset($conn)) {
        $conn->rollBack();
    }*/

    if ($conn->inTransaction()) { 
        $conn->rollBack(); 
    }

    //fecho "Error: " . $e->getMessage();
    echo "\n❌ Migration failed: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}
