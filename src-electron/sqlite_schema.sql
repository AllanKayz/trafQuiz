-- Traffiquiz SQLite Schema

CREATE TABLE `users` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'user',
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `packages` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `package` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `amount` decimal(18,2) DEFAULT NULL
);

CREATE TABLE `students` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `user_id` INTEGER NOT NULL,
  `address` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `package_id` INTEGER DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE SET NULL
);

CREATE TABLE `specialization` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `specialization` varchar(255) NOT NULL,
  `description` text DEFAULT NULL
);

CREATE TABLE `certification` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `certification` varchar(255) NOT NULL,
  `description` text NOT NULL
);

CREATE TABLE `instructors` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `user_id` INTEGER NOT NULL,
  `license_number` varchar(255) NOT NULL,
  `specialization_id` INTEGER NOT NULL,
  `certification_id` INTEGER NOT NULL,
  `experience` INTEGER NOT NULL,
  `salary` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` varchar(50) DEFAULT 'active',
  `availability` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`specialization_id`) REFERENCES `specialization` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`certification_id`) REFERENCES `certification` (`id`) ON DELETE SET NULL
);

CREATE TABLE `vehicles` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `instructor_id` INTEGER DEFAULT NULL,
  `make` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `year` INTEGER DEFAULT NULL,
  `registration` varchar(50) DEFAULT NULL,
  `type` varchar(50) DEFAULT 'car',
  `status` VARCHAR(50) DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`instructor_id`) REFERENCES `instructors` (`id`) ON DELETE SET NULL
);

CREATE TABLE `lessons` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `title` varchar(200) NOT NULL,
  `subject` varchar(100) DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `duration_minutes` INTEGER DEFAULT NULL,
  `instructor_id` INTEGER DEFAULT NULL,
  `student_id` INTEGER DEFAULT NULL,
  `assigned_vehicle_id` INTEGER DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `online_link` varchar(500) DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'upcoming',
  `student_count` INTEGER DEFAULT 0,
  `capacity` INTEGER DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `resources` text DEFAULT NULL,
  `type` VARCHAR(50) DEFAULT 'group',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`instructor_id`) REFERENCES `instructors` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`assigned_vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL
);

CREATE TABLE `exams` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `name` varchar(100) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `questions` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `question_text` text DEFAULT NULL,
  `img_insert` varchar(300) DEFAULT NULL,
  `option_image` tinyint(4) DEFAULT 0,
  `option_a` text DEFAULT NULL,
  `option_b` text DEFAULT NULL,
  `option_c` text DEFAULT NULL,
  `correct_option` varchar(45) DEFAULT NULL,
  `exam_id` INTEGER DEFAULT NULL,
  `answer` varchar(255) NOT NULL,
  FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE SET NULL
);

CREATE TABLE `payments` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `student_id` INTEGER DEFAULT NULL,
  `instructor_id` INTEGER DEFAULT NULL,
  `vehicle_id` INTEGER DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT 'income',
  `category` VARCHAR(50) NOT NULL DEFAULT 'student_payment',
  `payment_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `transaction_id` varchar(100) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'pending',
  `package_id` INTEGER DEFAULT NULL,
  `method` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`instructor_id`) REFERENCES `instructors` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL
);

CREATE TABLE `vehicle_issues` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `vehicle_id` INTEGER NOT NULL,
  `instructor_id` INTEGER NOT NULL,
  `description` text NOT NULL,
  `severity` VARCHAR(50) DEFAULT 'low',
  `status` VARCHAR(50) DEFAULT 'open',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`instructor_id`) REFERENCES `instructors` (`id`) ON DELETE CASCADE
);

CREATE TABLE `vehicle_logs` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `vehicle_id` INTEGER NOT NULL,
  `instructor_id` INTEGER NOT NULL,
  `mileage` INTEGER NOT NULL,
  `fuel_level` INTEGER NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`instructor_id`) REFERENCES `instructors` (`id`) ON DELETE CASCADE
);

CREATE TABLE `reports` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `student_id` INTEGER NOT NULL,
  `exam_count` INTEGER NOT NULL DEFAULT 0,
  `total_score` INTEGER NOT NULL DEFAULT 0,
  `average_score` decimal(5,2) DEFAULT 0.00,
  `progress_summary` text DEFAULT NULL,
  `generated_at` datetime DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE
);

CREATE TABLE `student_exams` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `student_id` INTEGER NOT NULL,
  `exam_id` INTEGER NOT NULL,
  `score` INTEGER DEFAULT 0,
  `completed_at` datetime DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE
);

CREATE TABLE `student_exam_history` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `student_id` INTEGER NOT NULL,
  `exam_id` INTEGER NOT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE
);

CREATE TABLE `conversations` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `participant_ids` text DEFAULT NULL,
  `last_message_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `messages` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `conversation_id` INTEGER NOT NULL,
  `sender_id` INTEGER NOT NULL,
  `sender_name` varchar(255) DEFAULT NULL,
  `text` text NOT NULL,
  `type` VARCHAR(50) DEFAULT 'text',
  `attachment_url` varchar(255) DEFAULT NULL,
  `attachment_name` varchar(255) DEFAULT NULL,
  `attachment_type` varchar(100) DEFAULT NULL,
  `duration` INTEGER DEFAULT NULL,
  `call_status` VARCHAR(50) DEFAULT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint(1) DEFAULT 0,
  FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
);

