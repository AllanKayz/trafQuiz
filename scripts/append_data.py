
import os

source_db = r'c:\xampp\htdocs\trafQuiz\traffiquiz_DB.sql'
target_db = r'c:\xampp\htdocs\trafQuiz\traffiquiz_normalized.sql'

# Manual Inserts structure
# (We construct these manually to handle schema changes and duplicates)
manual_inserts = """
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

-- Specialization (Merging)
-- Normalized table already has structure. Dump inserted specific IDs: 1, 2, 3.
-- Normalized table is AUTO_INCREMENT but we should preserve IDs if referenced.
INSERT INTO `specialization` (`id`, `specialization`, `description`) VALUES
(1, 'Advanced Driving', ''),
(2, 'Commercial License', ''),
(3, 'Beginner Courses', '')
ON DUPLICATE KEY UPDATE specialization=VALUES(specialization);

-- Students (Mapping userid -> user_id, pkgid -> package_id)
INSERT INTO `students` (`id`, `user_id`, `package_id`, `address`, `status`, `created_at`) VALUES
(1, 2, 1, '4708 Chiedza Karoi', 'Active', '2025-08-16 22:07:24'),
(2, 35, 2, '4708 Chiedza, Karoi', 'active', '2025-08-18 18:27:57'),
(3, 36, 4, '4708 Chiedza, Karoi', 'active', '2025-08-18 20:03:49');

-- Instructors
-- Dump: (1, 3, '12345-ZIM', 1, 1, 5, 1, ...)
INSERT INTO `instructors` (`id`, `user_id`, `license_number`, `specialization_id`, `certification_id`, `experience`, `availability`) VALUES
(1, 3, '12345-ZIM', 1, 1, 5, 1);

-- Vehicles
INSERT INTO `vehicles` (`id`, `make`, `model`, `year`, `registration`, `type`, `status`) VALUES
(1, 'Toyota', 'Corolla', 2018, 'ABC-123', 'car', 'active'),
(2, 'Isuzu', 'D-Max', 2019, 'TRK-001', 'truck', 'active'),
(3, 'Honda', 'CBR', 2020, 'MOT-09', 'motorcycle', 'maintenance');

-- Exams (Preserving IDs)
INSERT INTO `exams` (`id`, `name`, `start_time`, `end_time`) VALUES
(1, 'Provisional Test', '2025-08-10 08:00:00', '2025-08-10 17:00:00'),
(2, 'Mock Test', '2025-08-11 09:00:00', '2025-08-11 16:00:00');

"""

def append_data():
    questions_data = []
    with open(source_db, 'r', encoding='utf-8', errors='ignore') as f:
        for line in f:
            if line.startswith("INSERT INTO `questions`"):
                questions_data.append(line)
    
    with open(target_db, 'a', encoding='utf-8') as f:
        f.write("\n\n-- MIGRATED DATA \n")
        f.write(manual_inserts)
        f.write("\n-- QUESTIONS DATA \n")
        for line in questions_data:
            f.write(line)

    print("Data migration appended successfully.")

if __name__ == "__main__":
    append_data()
