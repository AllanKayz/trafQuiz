-- Migration: create lessons table
CREATE TABLE IF NOT EXISTS `lessons` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `subject` VARCHAR(100) DEFAULT NULL,
  `startTime` DATETIME NOT NULL,
  `endTime` DATETIME DEFAULT NULL,
  `durationMinutes` INT DEFAULT NULL,
  `instructor_id` INT DEFAULT NULL,
  `instructor_name` VARCHAR(255) DEFAULT NULL,
  `instructor_avatar` VARCHAR(255) DEFAULT NULL,
  `location` VARCHAR(255) DEFAULT NULL,
  `onlineLink` VARCHAR(512) DEFAULT NULL,
  `status` ENUM('upcoming','cancelled','completed','rescheduled') NOT NULL DEFAULT 'upcoming',
  `studentCount` INT NOT NULL DEFAULT 0,
  `capacity` INT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `resources` TEXT DEFAULT NULL,
  `createdAt` DATETIME DEFAULT NULL,
  `updatedAt` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;