CREATE TABLE `exam_timeframe` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `exam_id` INTEGER NOT NULL,
  `period` INTEGER NOT NULL DEFAULT 30,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
   FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE
);

CREATE TABLE `license_keys` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `license_key` varchar(100) NOT NULL,
  `status` VARCHAR(50) DEFAULT 'active'
);

CREATE TABLE `system_license` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `device_id` text NOT NULL,
  `system_license_key` text NOT NULL,
  `business_name` varchar(255) NOT NULL
);

-- INITIAL SEEDING
-- Certification
INSERT INTO `certification` (`id`, `certification`, `description`) VALUES
(1, 'TSCZ Instructor Certificate', 'Traffic Safety Council of Zimbabwe Instructor Certification');

-- Specialization
INSERT INTO `specialization` (`id`, `specialization`, `description`) VALUES
(1, 'Advanced Driving', ''),
(2, 'Commercial License', ''),
(3, 'Beginner Courses', '');

-- Packages
INSERT INTO `packages` (`id`, `package`, `description`, `amount`) VALUES
(1, 'Provisional Drivers Certificate', '', 2.00),
(2, 'Light Motor Vehicles(Class 4)', '', 10.00),
(3, 'Motor Cycles (Class 3)', '', 5.00),
(4, 'Heavy Motor Vehicles (Class 2)', '', 20.00),
(5, 'Public Motor Vehicles (Class 1)', '', 30.00);

