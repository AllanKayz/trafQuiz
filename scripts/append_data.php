<?php

$source_db = 'c:\xampp\htdocs\trafQuiz\traffiquiz_DB.sql';
$target_db = 'c:\xampp\htdocs\trafQuiz\traffiquiz_normalized.sql';

// Manual Inserts structure using NOWDOC to prevent variable parsing
$manual_inserts = <<<'SQL'
-- Users (Handling duplicates by appending ID)
INSERT INTO `users` (`id`, `username`, `password`, `email`, `role`, `first_name`, `last_name`, `reset_token`, `reset_expires`) VALUES
(1, 'admin', '$2y$10$j8KHrniTKtPcVga7/7HHUeFiPsC3vouihT6HFS85W/AhaAjTay6NG', 'admin@gmail.com', 'admin', 'admin', 'admin', NULL, NULL),
(2, 'student', '$2y$10$mdCKQTJdXgPiTOpPbId1Mu1znniMET5nYfw5vKkc1Ds3PtvvC6roG', 'student@gmail.com', 'student', 'student', 'student', NULL, NULL),
(3, 'allankayz', '$2y$10$mdCKQTJdXgPiTOpPbId1Mu1znniMET5nYfw5vKkc1Ds3PtvvC6roG', 'allankanyemba@gmail.com', 'instructor', 'Allan', 'Kanyemba', NULL, NULL),
(35, 'asankayz', '$2y$10$Eg7RHqZou0Of91scp4RsjeMmL9eqUYTVfLC8fs0PBxUyl7GJZkeba', '', 'student', '', '', NULL, NULL),
(36, 'allankayz_36', '$2y$10$29hmPayZYhj7PGo7ixLNS.tp1hnLzSq5qznRHKYcGn48X.bb3X47i', '', 'student', '', '', NULL, NULL),
(37, 'allankayz_37', '$2y$10$uzTCc1Yviy4qaygdU44ITOEeu01WWKS449ynjWEFcdJtF5WBGDgz6', '', 'student', '', '', NULL, NULL),
(38, 'allankayz_38', '$2y$10$uGbnI3PJaUkRR3/QgIaQWO8fI7hlKbq1W0CrucCXEWig1RTyRH3DS', '', 'student', '', '', NULL, NULL),
(49, 'keysha', '$2y$10$FCUH6XwULHgjfsWedYCFce6plgdKV8mPHrQI2H4kbsCmSm8.X1eLq', '', 'instructor', '', '', NULL, NULL),
(50, 'keysha_50', '$2y$10$qj/BrvxUdecT8fC/uzeQAOCoNLssGOJZ2LgUdhi.Mlbeyf7DSz1i6', '', 'instructor', '', '', NULL, NULL);

-- Specialization
INSERT INTO `specialization` (`id`, `specialization`, `description`) VALUES
(1, 'Advanced Driving', ''),
(2, 'Commercial License', ''),
(3, 'Beginner Courses', '')
ON DUPLICATE KEY UPDATE specialization=VALUES(specialization);

-- Students
INSERT INTO `students` (`id`, `user_id`, `package_id`, `address`, `status`, `created_at`) VALUES
(1, 2, 1, '4708 Chiedza Karoi', 'Active', '2025-08-16 22:07:24'),
(2, 35, 2, '4708 Chiedza, Karoi', 'active', '2025-08-18 18:27:57'),
(3, 36, 4, '4708 Chiedza, Karoi', 'active', '2025-08-18 20:03:49');

-- Instructors
INSERT INTO `instructors` (`id`, `user_id`, `license_number`, `specialization_id`, `certification_id`, `experience`, `availability`) VALUES
(1, 3, '12345-ZIM', 1, 1, 5, 1);

-- Vehicles
INSERT INTO `vehicles` (`id`, `make`, `model`, `year`, `registration`, `type`, `status`) VALUES
(1, 'Toyota', 'Corolla', 2018, 'ABC-123', 'car', 'active'),
(2, 'Isuzu', 'D-Max', 2019, 'TRK-001', 'truck', 'active'),
(3, 'Honda', 'CBR', 2020, 'MOT-09', 'motorcycle', 'maintenance');

SQL;

$exams_data = "";
$questions_data = "";

$handle = fopen($source_db, "r");
$capturing_questions = false;
$capturing_exams = false;

if ($handle) {
    while (($line = fgets($handle)) !== false) {
        // Questions
        if (strpos($line, "INSERT INTO `questions`") === 0) {
            $capturing_questions = true;
        }
        if ($capturing_questions) {
            $questions_data .= $line;
            if (trim($line) === '' || substr(trim($line), -1) === ';') {
                $capturing_questions = false;
            }
        }

        // Exams
        if (strpos($line, "INSERT INTO `exams`") === 0) {
            $capturing_exams = true;
        }
        if ($capturing_exams) {
            $exams_data .= $line;
            if (trim($line) === '' || substr(trim($line), -1) === ';') {
                $capturing_exams = false;
            }
        }
    }
    fclose($handle);
}

$f = fopen($target_db, 'a');
fwrite($f, "\n\n-- MIGRATED DATA \n");
fwrite($f, $manual_inserts);
// Write exams BEFORE questions because questions have FK to exams
fwrite($f, "\n-- EXAMS DATA \n");
fwrite($f, $exams_data);
fwrite($f, "\n-- QUESTIONS DATA \n");
fwrite($f, $questions_data);
fwrite($f, "\n\nSET FOREIGN_KEY_CHECKS = 1;\n");
fclose($f);

echo "Data migration appended successfully.";