-- Users (Password is '123456' for all)
INSERT INTO `users` (`id`, `username`, `password`, `role`, `first_name`, `last_name`, `email`, `phone`, `avatar`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2y$10$j8KHrniTKtPcVga7/7HHUeFiPsC3vouihT6HFS85W/AhaAjTay6NG', 'admin', 'admin', 'admin', 'admin@gmail.com', NULL, NULL, '2026-01-10 09:21:06', '2026-01-10 09:21:06'),
(2, 'student', '$2y$10$mdCKQTJdXgPiTOpPbId1Mu1znniMET5nYfw5vKkc1Ds3PtvvC6roG', 'student', 'student', 'student', 'successchibayamagora@gmail.com', '+263782408596', NULL, '2026-01-10 09:21:06', '2026-01-11 00:35:28'),
(3, 'instructor', '$2y$10$mdCKQTJdXgPiTOpPbId1Mu1znniMET5nYfw5vKkc1Ds3PtvvC6roG', 'instructor', 'Allan', 'Kanyemba', 'allankanyemba@mail.com', '774833890', NULL, '2026-01-10 09:21:06', '2026-01-16 17:48:35'),
(51, 'testone', '$2y$10$mmhxXlh7Pjv6pCHXmJ/xS.U8iqL9XLVizo8nQmW6u9P2ZI85WxtJ2', 'student', 'Test', 'Two', 'testone@mail.com', '+263774833890', NULL, '2026-01-10 13:38:16', '2026-01-10 19:42:41'),
(52, 'joseph', '$2y$10$BVcCDu51bM8SNPLgy4ZE4OCGL7nOQF6JA1KwQUBb.hpDLnWnG6gUK', 'instructor', 'Joseph', 'Dzimiri', 'josephdzimiri@gmail.com', '+263782408596', NULL, '2026-01-10 14:59:17', '2026-01-10 19:41:54');

-- Vehicles
INSERT INTO `vehicles` (`id`, `make`, `model`, `year`, `registration`, `type`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'Toyota', 'Corolla', 2018, 'ABC-123', 'car', 'active', NULL, '2026-01-10 09:21:06', '2026-01-10 09:21:06'),
(2, 'Isuzu', 'D-Max', 2019, 'TRK-001', 'truck', 'active', NULL, '2026-01-10 09:21:06', '2026-01-10 09:21:06'),
(3, 'Honda', 'CBR', 2020, 'MOT-09', 'motorcycle', 'maintenance', NULL, '2026-01-10 09:21:06', '2026-01-10 09:21:06');

-- Instructors
INSERT INTO `instructors` (`id`, `user_id`, `license_number`, `specialization_id`, `certification_id`, `experience`, `salary`, `availability`, `created_at`, `updated_at`) VALUES
(1, 3, '12345-ZIM', 1, 1, 5, 0.00, 1, '2026-01-10 09:21:06', '2026-01-10 09:21:06'),
(2, 52, 'FFF 544678 K', 2, 1, 6, 0.00, 1, '2026-01-10 14:59:19', '2026-01-10 12:59:19');

-- Students
INSERT INTO `students` (`id`, `user_id`, `address`, `status`, `package_id`, `created_at`) VALUES
(1, 2, '4708 Chiedza Karoi', 'inactive', 1, '2025-08-16 22:07:24'),
(4, 51, '4708 Chiedza, Karoi', 'active', 2, '2026-01-10 13:38:18');

-- Lessons
INSERT INTO `lessons` (`id`, `title`, `subject`, `start_time`, `end_time`, `duration_minutes`, `instructor_id`, `student_id`, `assigned_vehicle_id`, `location`, `online_link`, `status`, `student_count`, `capacity`, `notes`, `resources`, `type`, `created_at`, `updated_at`) VALUES
(7, 'Provisional 101', 'Theory', '2026-01-15 00:00:00', NULL, 60, 2, NULL, NULL, 'Room 2', NULL, 'upcoming', 1, 7, 'manotes', NULL, 'group', '2026-01-14 00:11:29', '2026-01-14 00:16:11');

-- Exams
INSERT INTO `exams` (`id`, `name`, `start_time`, `end_time`, `created_at`, `updated_at`) VALUES
(1, 'test 1', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(2, 'test 2', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(3, 'test 3', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(4, 'test 4', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(5, 'test 5', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(6, 'test 6', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(7, 'test 7', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(8, 'test 8', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(9, 'test 9', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(10, 'test 10', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(11, 'test 11', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(12, 'test 12', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(13, 'test 13', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(14, 'test 14', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(15, 'test 15', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(16, 'test 16', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(17, 'test 17', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(18, 'test 18', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(19, 'test 19', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(20, 'test 20', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(21, 'test 21', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(22, 'test 22', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(23, 'test 23', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(24, 'test 24', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(25, 'test 25', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(26, 'test 26', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(27, 'test 27', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(28, 'test 28', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(29, 'test 29', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(30, 'test 30', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(31, 'test 31', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(32, 'test 32', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(33, 'test 33', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(34, 'test 34', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(35, 'test 35', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(36, 'test 36', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(37, 'test 37', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(38, 'test 38', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(39, 'test 39', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(40, 'test 40', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(41, 'test 41', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(42, 'test 42', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(43, 'test 43', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(44, 'test 44', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(45, 'test 45', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(46, 'test 46', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(47, 'test 47', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(48, 'test 48', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(49, 'test 49', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(50, 'test 50', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(51, 'test 51', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(52, 'test 52', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(53, 'test 53', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(54, 'test 54', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(55, 'test 55', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(56, 'test 56', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(57, 'test 57', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(58, 'test 58', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(59, 'test 59', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(60, 'test 60', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(61, 'test 61', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(62, 'test 62', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(63, 'test 63', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08'),
(64, 'test 64', '0000-00-00 00:00:00', '0000-00-00 00:00:00', '2026-01-17 17:09:08', '2026-01-17 17:09:08');

-- Payments
INSERT INTO `payments` (`id`, `student_id`, `instructor_id`, `vehicle_id`, `amount`, `type`, `category`, `payment_date`, `transaction_id`, `created_at`, `status`, `package_id`, `method`, `notes`) VALUES
(1, 1, NULL, NULL, 10.00, 'income', 'student_payment', '2026-01-11 00:26:26', 'TXN-6962D20E6A9F0', '2026-01-11 00:26:26', 'completed', NULL, 'cash', NULL),
(2, 1, NULL, NULL, 2.00, 'income', 'student_payment', '2026-01-11 00:48:47', 'TXN-6962D74B52D77', '2026-01-11 00:48:47', 'completed', NULL, 'ecocash', NULL),
(3, 1, NULL, NULL, 3.00, 'income', 'student_payment', '2026-01-11 00:49:08', 'TXN-6962D7607C5CB', '2026-01-11 00:49:08', 'completed', NULL, 'card', NULL),
(4, 1, NULL, NULL, 10.00, 'income', 'student_payment', '2026-01-11 12:07:23', 'TXN-696376598A17D', '2026-01-11 12:07:23', 'completed', 4, 'cash', NULL),
(8, NULL, 2, NULL, 5.00, 'expense', 'salary', '2026-01-11 18:33:50', 'SAL-6963D0EE3FBDC', '2026-01-11 18:33:50', 'completed', NULL, 'ecocash', ''),
(9, NULL, NULL, 2, 2.00, 'expense', 'fuel', '2026-01-11 18:34:30', 'EXP-6963D1164E5D1', '2026-01-11 18:34:30', 'completed', NULL, 'card', ''),
(10, 4, NULL, NULL, 30.00, 'income', 'student_payment', '2026-01-11 19:11:26', 'TXN-6963D9BC0A3F2', '2026-01-11 19:11:26', 'completed', 5, 'ecocash', NULL),
(11, 1, NULL, NULL, 5.00, 'income', 'student_payment', '2026-01-13 19:30:00', 'TXN-6966811418B3F', '2026-01-13 19:30:00', 'partial', NULL, 'ecocash', NULL);
