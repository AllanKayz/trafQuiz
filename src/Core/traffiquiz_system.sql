-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 11, 2026 at 05:15 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `traffiquiz_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `administrators`
--

CREATE TABLE `administrators` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `license_key_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `certification`
--

CREATE TABLE `certification` (
  `id` int(11) NOT NULL,
  `certification` varchar(255) NOT NULL,
  `description` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `certification`
--

INSERT INTO `certification` (`id`, `certification`, `description`) VALUES
(1, 'TSCZ Instructor Certificate', 'Traffic Safety Council of Zimbabwe Instructor Certification');

-- --------------------------------------------------------

--
-- Table structure for table `conversations`
--

CREATE TABLE `conversations` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `participant_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`participant_ids`)),
  `last_message_at` datetime DEFAULT current_timestamp(),
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `exams`
--

CREATE TABLE `exams` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exams`
--

INSERT INTO `exams` (`id`, `name`, `start_time`, `end_time`, `created_at`, `updated_at`) VALUES
(1, 'test 1', '2025-03-14 09:49:35', '2025-03-14 11:49:35', '2025-03-14 10:50:42', '2025-03-14 10:50:42'),
(2, 'test 2', '2025-03-14 14:49:35', '2025-03-14 11:52:35', '2025-03-14 10:50:42', '2025-03-14 10:50:42'),
(3, 'Auto-Allocated Exam 2026-01-10', '2026-01-10 09:00:00', '2026-01-10 11:00:00', '2026-01-11 00:04:47', '2026-01-11 00:04:47');

-- --------------------------------------------------------

--
-- Table structure for table `exam_timeframe`
--

CREATE TABLE `exam_timeframe` (
  `id` int(11) NOT NULL,
  `period` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `instructors`
--

CREATE TABLE `instructors` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `license_number` varchar(255) NOT NULL,
  `specialization_id` int(11) NOT NULL,
  `certification_id` int(11) NOT NULL,
  `experience` int(11) NOT NULL,
  `salary` decimal(10,2) NOT NULL DEFAULT 0.00,
  `availability` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `instructors`
--

INSERT INTO `instructors` (`id`, `user_id`, `license_number`, `specialization_id`, `certification_id`, `experience`, `salary`, `availability`, `created_at`, `updated_at`) VALUES
(1, 3, '12345-ZIM', 1, 1, 5, 0.00, 1, '2026-01-10 09:21:06', '2026-01-10 09:21:06'),
(2, 52, 'FFF 544678 K', 2, 1, 6, 0.00, 1, '2026-01-10 14:59:19', '2026-01-10 12:59:19');

-- --------------------------------------------------------

--
-- Table structure for table `lessons`
--

CREATE TABLE `lessons` (
  `id` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `subject` varchar(100) DEFAULT NULL,
  `start_time` datetime NOT NULL,
  `end_time` datetime DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT NULL,
  `instructor_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `assigned_vehicle_id` int(11) DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `online_link` varchar(500) DEFAULT NULL,
  `status` enum('upcoming','confirmed','cancelled','completed','pending','declined') DEFAULT 'upcoming',
  `student_count` int(11) DEFAULT 0,
  `capacity` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `resources` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`resources`)),
  `type` enum('group','individual','theory','practical') DEFAULT 'group',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `license_keys`
--

CREATE TABLE `license_keys` (
  `id` int(11) NOT NULL,
  `license_key` varchar(100) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `id` int(11) NOT NULL,
  `conversation_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `sender_name` varchar(255) DEFAULT NULL,
  `text` text NOT NULL,
  `timestamp` datetime DEFAULT current_timestamp(),
  `is_read` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `packages`
--

CREATE TABLE `packages` (
  `id` int(11) NOT NULL,
  `package` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `amount` decimal(18,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `packages`
--

INSERT INTO `packages` (`id`, `package`, `description`, `amount`) VALUES
(1, 'Provisional Drivers Certificate', '', 2.00),
(2, 'Light Motor Vehicles(Class 4)', '', 10.00),
(3, 'Motor Cycles (Class 3)', '', 5.00),
(4, 'Heavy Motor Vehicles (Class 2)', '', 20.00),
(5, 'Public Motor Vehicles (Class 1)', '', 30.00);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `instructor_id` int(11) DEFAULT NULL,
  `vehicle_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `type` enum('income','expense') NOT NULL DEFAULT 'income',
  `category` enum('student_payment','salary','maintenance','fuel','tc_expense','other') NOT NULL DEFAULT 'student_payment',
  `payment_date` datetime DEFAULT current_timestamp(),
  `transaction_id` varchar(100) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `status` enum('pending','completed','failed') DEFAULT 'completed',
  `package_id` int(11) DEFAULT NULL,
  `method` varchar(50) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `student_id`, `instructor_id`, `vehicle_id`, `amount`, `type`, `category`, `payment_date`, `transaction_id`, `created_at`, `status`, `package_id`, `method`, `notes`) VALUES
(1, 1, NULL, NULL, 10.00, 'income', 'student_payment', '2026-01-11 00:26:26', 'TXN-6962D20E6A9F0', '2026-01-11 00:26:26', 'completed', NULL, 'cash', NULL),
(2, 1, NULL, NULL, 2.00, 'income', 'student_payment', '2026-01-11 00:48:47', 'TXN-6962D74B52D77', '2026-01-11 00:48:47', 'completed', NULL, 'ecocash', NULL),
(3, 1, NULL, NULL, 3.00, 'income', 'student_payment', '2026-01-11 00:49:08', 'TXN-6962D7607C5CB', '2026-01-11 00:49:08', 'completed', NULL, 'card', NULL),
(4, 1, NULL, NULL, 10.00, 'income', 'student_payment', '2026-01-11 12:07:23', 'TXN-696376598A17D', '2026-01-11 12:07:23', 'completed', 4, 'cash', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `questions`
--

CREATE TABLE `questions` (
  `id` int(11) NOT NULL,
  `question_text` longtext DEFAULT NULL,
  `img_insert` varchar(300) DEFAULT NULL,
  `option_image` tinyint(4) DEFAULT 0,
  `option_a` longtext DEFAULT NULL,
  `option_b` longtext DEFAULT NULL,
  `option_c` longtext DEFAULT NULL,
  `correct_option` varchar(45) DEFAULT NULL,
  `exam_id` int(11) DEFAULT NULL,
  `answer` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `questions`
--

INSERT INTO `questions` (`id`, `question_text`, `img_insert`, `option_image`, `option_a`, `option_b`, `option_c`, `correct_option`, `exam_id`, `answer`) VALUES
(1, 'When can an applicant apply for a duplicate learner’s licence?', NULL, 0, ' A.	Whenever they feel like ', 'B.	When the original has been lost or defaced ', 'C.	None of the above', '2', 1, 'B.	When the original has been lost or defaced '),
(2, 'what are the colors of a private vehicle registration plate ?', NULL, 0, 'Yellow background  ', 'White on black background', 'Black on yellow background  ', '3', 1, 'Black on yellow background  '),
(3, 'The minimal legal age an applicant can learn to drive is. ', NULL, 0, 'A.	16 years ', 'B.	17 years ', 'C.	20 years', '1', 1, 'A.	16 years '),
(4, 'To drive a public service vehicle you must be no more than.....', NULL, 0, ' A.	60 years', ' B.	65 years ', 'C.	70 years', '2', 1, ' B.	65 years '),
(5, 'A heavy vehicle is a vehicle exceeding? ', NULL, 0, 'A.	2,500kg net mass ', 'B.	2,300kg net mass ', 'C.	5,000kg net mass', '3', 1, 'C.	5,000kg net mass'),
(6, 'At what age is a female allowed to drive a class 2 heavy vehicle ? ', NULL, 0, 'A.	18 years ', 'B.	20 years ', 'C.	25 years', '1', 1, 'A.	18 years '),
(7, 'A 17 year old may drive...', NULL, 0, 'A.	Tractor ', 'B.	Light motor vehicles ', 'C.	Heavy vehicles', '2', 1, 'B.	Light motor vehicles '),
(8, 'At the age of 16 years a person can get a learner’s licence in..... ', NULL, 0, 'A.	Class 1& 2 ', 'B.	Class 2 & 4 ', 'C.	Class 3 & 4', '2', 1, 'B.	Class 2 & 4 '),
(9, 'A driver of a public service vehicle is required to undergo retesting after.....', NULL, 0, ' A.	Every year ', 'B.	5 years ', 'C.	10 years', '2', 1, 'B.	5 years '),
(10, 'A learner is allowed to carry how many passengers in a motor vehicle? ', NULL, 0, 'A.	None ', 'B.	2', ' C.	3', '1', 1, 'A.	None '),
(11, 'What class of vehicle is a motorcycle? ', NULL, 0, 'A.	Class 1 ', 'B.	Class 3 ', 'C.	Class 5', '2', 1, 'B.	Class 3 '),
(12, 'Which vehicle is used by class 2 driving students? ', NULL, 0, 'A.	5,000kg 7m truck ', 'B.	Bedford ', 'C.	Hino truck', '1', 1, 'A.	5,000kg 7m truck '),
(13, 'Tractors & Caterpillars are in which class of motor vehicles? ', NULL, 0, 'A.	Class 2 ', 'B.	Class 3 ', 'C.	Class 5', '3', 1, 'C.	Class 5'),
(14, 'A holder of a class 5 driver’s licence can only drive agricultural tractors? ', 'assets/20230809171141368_5088_bb8.jpeg', 0, 'A.	True ', 'B.	False ', 'C.	They can’t even drive tractors', '2', 1, 'B.	False '),
(15, 'Which vehicle does not have a reverse gear? ', NULL, 0, 'A.	Combine harvester ', 'B.	Motor cycle ', 'C.	Tractors', '2', 1, 'B.	Motor cycle '),
(16, 'What does a continuous yellow line mean? ', NULL, 0, 'A.	You may cross it ', 'B.	You may not cross it when overtaking ', 'C.	Its a fire hydrant', '2', 1, 'B.	You may not cross it when overtaking '),
(17, 'Longitudinal lines are there to.... ', NULL, 0, 'A.	Demarcate the lanes to be followed on the road ', 'B.	Decorate the road ', 'C.	Indicate parking bays', '1', 1, 'A.	Demarcate the lanes to be followed on the road '),
(18, 'At a zebra variety i shall... ', NULL, 0, 'A.	Give precedence to fast pedestrians ', 'B.	Give precedence to crossing pedestrians ', 'C.	Give way to serious pedestrians', '2', 1, 'B.	Give precedence to crossing pedestrians '),
(19, 'The broken white line means? ', NULL, 0, 'I may not overtake ', 'I may overtake ', 'None of the above', '2', 1, 'I may overtake '),
(20, 'The continuous white line means? ', NULL, 0, 'A.	I may not overtake ', 'B.	I may overtake ', 'C.	I should cross it', '1', 1, 'A.	I may not overtake '),
(21, 'The broken yellow line means? ', NULL, 0, 'A.	I may cross it when overtaking a vehicle which is turning right ', 'B.	I may cross it when i want to rest ', 'C.	I may not cross it even if i want to overtake a vehicle which is turning right.', '1', 1, 'A.	I may cross it when overtaking a vehicle which is turning right '),
(22, 'Double white lines found on the road mean that? ', NULL, 0, 'A.	I can cross it when overtaking ', 'B.	I must not cross the line ', 'C.	I can cross the line with caution', '2', 1, 'B.	I must not cross the line '),
(23, 'I can overtake when...... ', NULL, 0, 'A.	The broken line is on my side & the continuous line is next to the broken line. ', 'B.	The continuous line is on my side & the broken line is next to the continuos line. ', 'C.	There are double lines on the road', '1', 1, 'A.	The broken line is on my side & the continuous line is next to the broken line. '),
(24, 'At a bridge we mind.... ', NULL, 0, 'A.	Height ', 'B.	Width', 'C.	Length', '2', 1, 'B.	Width'),
(25, 'When someone wants to overtake you, you..... ', NULL, 0, 'A.	Increase your speed ', 'B.	Insult him ', 'C.	Reduce speed', '3', 1, 'C.	Reduce speed'),
(26, 'For every 30km/h at which you are travelling, leave a gap of? ', NULL, 0, 'A)	3 cars ', 'B)	2 cars ', 'C)	4 cars', '2', 2, 'B)	2 cars '),
(27, 'When travelling at 60km/h the reaction distance is...... ', NULL, 0, 'A)	8,3m ', 'B)	5,6m ', 'C) 12,7m', '1', 2, 'A)	8,3m '),
(28, 'What is the general speed limit when driving in urban areas? ', NULL, 0, 'A)	80km/h', ' B)	120km/h', ' C)	60km/h', '3', 2, ' C)	60km/h'),
(29, 'What is the maximum speed limit in Zimbabwe?', NULL, 0, ' A)	80km/h for light motor vehicles and 120km/h for heavy vehicles ', 'B)	120km/h for light motor vehicles and 90km/h for heavy vehicles ', 'C)	80km/h for heavy vehicles and 120km/h for light motor vehicles', '3', 2, 'C)	80km/h for heavy vehicles and 120km/h for light motor vehicles'),
(30, 'When I see this sign i shall.... ', 'assets/20230708135558365_749702_pic1.PNG', 0, 'A)	Travel at most 80km/h ', 'B)	Travel not less than 80km/h ', 'C)	None of the above', '1', 2, 'A)	Travel at most 80km/h '),
(31, 'This signs means that?  ', 'assets/20230708135844063_504965_juu.PNG', 0, ' A)	The speed limit of the main road is 60km/h ', 'B)	The speed limit of other roads in the area is 80km/h ', 'C)	The speed limit of the other roads in the area is 60km/h', '3', 2, 'C)	The speed limit of the other roads in the area is 60km/h'),
(32, 'When travelling at 120km/h what is the overall stopping distance?', NULL, 0, ' A) 113,3m ', 'B)	130m ', 'C)	18m', '2', 2, 'B)	130m '),
(33, 'When travelling behind or meeting another vehicle at night?', NULL, 0, ' A)	Dip your headlights', ' B)	Brighten your headlights', ' C)	Switch off your headlights', '1', 2, ' A)	Dip your headlights'),
(34, 'When travelling at 40km/h the braking distance is..... ', NULL, 0, 'A) 5,6m ', 'B) 12,4m ', 'C) 18m', '2', 2, 'B) 12,4m '),
(35, 'When is it allowed to overtake?', NULL, 0, ' A)	when traveling in a four lane road ', 'B)	Where there is a broken line', ' C)	In the face of oncoming traffic', '2', 2, 'B)	Where there is a broken line'),
(36, 'When meeting other vehicles on a slippery road i should? ', NULL, 0, 'A)	Put on a handbrake ', 'B)	Reduce speed and exercise caution ', 'C)	Increase your speed', '2', 2, 'B)	Reduce speed and exercise caution '),
(37, 'What happens when an oncoming vehicle does not dip its lights for you? ', NULL, 0, 'A)	Speed up and go ', 'B)	Stop immediately ', 'C)	Look slightly to the left for a while till they pass', '3', 2, 'C)	Look slightly to the left for a while till they pass'),
(38, 'This sign means', 'assets/20230815065445500_944821_bb14.png', 0, 'hazard ahead', 'hazard of variable nature ahead', 'reduce speed', '2', 2, 'hazard of variable nature ahead'),
(39, 'In emergency we use? ', NULL, 0, 'A)	Accelerator ', 'B)	Brakes ', 'C)	Hooter', '2', 2, 'B)	Brakes '),
(40, 'Before driving a motor vehicle on a public road it must have the following documents? ', NULL, 0, 'A)	Driver’s license and registration book ', 'B)	A certificate of fitness, license and route authority ', 'C)	A registration book, insurance and vehicle license', '3', 2, 'C)	A registration book, insurance and vehicle license'),
(41, 'How far from a corner are you forbidden to stop or park your vehicle?', NULL, 0, ' A)	7 metres', ' B)	30 metres', ' C)	45 metres', '1', 2, ' A)	7 metres'),
(42, 'At what speed must you approach a curve, corner or a sharp turn? ', NULL, 0, 'A)	120km/h ', 'B)	At a safe speed ', 'C)	Braking', '2', 2, 'B)	At a safe speed '),
(43, 'When your vehicle is parked on the side of the road you use?', NULL, 0, ' A)	Head lights on low beam ', 'B)	Park lights ', 'C)	Head lights on high beam', '2', 2, 'B)	Park lights '),
(44, 'What must you do on the approach of an ambulance when its sounding its device?', NULL, 0, ' A)	Speed off ', 'B)	Keep left ', 'C)	Pull out of its way and remain stationary until the vehicle has passed', '3', 2, 'C)	Pull out of its way and remain stationary until the vehicle has passed'),
(45, 'A safety belt can be put by drivers as they wish while others may ignore it? ', NULL, 0, 'A)	True ', 'B)	False', ' C)	Maybe', '2', 2, 'B)	False'),
(46, 'At night in well lit areas drivers should drive with? ', NULL, 0, 'A)	Spotlights on ', 'B)	Headlights on high beam ', 'C)	Headlights on low beam', '3', 2, 'C)	Headlights on low beam'),
(47, 'Fog lights are used when..... ', NULL, 0, 'A)	The driver feels like ', 'B)	There is a mist ', 'C)	None of the above', '2', 2, 'B)	There is a mist '),
(48, 'When travelling at 5am i should switch on my headlights?   ', NULL, 0, 'A)	True ', 'B)	False', ' C)	It depends with the weather', '1', 2, 'A)	True '),
(49, 'The derestriction sign shows that.... ', NULL, 0, 'A)	Nothing has changed ', 'B)	The speed limit previously imposed has been canceled ', 'C)	The driver should stop', '2', 2, 'B)	The speed limit previously imposed has been canceled '),
(50, 'Can one vehicle overtake another on a narrow bridge? ', NULL, 0, 'A)	Yes ', 'B)	Depends with the size of the vehicles ', 'C)	No', '3', 2, 'C)	No'),
(53, 'An ambulance has a right of way when..... ', NULL, 0, 'A)	It is moving fast ', 'B)	Sounding its device ', 'C)	Its on the road', '2', 3, 'B)	Sounding its device '),
(54, 'When a vehicle ahead of you is towing what do you do? ', NULL, 0, 'increase speed', 'Overtake it ', 'Reduce speed and exercise caution', '3', 3, 'Reduce speed and exercise caution'),
(55, 'Motor cycles should travel in which lane? ', NULL, 0, 'A)	Left lane ', 'B)	Right lane', ' C)	Centre lane', '1', 3, 'A)	Left lane '),
(56, 'When involved in a serious accident?', NULL, 0, ' A)	report to the hospital within 24hours', ' B)	Report to the police immediately or within 24hours ', 'C)	Proceed with your journey if it is safe to do so.', '2', 3, ' B)	Report to the police immediately or within 24hours '),
(57, 'How many licence classes do we have in Zimbabwe? ', NULL, 0, 'A)	50 ', 'B)	55 ', 'C)	5', '3', 3, 'C)	5'),
(58, 'If you see an L-Plate displayed on a vehicle in front what do you do? ', NULL, 0, 'A)	increase speed and overtake ', 'B)	Reduce speed and drive cautiously', ' C)	Put your hazards', '2', 3, 'B)	Reduce speed and drive cautiously'),
(59, 'When travelling behind a vehicle you do not intend to overtake at 75km/h you leave a gap of....', NULL, 0, ' A)	3 cars ', 'B)	4 cars ', 'C)	5 cars', '3', 3, 'C)	5 cars'),
(60, 'Which car has right of way first', 'assets/20230815065604352_693987_bb5.png', 0, 'CAR A', 'CAR B', 'CAR C', '3', 3, 'CAR C'),
(61, 'When do you use a red reflective triangular sign? ', NULL, 0, 'A)	When you are parked ', 'B)	When a heavy vehicle has broken down.', ' C)	Anytime you want', '2', 3, 'B)	When a heavy vehicle has broken down.'),
(62, 'When approaching a policeman regulating traffic at a robot controlled intersection?', NULL, 0, ' A)	follow the robots ', 'B)	Follow the signal of the policeman ', 'C)	Follow none of them', '2', 3, 'B)	Follow the signal of the policeman '),
(63, 'When turning to the left or right at a robot controlled intersection?', NULL, 0, ' A)	Increase speed ', 'B)	Give way to other vehicles ', 'C)	Give way to pedestrians', '3', 3, 'C)	Give way to pedestrians'),
(64, 'When i see this sign i should............................................... ', 'assets/20230708144954338_844194_kly.PNG', 0, 'A)	Ignore it ', 'B)	Reduce speed and expect to be stopped ', 'C)	Increase speed and go', '2', 3, 'B)	Reduce speed and expect to be stopped '),
(65, 'A heavy vehicle towing trailers must have?', NULL, 0, ' A)	2 drivers ', 'B)	5 reflective triangles ', 'C)	Safety chains fitted to the trailer', '3', 3, 'C)	Safety chains fitted to the trailer'),
(66, 'At what distance do you put a reflective triangle from a broken down vehicle? ', NULL, 0, 'A) 30-50m ', 'B)	10m ', 'C)	7.5m', '1', 3, 'A) 30-50m '),
(67, 'Which vehicle does not have a reverse gear? ', NULL, 0, 'A)	Tractor', ' B)	Combine harvester ', 'C)	Motor cycle', '3', 3, 'C)	Motor cycle'),
(68, 'Prohibition lines indicate that...... ', NULL, 0, 'A)	You may overtake from the left ', 'B)	You may overtake from the right ', 'C)	You may not overtake', '3', 3, 'C)	You may not overtake'),
(69, 'Persons under the age of seventeen years are allowed to drive class two motor   vehicles?', NULL, 0, 'Yes ', 'If they have a defensive drivers license ', 'No', '3', 3, 'No'),
(70, 'What class of vehicle is a motor cycle?', NULL, 0, 'Class 4', 'Class 1 ', 'Class 3', '3', 3, 'Class 3'),
(71, 'How many reflective triangles does a lorry carrying 4 trailers have? ', NULL, 0, 'A)	6 ', 'B)	10 ', 'C)	4 trailers are not allowed', '3', 3, 'C)	4 trailers are not allowed'),
(72, 'Which vehicle is used by class 2 driving students? ', NULL, 0, 'A)	Tata truck ', 'B)	5000kg 7m truck', ' C)	Hino', '2', 3, 'B)	5000kg 7m truck'),
(73, 'Do you switch on lights when travelling at 5.30am ', NULL, 0, 'A)	depends on visibility ', 'B)	Yes ', 'C)	Only when riding a motorbike', '2', 3, 'B)	Yes '),
(74, 'In emergency we use...... ', NULL, 0, 'A)	Hooter ', 'B)	Brakes ', 'C)	Steering', '2', 3, 'B)	Brakes '),
(75, 'A vehicle should be fitted with efficient reflectors of what colour?  ', NULL, 0, ' A)	White at the front and amber at the back ', 'B)	White at the front and yellow at the back ', 'C)	White at the front and red at the back', '3', 3, 'C)	White at the front and red at the back'),
(76, 'Heavy vehicles should have the following reflectors? ', NULL, 0, 'A)	white strips at the front and yellow reflector at the back ', 'B)	2 white reflective strips at the front, yellow at the sides and a red and yellow chevron at the back', ' C)	2 white reflective strips at the front, chevron at the sides and another red and yellow chevron at the back.', '2', 3, 'B)	2 white reflective strips at the front, yellow at the sides and a red and yellow chevron at the back'),
(77, 'If a motorcade is approaching i should........ ', NULL, 0, 'A)	Join it so that i proceed were i’m going faster ', 'B)	Increase my speed so that it does’nt catch me ', 'C)	Stop at a safe place and allow it to pass then proceed when its gone.', '3', 3, 'C)	Stop at a safe place and allow it to pass then proceed when its gone.'),
(78, 'A heavy vehicle is allowed to pull not more than? ', NULL, 0, 'A)	4 trailers', ' B)	3 trailers ', 'C)	2 trailers', '2', 4, ' B)	3 trailers '),
(79, 'To ensure safety i will....... ', NULL, 0, 'A)	Put on the handbrake ', 'B)	Lock my vehicle ', 'C)	Not park anywhere', '1', 4, 'A)	Put on the handbrake '),
(80, 'Entering a robot controlled intersection when it is amber or red and you have already crossed the pedestrian crossing line you? ', NULL, 0, 'A)	Increase the speed ', 'B)	Stay were you are ', 'C)	Reverse', '2', 4, 'B)	Stay were you are '),
(81, 'This sign means', 'assets/20230815065913889_167368_bb49.PNG', 0, 'STOP', 'GIVEWAY', 'STOP OR GIVEWAY', '3', 4, 'STOP OR GIVEWAY'),
(82, 'In which class of signs do we find a railroad level crossing sign? ', NULL, 0, 'A)	Danger warning', ' B)	Informative ', 'C)	Regulatory', '1', 4, 'A)	Danger warning'),
(83, 'The robot ahead sign is a...... ', NULL, 0, 'A)	Danger warning sign ', 'B)	Regulatory sign  ', ' C)	Informative sign', '1', 4, 'A)	Danger warning sign '),
(84, 'A heavy vehicle towing trailers must have? ', NULL, 0, 'A)	2 drivers ', 'B)	5 reflective triangles', ' C)	Safety chains fitted to the trailer', '3', 4, ' C)	Safety chains fitted to the trailer'),
(86, 'A learner is exempted from wearing a seat belt only when........ ', NULL, 0, 'A)	Reversing', ' B)	Driving at low speeds below 40km/h ', 'C)	At a driving test', '1', 4, 'A)	Reversing'),
(88, 'Which car has the right of way?	  ', 'assets/20230708151729003_19941_p11.PNG', 0, 'A)	Car C ', 'B)	Car B ', 'C)	Car A', '2', 4, 'B)	Car B '),
(89, 'Which car is breaking the law?	   ', 'assets/20230708151850475_189788_p13.PNG', 0, ' A)	Car A ', 'B)	Car B ', 'C)	Car C', '1', 4, ' A)	Car A '),
(90, 'This sign is a..........	 ', 'assets/20230708152012258_731616_p14.PNG', 0, ' A)	Weight restriction sign ', 'B)	Width restriction sign ', 'C)	Height restriction sign', '1', 4, ' A)	Weight restriction sign '),
(91, 'Which car is breaking the law?	  ', 'assets/20230708152126525_450095_p15.PNG', 0, 'A.	Car A ', 'B.	Car B ', 'C.	Car C', '1', 4, 'A.	Car A '),
(92, 'Which car moves last at this intersection?	  ', 'assets/20230708152235026_632468_p16.PNG', 0, 'A)	Car A  ', ' B)	Car B ', 'C)	Car C', '1', 4, 'A)	Car A  '),
(93, 'When there are 3 traffic lanes, in which lane should you travel when you intend to go straight ahead?', NULL, 0, ' A)	The centre lane', ' B)	The right lane ', 'C)	The left lane', '1', 4, ' A)	The centre lane'),
(94, 'Prohibition lines indicate that?', NULL, 0, ' A)	You may overtake ', 'B)	You may not overtake ', 'C)	You may turn right', '2', 4, 'B)	You may not overtake '),
(95, 'Stop lines are also known as? ', NULL, 0, 'A)	Transverse lines ', 'B)	Broken lines ', 'C)	Double lines', '1', 4, 'A)	Transverse lines '),
(96, 'A broken white line in conjuction with continuous arrows has...... ', NULL, 0, 'A)	Warning effect ', 'B)	Regulatory effect and drivers must follow ', 'C)	No use', '2', 4, 'B)	Regulatory effect and drivers must follow '),
(97, 'When should you not turn right? ', NULL, 0, 'A)	in front of oncoming traffic ', 'B)	When you are travelling on a slippery road ', 'C)	When you are driving a heavy vehicle towing a trailer', '1', 4, 'A)	in front of oncoming traffic '),
(98, 'At a stop sign..... ', NULL, 0, 'A)	stop and proceed when the road is clear on both sides   ', 'B)	Stop and proceed when the road is clear on the left ', 'C)	You do not necessarily have to stop', '1', 4, 'A)	stop and proceed when the road is clear on both sides   '),
(99, 'In urban areas which car has the right of way? ', NULL, 0, 'A)	The car approaching from your left ', 'B)	The car approaching from your right ', 'C)	Commuter omnibuses', '2', 4, 'B)	The car approaching from your right '),
(100, 'When i see this sign i will.........	  ', 'assets/20230715102556772_742952_p68.png', 0, 'A)	Drive at a maximum of 100km/h on the road ', 'B)	Drive at a minimum of 100km/h ', 'C)	Drive at 100km/h on other roads in the area', '1', 4, 'A)	Drive at a maximum of 100km/h on the road '),
(101, 'A lay-by sign is coloured in ...... ', NULL, 0, 'A)	Blue ', 'B)	Black ', 'C)	Green', '1', 4, 'A)	Blue '),
(102, 'What is a diverging lane? ', NULL, 0, 'A)	When a lane enters a roundabout ', 'B)	A straight line ', 'C)	When one lane becomes two', '3', 4, 'C)	When one lane becomes two'),
(103, 'A one way sign is coloured in...... ', NULL, 0, 'A)	Blue ', 'B)	Black   ', 'C)	Green', '3', 4, 'C)	Green'),
(104, 'Mandatory signs are...... ', NULL, 0, 'A)	Regulatory signs ', 'B)	Danger signs ', 'C)	Informative signs', '1', 4, 'A)	Regulatory signs '),
(105, 'A cyclist’s safety device is........ ', NULL, 0, 'A)	A hooter ', 'B)	Brakes', ' C)	A crash helmets', '3', 6, ' C)	A crash helmets'),
(106, 'What is the use of the clutch pedal? ', NULL, 0, 'A)	to disengage gears ', 'B)	To change gears without making noise ', 'C)	To feed air in the engine', '2', 6, 'B)	To change gears without making noise '),
(107, 'When you approach a traffic circle what do you do? ', NULL, 0, 'A)	give way to traffic from your right ', 'B)	Give way to traffic already circulating ', 'C)	Give way to buses only', '2', 6, 'B)	Give way to traffic already circulating '),
(108, 'What is the use of the hand brake or parking brake? ', NULL, 0, 'A)	to reduce speed ', 'B)	To hold the car still when it is parked ', 'C)	None of the above', '2', 6, 'B)	To hold the car still when it is parked '),
(109, 'A certificate of competence is valid for...... ', NULL, 0, 'A)	5 years ', 'B)	4 years ', 'C)	1 year', '3', 6, 'C)	1 year'),
(110, 'A red robot inconjuction with a green arrow pointing upwards means?', NULL, 0, ' A)	you may turn left ', 'B)	The robot is mulfunctioning ', 'C)	You may proceed straight ahead', '3', 6, 'C)	You may proceed straight ahead'),
(111, 'What do you do at a detour? ', NULL, 0, 'A)	you slow down and expect to be stopped ', 'B)	You slow down and follow instructions ', 'C)	You stop', '2', 6, 'B)	You slow down and follow instructions '),
(112, 'A faulty steering has how many degrees of free play?', NULL, 0, ' A)	25 degrees ', 'B)	50 degrees', ' C)	45 degrees', '2', 6, 'B)	50 degrees'),
(113, 'A velosolex may carry...... ', NULL, 0, 'A)	2 passengers ', 'B)	1 passenger ', 'C)	no passengers', '3', 6, 'C)	no passengers'),
(114, 'The amber sequence of a robot requires you to....... ', NULL, 0, 'A)	give way to traffic approaching from your right ', 'B)	Give way to traffic approaching from your left ', 'C)	Stop unless it is not safe to do so', '3', 6, 'C)	Stop unless it is not safe to do so'),
(115, 'A flashing amber robot requires you to...... ', NULL, 0, 'A)	give way to traffic approaching from your right ', 'B)	Give way to traffic approaching from your left ', 'C)	Stop unless it is not safe to do so', '1', 6, 'A)	give way to traffic approaching from your right '),
(116, 'The insignia of a danger warning sign is? ', NULL, 0, 'A)	a rectangle ', 'B)	A circle ', 'C)	A triangle', '3', 6, 'C)	A triangle'),
(117, 'After connecting a trailer what do you fit? ', NULL, 0, 'A)	draw bars ', 'B)	Safety chains ', 'C)	Adequate brakes', '2', 6, 'B)	Safety chains '),
(118, 'What is a hazard perception? ', NULL, 0, 'A)	predicting danger in a traffic situation', ' B)	A motor vehicle flashing its lights', ' C)	A danger warning sign', '1', 6, 'A)	predicting danger in a traffic situation'),
(119, 'Which car moves first?	  ', 'assets/20230708160329839_679963_p18.PNG', 0, 'A)	Car B ', 'B)	Car C ', 'C)	Car A', '2', 6, 'B)	Car C '),
(120, 'Which car goes last? ', 'assets/20230708160445223_811671_p19.PNG', 0, 'A)	Car C ', 'B)	Car A ', 'C)	Car B', '1', 6, 'A)	Car C '),
(121, 'Which car should stop?', 'assets/20230708160730158_515235_p20.PNG', 0, ' A)	Car C ', 'B)	Car A ', 'C)	Car b', '2', 6, 'B)	Car A '),
(122, 'Which car goes last?	', 'assets/20230708160844702_892991_p21.PNG', 0, '  A)	Car A ', 'B)	Car B ', 'C)	Car C', '1', 6, '  A)	Car A '),
(123, 'This sign is a.......	  ', 'assets/20230708160943845_911734_p22.PNG', 0, 'A)	Regulatory sign ', 'B)	Danger warning ', 'C)	Traffic light sign', '1', 6, 'A)	Regulatory sign '),
(124, 'This sign indicates of a ............. ', 'assets/20230708161054085_913222_p23.PNG', 0, 'A)	sharp curve ahead', ' B)	Double curve ahead ', 'C)	Left turn ahead', '2', 6, ' B)	Double curve ahead '),
(125, 'This sign shows that............	 ', 'assets/20230708161159164_482002_p24.PNG', 0, ' A)	road narrows to the right ahead ', 'B)	Road narrows to the left ahead ', 'C)	Road narrows to both sides ahead', '1', 6, ' A)	road narrows to the right ahead '),
(126, 'This sign shows that........	 ', 'assets/20230708161313029_280230_p25.PNG', 0, ' A)	overtaking is prohibited ', 'B)	Overtaking is prohibited within the next 400m ', 'C)	Overtaking is allowed within the next 400m', '2', 6, 'B)	Overtaking is prohibited within the next 400m '),
(127, 'This is a warning of ........ ', 'assets/20230708161433060_62317_p26.PNG', 0, 'A)	cross roads ahead ', 'B)	Intersection ahead', ' C)	Stop or give way sign ahead', '3', 6, ' C)	Stop or give way sign ahead'),
(130, 'A motor cycle with an engine capacity of 350cc or more must be fitted with..... ', NULL, 0, 'A)	crash helmets ', 'B)	Crash bars ', 'C)	Bars', '2', 6, 'B)	Crash bars '),
(131, 'This sign means? ', 'assets/20230708163631151_519841_p27.PNG', 0, 'A)	parking place ahead ', 'B)	One way in direction of arrow', ' C)	Directional arrows ahead', '3', 7, ' C)	Directional arrows ahead'),
(132, 'Which of the following lines is on the edge of the road ? ', NULL, 0, 'A)	broken yellow line ', 'B)	Broken white line ', 'C)	Unbroken white line', '1', 7, 'A)	broken yellow line '),
(133, 'What is the meaning danger of this sign in small towns in Zimbabwe', 'assets/20230815070406543_393109_bb29.png', 0, 'Stop if there are cars crossing from all sides', 'Stop when the road is not clear and give way to all crossing traffic', 'stop always and then move when road is clear', '3', 7, 'stop always and then move when road is clear'),
(134, '4.	This sign is a?	 ', 'assets/20230708164151973_195968_p28.PNG', 0, ' A)	weight restriction', ' B)	Height restriction ', 'C)	Length restriction', '1', 7, ' A)	weight restriction'),
(135, 'This sign regulates that? ', 'assets/20230708164300517_572721_p29.PNG', 0, 'A)	vehicles should give right of way to cyclists ', 'B)	Stop and give way to cyclists from the right ', 'C)	Cyclists should stop and give way to crossing traffic', '3', 7, 'C)	Cyclists should stop and give way to crossing traffic'),
(136, 'This sign means?	 ', 'assets/20230708164417541_941654_p30.PNG', 0, ' A)	warning of a double curve ahead ', 'B)	Warning of a sharp curve ahead ', 'C)	Warning of curves ahead', '1', 7, ' A)	warning of a double curve ahead '),
(137, 'A rectangle is an insignia of which class?', NULL, 0, ' A)	Informative ', 'B)	Danger warning ', 'C)	Regulatory', '1', 7, ' A)	Informative '),
(138, 'This sign means?	  ', 'assets/20230708165405450_361061_p31.PNG', 0, 'A)	warning of Y junction   ', 'B)	Warning of a side road ', 'C)	Warning of crossroads', '2', 7, 'B)	Warning of a side road '),
(139, 'This sign means', 'assets/20230809173409391_751675_bb9.png', 0, 'Overtaking may be probited', 'Overtaking allowed', 'Tunnel Ahead', '3', 7, 'Tunnel Ahead'),
(140, 'Which car has the right of way?', 'assets/20230709130545373_329566_P50.PNG', 0, 'A.     Car C 		', 'B.      Car B 		', 'C .     Car A', '2', 5, 'B.      Car B 		'),
(141, 'Which car gives right of way?	  	', 'assets/20230709130830755_125048_P51.PNG', 0, '  A)	Car C 		', ' B)	Car B 		', 'C)	Car A', '3', 5, 'C)	Car A'),
(142, '10.	This sign means?	  ', 'assets/20230708183832307_383994_p34.PNG', 0, 'A)	road narrows to the left ahead ', 'B)	Road narrows to the right ahead ', 'C)	Road narrows centrally', '2', 7, 'B)	Road narrows to the right ahead '),
(143, 'This sign means?	  ', 'assets/20230708184011269_126201_p35.PNG', 0, 'A)	warning of a curve 100m ahead', ' B)	Left turn prohibited ', 'C)	Warning of a sharp curve ahead', '3', 7, 'C)	Warning of a sharp curve ahead'),
(144, 'This sign means? ', 'assets/20230708184141198_361555_p36.PNG', 0, 'A)	physical barrier ahead ', 'B)	Rail level crossing ahead ', 'C)	A grid ahead', '1', 7, 'A)	physical barrier ahead '),
(145, 'This sign means?	 ', 'assets/20230708184923883_310514_p37.PNG', 0, ' A)	warning or crossroads ', ' B)	Warning of a give way / stop sign', ' C)	Warning of a T junction', '2', 7, ' B)	Warning of a give way / stop sign'),
(146, 'Under which class is a derestriction sign?', NULL, 0, ' A)	danger warning signs ', 'B)	Regulatory signs ', 'C)	Informative signs', '3', 7, 'C)	Informative signs'),
(147, 'A circle is an insignia of........... ', NULL, 0, 'A)	informative signs ', 'B)	Regulatory signs ', 'C)	Danger warning signs', '2', 7, 'B)	Regulatory signs '),
(148, 'A broken white line in conjuction with continuous arrows has..... ', NULL, 0, 'A)	danger warning signs', ' B)	Regulatory effect and drivers must obey', ' C)	Informative message', '2', 7, ' B)	Regulatory effect and drivers must obey'),
(149, 'Prohibition lines indicate that....... ', NULL, 0, 'A)	you may not overtake ', 'B)	You may overtake', ' C)	You may overtake traffic moving slowly', '1', 7, 'A)	you may not overtake '),
(150, 'Mandatory signs are..... ', NULL, 0, 'A)	road markings ', 'B)	Informative ', 'C)	Regulatory signs', '3', 7, 'C)	Regulatory signs'),
(151, 'A robot ahead sign is in which class of signs? ', NULL, 0, 'A)	danger warning', ' B)	Informative ', 'C)	Regulatory', '1', 7, 'A)	danger warning'),
(152, 'When approaching a rail/road level crossing? ', NULL, 0, 'A)	i should proceed fast before the train', ' B)	I may not proceed while the red lights are flashing', ' C)	I may proceed while the red lights are flashing', '2', 7, ' B)	I may not proceed while the red lights are flashing'),
(153, 'For which traffic would i stop for at a stop sign?', NULL, 0, ' A)	traffic coming from all directions ', 'B)	Traffic coming from my right', ' C)	Traffic coming from my left', '1', 7, ' A)	traffic coming from all directions '),
(154, 'This sign is under............. ', 'assets/20230708190123894_442048_p38.PNG', 0, 'A)	Regulatory signs ', 'B)	Traffic light signs ', 'C)	Danger warning signs', '2', 7, 'B)	Traffic light signs '),
(155, 'A one way sign is coloured in....... ', NULL, 0, 'A)	Blue ', 'B)	Green ', 'C)	Red', '2', 7, 'B)	Green '),
(156, 'What is the reaction distance when traveling at 60km/h?', NULL, 0, ' A)	8.3m ', 'B)	5.6m ', 'C) 12.7m', '1', 7, ' A)	8.3m '),
(157, '25.	This sign means?	  ', 'assets/20230708190412293_126240_p39.PNG', 0, 'A)	danger of a mountain ahead', ' B)	Danger of a hump ahead ', 'C)	Danger of stones ahead', '2', 7, ' B)	Danger of a hump ahead '),
(158, 'Which car has the right of way ? ', 'assets/20230708191201598_597827_p40.PNG', 0, 'A.	Car C ', 'B.	Car B ', 'C.	Car A', '2', 8, 'B.	Car B '),
(159, 'Which car is breaking the law?	  ', 'assets/20230708191336070_374476_p41.PNG', 0, 'A)	Car B ', 'B)	Car A ', 'C)	None of the above', '2', 8, 'B)	Car A '),
(160, 'What do you do at a detour? ', NULL, 0, 'A)	You slow down and expect to be stopped ', 'B)	You slow down and follow instructions ', 'C)	You stop', '2', 8, 'B)	You slow down and follow instructions '),
(161, 'Which car moves last at the Intersection? ', 'assets/20230708191529084_984752_p42.PNG', 0, 'A)	Car C ', 'B)	Car B ', 'C)	Car A', '3', 8, 'C)	Car A'),
(162, 'Which car moves first?	 ', 'assets/20230708191713268_912354_p43.PNG', 0, ' A)	Car B ', 'B)	Car C ', 'C)	Car A', '2', 8, 'B)	Car C '),
(163, 'Which car goes last? ', 'assets/20230708191821508_781090_p44.PNG', 0, 'A)	Car A', ' B)	Car B ', 'C)	Car C', '3', 8, 'C)	Car C'),
(164, 'Which car should stop? ', 'assets/20230708191951412_644009_p45.PNG', 0, 'A)	Car C ', 'B)	Car B ', 'C)	Car A', '3', 8, 'C)	Car A'),
(165, 'Which car goes last?	', 'assets/20230708192100067_792142_p46.PNG', 0, '  A)	Car A ', 'B)	Car B ', 'C)	Car C', '1', 8, '  A)	Car A '),
(166, 'Which car gives the right of way?	', 'assets/20230708192208563_601775_p47.PNG', 0, '  A)	car C', ' B)	Car A ', 'C)	Car B', '2', 8, ' B)	Car A '),
(167, 'What is the reaction distance when traveling at 60km/h? ', NULL, 0, 'A) 12.4m ', 'B) 8.3m ', 'C) 27.7m', '2', 8, 'B) 8.3m '),
(168, 'Informative signs are characterised by? ', NULL, 0, 'A)	a triangular shape ', 'B)	A circular shape', ' C)	A rectangular shape', '3', 8, ' C)	A rectangular shape'),
(169, 'A physical barrier ahead sign is in which class of traffic signs? ', NULL, 0, 'A)	Informative ', 'B)	Danger warning ', 'C)	Regulatory', '2', 8, 'B)	Danger warning '),
(170, 'Class 5 of motor vehicles is for? ', NULL, 0, 'A)	light motor vehicles ', 'B)	Motor cycles ', 'C)	Tractors & Caterpillars', '3', 8, 'C)	Tractors & Caterpillars'),
(171, 'When seeing this sign i should?	  ', 'assets/20230708192746393_983684_p48.PNG', 0, 'A)	move to the centre of the road ', 'B)	Make an about turn ', 'C)	Reduce speed and exercise caution', '3', 8, 'C)	Reduce speed and exercise caution'),
(172, 'What is the braking distance when traveling at 120km/h? ', NULL, 0, 'A) 50.6m ', 'B) 113.3m ', 'C) 120.4m', '2', 8, 'B) 113.3m '),
(173, 'A one way sign is coloured in? ', NULL, 0, 'A)	Green ', 'B)	Blue ', 'C)	Black', '1', 8, 'A)	Green '),
(174, 'You should give right of way to pedestrians at? ', NULL, 0, 'A)	the longitudinal lines ', 'B)	The intersection ', 'C)	The zebra variety', '3', 8, 'C)	The zebra variety'),
(175, 'An ambulance has the right of way ? ', NULL, 0, 'A)	when carrying a patient ', 'B)	When sounding its siren ', 'C)	When heading to the hospital', '2', 8, 'B)	When sounding its siren '),
(176, 'On what portion of the road will you drive when meeting other traffic or approaching a corner? ', NULL, 0, 'A)	on the left or near side of the road ', 'B)	On the right side of the road ', 'C)	On the centre portion of the road', '1', 8, 'A)	on the left or near side of the road '),
(177, 'When should you not turn RIGHT? ', NULL, 0, 'A)	at a controlled intersection ', 'B)	In front of oncoming traffic ', 'C)	When you may obstruct the course of other vehicles', '2', 8, 'B)	In front of oncoming traffic '),
(178, 'This sign is? ', 'assets/20230815070754148_964235_bb14.png', 0, 'an informative sign that there is danger ahead of variable nature', 'Danger warning sign', 'A regulatory sign', '2', 8, 'Danger warning sign'),
(179, 'What is the outstanding feature about a derestriction sign? ', NULL, 0, 'A)	it is mostly found on highways ', 'B)	It is coloured in blue while other informative signs are in black ', 'C)	It is circular while other informative signs are rectangular in shape', '3', 8, 'C)	It is circular while other informative signs are rectangular in shape'),
(180, 'What is the correct sequence of the lights shown by a robot? ', NULL, 0, 'A)	Green amber red ', 'B)	Red green amber ', 'C)	Red amber green', '1', 8, 'A)	Green amber red '),
(181, 'This sign means', 'assets/20230809175109044_86103_bb10.png', 0, 'Robots are in good order follow them', 'Robot is red stop', 'Robots ahead ', '3', 8, 'Robots ahead '),
(182, 'What should you do when you stop to refuel your motor vehicle?', NULL, 0, ' A)	avoid naked lights ', 'B)	Avoid excessive noise ', 'C)	Drive cautiously', '1', 8, ' A)	avoid naked lights '),
(183, 'You dip your lights when? ', NULL, 0, 'A)	driving in a properly lit area ', 'B)	Driving in a poorly lit area ', 'C)	Driving a heavy vehicle', '1', 9, 'A)	driving in a properly lit area '),
(184, 'When are you forbidden to overtake? ', NULL, 0, 'A)	ahead of a corner ', 'B)	In urban areas ', 'C)	In rural areas', '1', 9, 'A)	ahead of a corner '),
(185, 'How many classes of road signs do we have in the traffic jungle? ', NULL, 0, 'A)	6 classes ', 'B)	5classes ', 'C)	7 classes', '2', 9, 'B)	5classes '),
(186, 'Before reversing a vehicle from parking i must? ', NULL, 0, 'A)	ensure that the handbrake is firmly on', ' B)	Check underneath ', 'C)	Adjust the rear view mirror', '2', 9, ' B)	Check underneath '),
(187, 'What are the colours of reflectors at the rear of a vehicle? ', NULL, 0, 'A)	Yellow ', 'B)	White ', 'C)	Red', '3', 9, 'C)	Red'),
(188, 'Which pedal is in the middle? ', NULL, 0, 'A)	Clutch ', 'B)	Brake ', 'C)	Accelerator', '2', 9, 'B)	Brake '),
(189, 'When you meet a vehicle displaying an L-plate what do you do? ', NULL, 0, 'A)	increase speed and go ', 'B)	Leave enough gap and exercise extreme caution ', 'C)	Stop', '2', 9, 'B)	Leave enough gap and exercise extreme caution '),
(190, 'An unbroken white line on the road on your right indicates that? ', NULL, 0, 'A)	you can overtake ', 'B)	You should not overtake', ' C)	You can overtake a car turning Right', '2', 9, 'B)	You should not overtake'),
(191, 'When a heavy vehicle has broken down it is shown by? ', NULL, 0, 'A)	red reflective triangle placed 30m-50m rear ', 'B)	Red reflective triangle placed 7m rear ', 'C)	Red reflective triangle placed 7.5m rear', '1', 9, 'A)	red reflective triangle placed 30m-50m rear '),
(192, 'A driver of a PSV is required to undergo retesting every..........', NULL, 0, ' A)	10 years ', 'B)	5 years ', 'C)	2 years', '2', 9, 'B)	5 years '),
(193, 'Which Car goes First at this Y junction', 'assets/20230809180155981_876285_BB11.jpeg', 0, 'Car A', 'Car B', 'Car C', '3', 9, 'Car C'),
(194, 'Which vehicle cannot have an extinguisher? ', NULL, 0, 'A)	small cars', ' B)	Motor cycle ', 'C)	Motor car parked at home', '2', 9, ' B)	Motor cycle '),
(195, 'The insignia of a danger warning sign is?   ', NULL, 0, 'A)	a circle ', 'B)	A triangle', ' C)	A rectangle', '2', 9, 'B)	A triangle'),
(196, 'At a flashing amber robot? ', NULL, 0, 'A)	stop unless it is not safe to do so ', 'B)	I will give way to traffic approaching from my right ', 'C)	I will give way to traffic approaching from my left', '2', 9, 'B)	I will give way to traffic approaching from my right '),
(197, 'The amber sequence of a robot requires you to...... ', NULL, 0, 'A)	give way to traffic approaching from your left ', 'B)	Stop unless it is not safe to do so ', 'C)	Give way to traffic approaching from your right', '3', 9, 'C)	Give way to traffic approaching from your right'),
(198, 'A trailer must have......... ', NULL, 0, 'A)	a reflective red T at the rear ', 'B)	All of the specified reflectors', ' C)	A red reflector strip at the rear', '2', 9, 'B)	All of the specified reflectors'),
(199, 'When a vehicle ahead of you has its hazards lights on....... ', NULL, 0, 'A)	i will slow down and exercise caution', ' B)	Stop ', 'C)	Speed and go', '1', 9, 'A)	i will slow down and exercise caution'),
(200, 'When there are 3 traffic lanes, in which lane should you travel when you intend to go straight ahead? ', NULL, 0, 'A)	the left lane ', 'B)	The right lane ', 'C)	The centre lane', '3', 9, 'C)	The centre lane'),
(201, 'At a bridge we mind.........   ', NULL, 0, 'A)	Length ', 'B)	Width ', 'C)	Size', '2', 9, 'B)	Width '),
(202, 'A heavy vehicle is allowed to pull not more than.......... ', NULL, 0, 'A)	3 trailers ', 'B)	4 trailers ', 'C)	5 trailers', '1', 9, 'A)	3 trailers '),
(203, 'At the age of 16 a person can get a learner’s licence in......... ', NULL, 0, 'A)	class 3 & 4 ', 'B)	Class 4& 5 ', 'C)	Class 2 & 5', '1', 9, 'A)	class 3 & 4 '),
(204, 'Before you drive a motor vehicle you must have.......', NULL, 0, ' A)	drivers licence or learners licence', ' B)	Certificate and repair card ', 'C)	Insurance cover', '1', 9, ' A)	drivers licence or learners licence'),
(205, 'Direction arrows used in conjuction with prohibitory lines on the road surface..... ', NULL, 0, 'A)	are informative signs ', 'B)	Have a regulatory effect ', 'C)	Have no effect to heavy vehicles', '2', 9, 'B)	Have a regulatory effect '),
(206, 'When turning to the left or right at a robot controlled intersection you... ', NULL, 0, 'A)	proceed quickly before pedestrians ', 'B)	Beat the amber signal light ', 'C)	Give way to pedestrians', '3', 9, 'C)	Give way to pedestrians'),
(207, 'Whilst overtaking traffic turning to the right, a motorist may...... ', NULL, 0, 'A)	straddle the continuous white line   ', 'B)	Straddle the broken yellow line ', 'C)	Straddle the double continuous white line', '2', 9, 'B)	Straddle the broken yellow line '),
(208, 'Which car should stop? (A traffic circle)	  	', 'assets/20230709131048099_175479_P52.PNG', 0, 'A.  Car A 		', 'B.  Car C 		', 'C.   Car B', '3', 5, 'C.   Car B'),
(209, 'Which car gives right of way?	  	', 'assets/20230709131226226_586824_P53.PNG', 0, 'A. Car B 		', 'B. Car C 		', 'C.   Car A', '1', 5, 'A. Car B 		'),
(210, 'Which car gives right of way?	  	', 'assets/20230709131412474_773953_P54.PNG', 0, 'A. Car A 		', 'B.  Car B 		', 'C.  Car C', '2', 5, 'B.  Car B 		'),
(211, '	Which car is breaking the law assuming both are moving?	  	', 'assets/20230806181258051_743342_AA2.jpeg', 0, 'A.   Car B		', 'B.  Car A	   	 	', 'C.   Car C	', '1', 5, 'A.   Car B		'),
(212, 'The sign indicates:	  	', 'assets/20230709132518879_598084_P58.PNG', 0, 'A.  Hospital ahead. 		', 'B.  End of speed restriction 		', 'C.  Broken down vehicle ahead', '2', 5, 'B.  End of speed restriction 		'),
(213, 'When approaching this sign, I should:	  	', 'assets/20230709132631871_885394_P59.PNG', 0, 'A.  Disengage gears. 		', 'B.   Engage a lower gear 		', 'C.   Apply hand brake', '2', 5, 'B.   Engage a lower gear 		'),
(214, 'The sign indicates I am:	  	', 'assets/20230709132805094_71179_P60.PNG', 0, 'A.  Permitted to make a \'U\' turn 		', 'B.  Prohibited from making a \'U\' turn 		', 'C.  Prohibited from turning right', '2', 5, 'B.  Prohibited from making a \'U\' turn 		'),
(215, 'This sign indicates:	  	', 'assets/20230709132921286_201426_P61.PNG', 0, 'A.   Width restriction 		', 'B.  Height restriction 		', 'C.  Cattle ahead', '1', 5, 'A.   Width restriction 		'),
(216, 'When approaching this sign, I should:	  	', 'assets/20230710063945276_80425_p62.PNG', 0, 'Disengage gears. 		', 'Engage a lower gear 		', 'Apply hand brake', '2', 5, 'Engage a lower gear 		'),
(217, 'The sign indicates I am:	  	', 'assets/20230806181720920_182716_AA3.PNG', 0, 'Presence of children ahead', 'exercise caution for people and animals ahead', 'Presence of people crossing ahead ', '1', 5, 'Presence of children ahead'),
(218, 'This sign indicates:	  	', 'assets/20230806182057209_236317_AA4.PNG', 0, 'All kinds of animals crossing', 'Presence of wild animals', 'Stray domestic animals crossing', '2', 5, 'Presence of wild animals'),
(220, 'At this sign I should:	  	', 'assets/20230710103610811_528635_p65.PNG', 0, 'Stop, and only proceed when the road is clear on both sides 		', 'Stop, and only proceed when the road is clear on the right 		', 'Stop, and only proceed when the road is clear on the left', '1', 5, 'Stop, and only proceed when the road is clear on both sides 		'),
(221, 'This sign indicates that I:	  	', 'assets/20230710103714903_965688_p66.PNG', 0, 'May not park my vehicle 		', 'May park my vehicle 		', 'Expect \'Lay-by\' ahead', '1', 5, 'May not park my vehicle 		'),
(222, 'This sign mean', 'assets/20230809181717525_560418_bb12.PNG', 0, 'Road temporarily narrowed to the left', 'Road permanently narrowed to the center	', 'Road narrowed to the right ahead', '1', 5, 'Road temporarily narrowed to the left'),
(223, 'When carrying a passenger on my motorcycle, I must:		', NULL, 0, 'Have headlamps fitted 		', 'Have the petrol tank filled 		', 'Have a pillion and foot rests firmly fixed', '3', 5, 'Have a pillion and foot rests firmly fixed'),
(224, 'If involved in a SERIOUS accident, I must:		', NULL, 0, 'Report to a hospital 		', 'Report to police within 48 hours 		', 'Report to police as soon as possible, or within 24 hours.', '3', 5, 'Report to police as soon as possible, or within 24 hours.'),
(225, 'When l am not traveling behind another vehicle at night, I must:		', NULL, 0, 'l must dip my headlamps 	', 'Switch on my sidelights 		', 'Dip my lights optionally', '3', 5, 'Dip my lights optionally'),
(226, 'When should a horn be used?		', NULL, 0, 'To attract a friend\'s attention 		', 'When warning another road user. 		', 'When cattle are blocking the road ahead', '3', 5, 'When cattle are blocking the road ahead'),
(227, 'I may park no closer to a corner than:		', NULL, 0, '9.5 meters 		', '15 meters 		', '7.5 meters', '3', 5, '7.5 meters'),
(228, 'At an intersection with a flashing amber robot, I would:		', NULL, 0, 'Wait until the road ahead is clear	   		', 'Give right of way to vehicles from the left	 ', 'Give right of way to vehicles from the right	', '3', 5, 'Give right of way to vehicles from the right	'),
(229, 'In which circumstances would I proceed against a red robot?		', NULL, 0, 'When the green arrow is illuminated 		', 'When there is no approaching traffic 		', 'When the road is clear on the right', '1', 5, 'When the green arrow is illuminated 		'),
(230, 'Which is the correct robot light sequence?		', NULL, 0, 'Red, Amber, Green 		', 'Red, Green, Amber 		', 'Green, Red, Amber', '2', 5, 'Red, Green, Amber 		'),
(231, 'A driver sees a continuous white line in the centre of the road, he or she		', NULL, 0, 'May cross if there is no oncoming traffic 		', 'May not cross 		', 'May cross in rural areas', '2', 5, 'May not cross 		'),
(232, 'Which car goes last?	', 'assets/20230710134056148_326666_p2.1.PNG', 0, '  	Car C 		', 'Car A 	', 'Car B', '2', 10, 'Car A 	'),
(233, 'Which car is breaking the law assuming vehicles are moving?	  	', 'assets/20230710135159904_912322_p2.2.PNG', 0, 'Car A 	', '	Car C 	', '	Car B', '2', 10, '	Car C 	'),
(234, 'This sign indicates?	  	', 'assets/20230710135427418_891865_p2.3.PNG', 0, 'Railway station 		', 'Rail-road level crossing 	', '	An intersection', '2', 10, 'Rail-road level crossing 	'),
(235, 'The driver may not park closer to the corner than:		', NULL, 0, '6.5 cm 	', '	7.5 cm 		', 'All of the above', '3', 11, 'All of the above'),
(236, 'When traveling at 60km/h, what distance should you leave between your vehicle and the vehicle in front?		', NULL, 0, '6 vehicle lengths 		', ' 5 vehicle lengths 		', '4 vehicle lengths', '3', 11, '4 vehicle lengths'),
(237, 'The driver may not park closer to the corner than:		', NULL, 0, '6.5m 		', '7m 		', 'All of the above', '3', 10, 'All of the above'),
(238, '	When a fire engine, ambulance or police vehicle approaches sounding its special warning device, what			', NULL, 0, 'Move as fast as possible	   		', 'Move out of its course and stop	 		', 'Move slowly on the left side', '2', 11, 'Move out of its course and stop	 		'),
(239, 'Cyclists should ride:	', NULL, 0, '	As many as possible abreast 		', 'Two abreast 		', 'Single file.', '3', 10, 'Single file.'),
(240, 'When facing a red robot with an illuminated straight ahead Green arrow, I may:		', NULL, 0, 'Proceed straight ahead 	', '	Turn right should I wish 	', '	Not proceed', '1', 10, 'Proceed straight ahead 	'),
(241, 'Which is the incorrect light sequence at a robot?	', NULL, 0, 'Green , Amber , Red	', 'Amber , Red , Green 	', 'Red , Amber , Green', '3', 10, 'Red , Amber , Green'),
(242, 'What time should persons driving on the road switch on their headlights?		', NULL, 0, 'Between 5:30pm and 6:30am 		', 'Between 5:30am and 6:30pm 		', 'Any convenient time', '1', 11, 'Between 5:30pm and 6:30am 		'),
(243, 'A continuous white line in the center of the road may:	', NULL, 0, '	Be crossed if the road ahead is clear 	', '	Not be crossed for the purposes of overtaking 	', '	Be crossed only on highways', '2', 10, '	Not be crossed for the purposes of overtaking 	'),
(244, 'If you are dazzled by the light of other vehicle, what must you do?		', 'assets/20230815071449052_124341_bb50.PNG', 0, 'Dip, get out of the way and slow down 		', 'Retaliate 		', 'Increase your speed', '1', 11, 'Dip, get out of the way and slow down 		'),
(245, 'Direction arrows used in conjunction with prohibition lines on a road surface:		', NULL, 0, 'Are for information purposes only 		', 'Relate to taxi drivers only 		', 'Have a regulatory effect', '3', 10, 'Have a regulatory effect'),
(246, 'When you are driving and feel sleepy, what must you do?		', NULL, 0, 'Maintain a slow speed 		', 'Move off the road and rest 		', 'Maintain a high speed', '2', 11, 'Move off the road and rest 		'),
(247, 'Which cars can move without breaking the law?	  	', 'assets/20230806183512264_300405_AA2.jpeg', 0, 'Car A and Car C 		', 'Car A only 		', 'Both Car A and B', '2', 10, 'Car A only 		'),
(248, 'I should always yield right of way to		', NULL, 0, 'Ambulance and fire engine sounding a siren 		', 'Presidential motorcade 		', 'All of the above', '3', 10, 'All of the above'),
(249, 'All vehicles shall have:		', NULL, 0, 'Red reflectors in front 		', 'White reflectors in front 		', 'Either red or white reflectors in front', '2', 11, 'White reflectors in front 		'),
(250, 'The law says when driving a motor vehicle at 6.00am the vehicle must have its headlights lit:		', NULL, 0, 'Yes 		', 'No 		', 'Depends on day light', '1', 11, 'Yes 		'),
(251, 'This sign indicates?	  	', 'assets/20230710140806263_272559_p2.5.PNG', 0, 'Danger of stray animals 		', 'Danger of wild animals 		', 'Danger of farm animals', '3', 10, 'Danger of farm animals'),
(252, 'In a traffic circle, I shall indicate:		', 'assets/20230815071625664_427630_BB21.PNG', 0, 'When going out 		', 'When going in', 'When making a \'U\' turn', '1', 11, 'When going out 		'),
(253, 'A solid yellow line on the left hand side of the road indicates:', NULL, 0, 'It may be straddled to overtake traffic which is turning right', 'It may be straddled to overtake cyclists', 'It may not be straddled', '3', 10, 'It may not be straddled'),
(254, 'A vehicle turning right should		', NULL, 0, 'Give way to window shopping pedestrians 		', 'Give way to oncoming traffic 		', 'Give way to pedestrians standing on the pavement.', '2', 11, 'Give way to oncoming traffic 		'),
(255, 'This sign indicates?	  ', 'assets/20230710141511165_203031_p2.6.PNG', 0, '	Hump ahead 		', 'Dip or ridge ahead 		', 'Mountains ahead', '2', 10, 'Dip or ridge ahead 		'),
(256, 'What is the legal maximum speed on a Zimbabwean Highway?		', NULL, 0, '120km/h for all vehicles 	', 'Between 80 and 120 km/h on all roads. 		', '120km/h for light vehicles and 80km/h for heavy vehicles	', '3', 11, '120km/h for light vehicles and 80km/h for heavy vehicles	'),
(257, 'What must you do before you change direction?		', NULL, 0, 'Signal my intention when turning left only 		', 'Signal my intention when turning right only 		', 'Signal my intention before acting and see that the road is clear before changing direction', '3', 11, 'Signal my intention before acting and see that the road is clear before changing direction'),
(258, 'This sign means that:	  	', 'assets/20230806183812416_52960_AA6.PNG', 0, 'SOCCER MATCH TODAY	', 'STADIUM AHEAD', 'PRESENCE OF ATHELETS AHEAD', '2', 10, 'STADIUM AHEAD'),
(259, 'This sign regulates:	  	', 'assets/20230710142921697_586584_PNG 1.PNG', 0, 'Time restriction 		', 'Speed restriction 		', 'Weight restriction', '3', 11, 'Weight restriction'),
(260, 'Which car stops?	  	', 'assets/20230710142544192_652069_p2.8.PNG', 0, 'Car A 		', 'Car B 		', 'Car C', '1', 10, 'Car A 		'),
(261, 'Which car goes last?	  ', 'assets/20230806185115518_194024_aa8.PNG', 0, 'Car B 		', 'Car A 		', 'Car  C', '2', 11, 'Car A 		'),
(262, 'Which car moves last at this intersection?	  	', 'assets/20230710142904975_6456_p2.9.PNG', 0, 'Car B 		', 'Car A 		', 'Car C', '3', 10, 'Car C'),
(263, 'Which car goes second', 'assets/20230806184009473_129739_AA7.PNG', 0, 'Car C 		', 'Car B 		', 'Car A', '3', 10, 'Car A'),
(264, 'Which car goes first?	 ', 'assets/20230710143442799_465570_PNG 3.PNG', 0, 'Car C 	', 'Car B 	', 'Car A', '3', 11, 'Car A');
INSERT INTO `questions` (`id`, `question_text`, `img_insert`, `option_image`, `option_a`, `option_b`, `option_c`, `correct_option`, `exam_id`, `answer`) VALUES
(265, 'When traveling at 90km/h I must leave a gap of:		', NULL, 0, 'Six vehicle lengths 		', 'Five vehicle lengths', 'Seven vehicle lengths', '1', 10, 'Six vehicle lengths 		'),
(266, 'When approaching a give way sign:		', NULL, 0, 'I am obliged to stop before proceeding 		', 'I am obliged to give way to traffic approaching the intersection on my right only 		', 'I may proceed with caution and without stopping provided there is no other cars coming ', '3', 10, 'I may proceed with caution and without stopping provided there is no other cars coming '),
(267, 'I must dip my headlamps:		', NULL, 0, 'When approaching a railway level crossing. 		', 'When driving in a well lit area 		', 'When approaching an urban area', '2', 10, 'When driving in a well lit area 		'),
(268, 'In rural areas where traffic is not controlled, I should give precedence to:		', NULL, 0, 'Traffic approaching from a road on the left. 		', 'Traffic approaching from a road on the right. 		', 'Traffic already in the intersection regardless of which side it is coming from', '3', 10, 'Traffic already in the intersection regardless of which side it is coming from'),
(269, 'The insignia of a warning sign is:		', NULL, 0, 'A triangle 		', 'A circle 		', 'A rectangle', '1', 10, 'A triangle 		'),
(270, 'When approaching a narrow bridge, I must pay attention to:		', NULL, 0, 'Height restriction 		', 'Length restriction 	', '	Width restriction', '3', 10, '	Width restriction'),
(271, 'At a robot-controlled intersection where you have stopped over the pedestrian crossing lines, what do	you do ?', NULL, 0, 'Decide to carry on 		', ' Reverse the vehicle', 'Stay where you are', '3', 10, 'Stay where you are'),
(272, 'This sign regulates that:	  	', 'assets/20230710144110529_836295_PNG 4.PNG', 0, 'Vehicles should give precedence to traffic oncoming from the road on the right 		', 'Vehicles should give precedence to traffic coming from the left 		', 'Vehicles should give precedence to all cross traffic', '3', 12, 'Vehicles should give precedence to all cross traffic'),
(273, 'When travelling at 75km/h I must leave a gap of:		', NULL, 0, 'Four vehicle lengths. 		', 'Seven vehicle lengths 		', 'Five vehicle lengths 	', '3', 12, 'Five vehicle lengths 	'),
(274, 'Before driving a motor vehicle on a public road, it must have the following:		', NULL, 0, 'Certificate of fitness and a repair card. 		', 'Learner\'s licence. 		', 'Registration book, insurance and a vehicle licence.', '3', 13, 'Registration book, insurance and a vehicle licence.'),
(275, 'Which car goes last?	  	', 'assets/20230806195647754_341269_aa11.PNG', 0, 'Car C 		', 'Car A 	', 'Car B', '1', 12, 'Car C 		'),
(276, 'The correct sequence of a robot traffic light is:		', NULL, 0, 'Amber, Green, Red. 		', 'Green, Amber, Red. 		', 'Red, Amber, Green', '2', 13, 'Green, Amber, Red. 		'),
(277, 'When approaching a pedestrian crossing you should:		', NULL, 0, 'Sound the horn. 		', 'Accelerate quickly over it. 		', 'Slow down and prepare to stop.', '3', 13, 'Slow down and prepare to stop.'),
(278, 'For cyclists not to interfere with other road users they should ride:		', NULL, 0, 'Two to three abreast. 		', 'Single file. 		', 'Completely off the road.', '2', 13, 'Single file. 		'),
(279, 'Which car gives right of way?	  	', 'assets/20230710144743868_902368_PNG 6.PNG', 0, 'Car A 		', 'Car C 		', 'Car B', '2', 12, 'Car C 		'),
(280, 'A heavy vehicle towing independent trailers must have:		', NULL, 0, 'Safety chains fitted to the trailers. 		', 'More pulling power. 		', 'As many spare wheels as possible.', '1', 13, 'Safety chains fitted to the trailers. 		'),
(281, 'When in a straight ahead lane at an intersection I am not allowed to:		', NULL, 0, 'Turn without indicating 		', 'Turn at all 		', 'Turn without requesting 		', '2', 12, 'Turn at all 		'),
(282, 'At a bridge, I am not allowed to:		', NULL, 0, 'Overtake slow moving vehicles 		', 'Slow down and check the road ahead 		', 'Dip my lights even for oncoming vehicles', '1', 12, 'Overtake slow moving vehicles 		'),
(283, 'When approaching a slow moving combine harvester going in my direction of travel	', NULL, 0, '	I increase speed and overtake it 		', 'I slow down and give it space to pass 		', 'I slow down and keep behind until its safe to overtake', '3', 13, 'I slow down and keep behind until its safe to overtake'),
(284, 'A speed restriction sign means:		', NULL, 0, 'Do not exceed the stated speed of 80km/hr', 'Drive below the stated speed 		', 'Do not exceed the stated speed', '3', 12, 'Do not exceed the stated speed'),
(285, 'When I intend to stop on the road I must:		', NULL, 0, 'Flash my hazard lights 		', 'Slow down and stop 		', 'Slow down, check the rear view mirror and stop', '3', 12, 'Slow down, check the rear view mirror and stop'),
(286, 'To drive a heavy vehicle you must have reached the age of:		', NULL, 0, 'Nineteen years. 		', 'Eighteen years. 		', 'Seventeen years.', '2', 13, 'Eighteen years. 		'),
(287, 'At a rail level crossing with open booms a driver should	', NULL, 0, 'Quickly cross the railway 		', 'Look both sides and cross 		', 'Stop and look to the right', '2', 12, 'Look both sides and cross 		'),
(288, 'Which car moves second at this intersection?	  ', 'assets/20230710144954726_256585_p2.11.PNG', 0, '	Car A 		', 'Car B 		', 'Car C', '2', 13, 'Car B 		'),
(289, 'The purpose of the parking brake is to		', NULL, 0, 'Keep the vehicle stationary 		', 'Keep the vehicle stationary on a gradient only 		', 'Slow the vehicle down', '1', 12, 'Keep the vehicle stationary 		'),
(290, 'At a pedestrian cross every driver must		', NULL, 0, 'A.Wave the pedestrians through 		', 'B.Hoot when it is his turn to go 		', 'C.Wait patiently and proceed when appropriate', '3', 12, 'C.Wait patiently and proceed when appropriate'),
(291, 'Which car moves first at this intersection?	  ', 'assets/20230710145147053_88988_p2.12.PNG', 0, '	Car A 		', 'Car B 	', '	Car C', '3', 13, '	Car C'),
(292, 'Which car stops?	  ', 'assets/20230710145315493_814485_p2.13.PNG', 0, '	Car A 		', 'Car B 		', 'Car C', '2', 13, 'Car B 		'),
(293, 'This sign warns of:	  	', 'assets/20230815071735216_23652_bb49.PNG', 0, 'Cross road ahead. 		', 'Rail and level crossing ahead. 	', '	Stop or give way sign ahead.', '3', 13, '	Stop or give way sign ahead.'),
(294, 'When approaching this sign I am expected to:	  ', 'assets/20230710145902755_395657_PNG 7.PNG', 0, 'Engage brakes continuously 		', 'Engage low gear 		', 'Engage high gear', '2', 12, 'Engage low gear 		'),
(295, 'At this sign I should:	  	', 'assets/20230710145643899_543731_p2.15.PNG', 0, 'Stop and give way to traffic coming from my right. 		', 'Slow down and proceed if there is no crossing traffic. 		', 'Stop and proceed when the road is clear on both sides.', '2', 13, 'Slow down and proceed if there is no crossing traffic. 		'),
(296, '	Which car goes first?	  	', 'assets/20230809190103270_493248_bb13.jpeg', 0, 'Car A		 	', 'Car B	 		', 'Car C	', '2', 12, 'Car B	 		'),
(297, 'This sign shows  	', 'assets/20230806190657541_75827_aa10.PNG', 0, 'l may not park', 'l may park here or there is laybye ahead', 'l may park', '3', 13, 'l may park'),
(298, 'At this sign I should:	  	', 'assets/20230806195914585_619908_AA6.PNG', 0, 'Know there are students running ahead', 'stadium ahead', 'exercise caution for runners ahead', '2', 12, 'stadium ahead'),
(299, 'This sign regulates that:	  ', 'assets/20230710150108810_505639_p2.17.PNG', 0, '	Speed limit on this road is 60 km/h 		', 'Speed limit on this road is between 60 km/h and 80 km/h. 		', 'Speed limit on this road is 80 km/h', '3', 13, 'Speed limit on this road is 80 km/h'),
(300, 'This sign warns of:	  ', 'assets/20230710150741439_350953_Capture.PNG', 0, '	Many vehicles following behind 		', 'A pile up accident 		', 'Possibility of congestion on road ahead', '3', 12, 'Possibility of congestion on road ahead'),
(301, 'This sign is:	  	', 'assets/20230710150411176_925933_p2.18.PNG', 0, 'A danger warning sign 		', 'A regulatory sign 	', '	An informative sign', '2', 13, 'A regulatory sign 	'),
(302, 'In case of a rear wheel tyre burst, I		', NULL, 0, 'Apply foot brakes immediately 		', 'Avoid braking completely and control the steering whee 		', 'Do whatever comes to mind', '2', 12, 'Avoid braking completely and control the steering whee 		'),
(303, 'This sign is:	  	', 'assets/20230710150536944_965692_p2.19.PNG', 0, 'A carriageway marking. 	', '	An informative sign 		', 'A danger warning sign', '2', 13, '	An informative sign 		'),
(304, 'What are the colours of a private vehicle registration plates?		', NULL, 0, 'Red on white background 		', 'Black on white background 		', 'Black on yellow background', '3', 12, 'Black on yellow background'),
(305, 'The warning sign of a broken down vehicle is:		', NULL, 0, 'The driver waving to the other road users. 		', 'The flashing of indicators. 		', 'The red reflective triangle.', '3', 13, 'The red reflective triangle.'),
(306, 'When travelling at high speed on a main road, I signal		', NULL, 0, 'at least 50m before I turn 		', 'at least 100m before I turn 		', 'at least 7,5m before I turn', '2', 12, 'at least 100m before I turn 		'),
(307, 'On meeting an abnormal load vehicle under escort :		', NULL, 0, 'I should slow down and exercise caution 		', 'I should sound my horn and flash my lights to alert him of my presence 		', 'I should do nothing', '1', 13, 'I should slow down and exercise caution 		'),
(308, 'When riding a motorcycle you must wear:		', NULL, 0, 'A pair of cycle clips. 		', 'A pair of sun glasses.', 'A crash helmet', '3', 13, 'A crash helmet'),
(309, 'Direction arrows used in conjunction with prohibition lines on a road surface:		', NULL, 0, 'Are for information purposes only	 		', 'Relate to taxi drivers only	   		', 'Have a regulatory effect	', '3', 12, 'Have a regulatory effect	'),
(310, 'When turning left at a robot controlled intersection I should :		', NULL, 0, 'Yield to pedestrians to go through 		', 'Give right of way to traffic from the right 		', 'Sound the horn.', '1', 13, 'Yield to pedestrians to go through 		'),
(311, 'When an oncoming vehicle lights are on bright beam, what do you do?		', NULL, 0, 'Pull down the sun visor. 		', 'Slow down and look slightly to the left. 		', 'Switch spot lights on.', '2', 13, 'Slow down and look slightly to the left. 		'),
(312, 'Which car stops?	  	', 'assets/20230710151447690_929887_PNG 9.PNG', 0, 'Car A 		', 'Car B 		', 'Car C', '1', 12, 'Car A 		'),
(313, 'Which car stops?	  	', 'assets/20230710151204470_665995_p2.20.PNG', 0, 'Car C 		', 'Car A 		', 'Car B', '3', 13, 'Car B'),
(314, 'Which car moves last at this intersection?	  	', 'assets/20230710151634204_798708_PNG 10.PNG', 0, 'Car A 		', 'Car B 		', 'Car C', '1', 12, 'Car A 		'),
(315, 'Which car goes last?	  	', 'assets/20230710151306533_632706_p2.21.PNG', 0, 'Car B 		', 'Car A 		', 'Car C', '1', 13, 'Car B 		'),
(316, 'In rural areas, where traffic is not controlled, you should give precedence to:		', NULL, 0, 'Traffic from the road on the right. 		', 'To all crossing traffic. 		', 'Traffic already in the intersection regardless of which side it is coming from.', '3', 13, 'Traffic already in the intersection regardless of which side it is coming from.'),
(317, 'The minimum legal age at which an applicant can learn to drive is:		', NULL, 0, 'Eighteen years old. 	', '	Any age. 		', 'Sixteen years old.', '3', 13, 'Sixteen years old.'),
(318, 'Which car goes last?	  	', 'assets/20230710151921182_22286_PNG 11.PNG', 0, 'Car C 		', 'Car B 		', 'Car A', '2', 12, 'Car B 		'),
(319, 'At an uncontrolled intersection, I should give right of way to:		', NULL, 0, 'Oncoming traffic. 		', 'Traffic approaching from a road on the left. 		', 'Traffic approaching from a road on the right.', '3', 15, 'Traffic approaching from a road on the right.'),
(320, 'A clutch is used to		', NULL, 0, 'Increase vehicle speed 		', 'Decrease vehicle speed 		', 'Avoid noise when gear changing.', '3', 12, 'Avoid noise when gear changing.'),
(321, 'I may not overtake:		', NULL, 0, 'On a blind rise. 		', 'When travelling on four lane traffic. 		', 'Near the post office.', '1', 15, 'On a blind rise. 		'),
(322, 'Converging lanes means		', NULL, 0, 'Two lanes becoming one 		', 'One lane becoming two 		', 'A road off a roundabout', '1', 12, 'Two lanes becoming one 		'),
(323, 'Hazard perception means		', NULL, 0, 'Following directions of police officers 		', 'Obeying traffic signals 		', 'Reading a traffic situation in advance', '3', 12, 'Reading a traffic situation in advance'),
(324, 'This sign indicates that	  	', 'assets/20230710151953242_305389_p2.22.PNG', 0, 'Cyclists may not proceed beyond this 		', 'Both cyclists and pedestrians are prohibited beyond this sign. 		', 'Pedestrians find alternative route with their bicycles', '2', 15, 'Both cyclists and pedestrians are prohibited beyond this sign. 		'),
(325, 'At this sign I should:	  	', 'assets/20230710152323721_807339_p2.23.PNG', 0, 'Stop, and wait until the road ahead is clear on both sides. 		', 'Give right of way to vehicles from the left 		', 'Give right of way to vehicles from the right', '1', 15, 'Stop, and wait until the road ahead is clear on both sides. 		'),
(326, 'A yellow line on the left hand side of the road:		', NULL, 0, 'May not be crossed under any circumstances. 		', 'May be crossed to overtake traffic which is turning to the right. 		', 'May be crossed to overtake slow traffic.', '2', 15, 'May be crossed to overtake traffic which is turning to the right. 		'),
(327, 'When you see an animal in the road you		', NULL, 0, 'Increase speed to run it over 		', 'Reduce speed and stop when necessary 		', 'Flash your headlamps and hoot', '2', 16, 'Reduce speed and stop when necessary 		'),
(328, 'What is the incorrect sequence of a robot?		', NULL, 0, 'Green, Amber, Red 		', 'Amber, Red, Green 		', 'Red, Green, Amber', '3', 16, 'Red, Green, Amber'),
(329, 'This sign means:	  	', 'assets/20230710152520864_473141_p2.24.PNG', 0, 'Red Cross station ahead. 		', 'Cross road ahead. 		', 'Railway level crossing.', '3', 15, 'Railway level crossing.'),
(330, 'This sign means:	  	', 'assets/20230815072226555_222499_bb14.png', 0, 'Hospital ahead.', 'Danger of a variable nature', ' Speed de-restriction.', '2', 15, 'Danger of a variable nature'),
(331, 'In an urban area, which car has the right of way?	  	', 'assets/20230710153206390_414902_PNG 12.PNG', 0, 'Car A 		', 'Car B 		', 'The one which enters the intersection first', '2', 16, 'Car B 		'),
(332, 'This sign indicates, I may:	  	', 'assets/20230710152831510_352013_p2.25.PNG', 0, 'Expect to find a \'Lay-By\' ahead. 		', 'Park my vehicle. 		', 'Not park my vehicle.', '2', 15, 'Park my vehicle. 		'),
(333, 'Animal drawn vehicles must always have		', NULL, 0, 'Proper working headlights 		', 'Working tail lights 		', 'Reins and a leader', '3', 16, 'Reins and a leader'),
(334, 'When stopping a motor vehicle on a road except in traffic, where will you stop?		', NULL, 0, 'On the extreme right of the road 		', 'Stop in the middle if it is safe to do so 		', 'On the extreme left of the road or in an authorized parking place', '3', 16, 'On the extreme left of the road or in an authorized parking place'),
(335, 'At this sign I would:	  	', 'assets/20230710153126493_842344_p2.15.PNG', 0, 'Disengage gears. 		', 'Sound my hooter. 		', 'Proceed with caution and stop if necessary.', '3', 15, 'Proceed with caution and stop if necessary.'),
(336, 'How far from a corner are you forbidden to stop your vehicle?		', NULL, 0, '75 cm 		', '7.5m 		', '10m', '1', 16, '75 cm 		'),
(337, 'I must never change direction until I have:		', NULL, 0, 'Flashed my headlamps. 		', 'Sounded my hooter. 		', 'Indicated my intention and ascertained that the road is clear.', '3', 15, 'Indicated my intention and ascertained that the road is clear.'),
(338, 'I must take a habit of never setting my vehicle in motion until I have:		', NULL, 0, 'Checked the rear view mirror. 		', 'Checked the petrol. 		', 'Checked for children and animals around.', '3', 15, 'Checked for children and animals around.'),
(339, 'When under the influence of drugs or alcohol what must you do?		', NULL, 0, 'Drive slowly to a safe place	   			', 'Stay off the road			', 'Drive on the extreme left of the road	', '2', 16, 'Stay off the road			'),
(340, 'Which car is not breaking the law?	  	', 'assets/20230710153458636_559610_p2.26.PNG', 0, 'Car B 		', 'Car A 		', 'Car C', '2', 15, 'Car A 		'),
(341, 'Which car stops?	  	', 'assets/20230710153708627_676311_p2.27.PNG', 0, 'Car A 		', 'Car B', 'None', '1', 15, 'Car A 		'),
(342, 'Which car has right of way?	  	', 'assets/20230710153833851_559434_p2.28.PNG', 0, 'Car B 		', 'Car A 		', 'The fastest', '2', 15, 'Car A 		'),
(343, 'Which car has no right of way?	  ', 'assets/20230710154001825_617588_p2.29.PNG', 0, '	Car A 		', 'Mercedes Benz 		', 'Car B', '1', 15, '	Car A 		'),
(344, 'When filling my tank with petrol, I should:		', NULL, 0, 'Engage in reverse gear. 		', 'Switch off the engine. 		', 'Close the choke.', '2', 15, 'Switch off the engine. 		'),
(345, 'When travelling at 75km/h I must leave a gap of:		', NULL, 0, 'Four vehicle lengths. 		', 'Seven vehicle lengths 		', 'Five vehicle lengths', '3', 15, 'Five vehicle lengths'),
(346, 'When turning right at an intersection, I must :		', NULL, 0, 'Hoot. 		', 'Give way to persons within the pedestrian crossing. 		', 'Give way to oncoming traffic', '3', 15, 'Give way to oncoming traffic'),
(347, 'I may dip my head lamps:		', NULL, 0, 'When approaching a hospital. 		', '	When approaching a railway level crossing. 	', '	For oncoming traffic.', '3', 15, '	For oncoming traffic.'),
(348, 'On which side must you overtake animals which are being led:		', NULL, 0, 'Left hand side 		', 'Right hand side 		', 'Whichever side is safe', '3', 16, 'Whichever side is safe'),
(349, 'The general driving rule in Zimbabwe\'s highway code is		', NULL, 0, 'Common sense 		', 'Drive on the left within your lane 		', 'Drive on the left beyond yellow line if there is congestion', '2', 15, 'Drive on the left within your lane 		'),
(350, 'The insignia of a command sign is:		', NULL, 0, 'A triangle 		', 'A rectangle 		', 'A circle', '3', 16, 'A circle'),
(351, 'Which is not the correct robot light sequence?		', NULL, 0, 'Red, Green, Amber 		', 'Green, Amber, Red. 		', 'Amber, Green, Red.', '3', 15, 'Amber, Green, Red.'),
(352, 'The correct position of a motor cycle on the road is		', NULL, 0, 'Right of lane 		', 'Left of lane 		', 'Middle of lane.', '2', 15, 'Left of lane 		'),
(353, 'What are the directions given by fixed or flashing amber robot at an intersection?		', NULL, 0, 'Give precedence to all cross traffic 			', 'Give precedence to all vehicles coming from the right 		', 'Give precedence to vehicles coming from the left', '2', 16, 'Give precedence to all vehicles coming from the right 		'),
(354, 'This sign mean	', 'assets/20230806201538742_503179_aa12.PNG', 0, 'Grid ahead', 'Physical Barrier ahead', 'Barrier', '2', 15, 'Physical Barrier ahead'),
(355, 'A person riding a motorbike must wear		', NULL, 0, 'Mine helmet 		', 'Any cap 		', 'A crash helmet', '3', 15, 'A crash helmet'),
(356, 'Which car goes first?	  	', 'assets/20230710155156791_926040_PNG 13.PNG', 0, 'Car A 		', 'Car B 		', 'Car C', '2', 16, 'Car B 		'),
(357, 'When approaching this sign:	  	', 'assets/20230710154947909_488226_p2.30.PNG', 0, 'I should not worry because it is not one of the known road signs 		', 'I am being warned the hazard ahead is of a variable nature 		', 'It is a surprise sign because you have just passed a hazard', '2', 15, 'I am being warned the hazard ahead is of a variable nature 		'),
(358, 'Chevron colour is mainly for ', NULL, 0, 'pick up trucks', 'Heavy vehicles ', 'Both of the above', '2', 17, 'Heavy vehicles '),
(359, 'When I intend to stop on the road I must:		', NULL, 0, 'Flash my hazard lights 		', 'Slow down and stop 		', 'Slow down, check the rear view mirror and stop', '3', 11, 'Slow down, check the rear view mirror and stop'),
(360, 'Which car is not breaking the law?	  	', 'assets/20230710155547971_933495_p2.31.PNG', 0, 'Car A 		', 'Car C 	', '	Car B', '3', 17, '	Car B'),
(361, 'This sign indicates?	  	', 'assets/20230710155656794_243203_p2.32.PNG', 0, 'Direction 		', '4 way stop 		', 'A near-complete round about ahead', '1', 17, 'Direction 		'),
(362, 'Driving instructor is exempted from wearing a safety belt		', NULL, 0, 'When carrying learner drivers 		', 'When conducting driving lessons 		', 'Only when reversing', '2', 17, 'When conducting driving lessons 		'),
(363, 'A learner driver is allowed to carry passengers		', NULL, 0, 'When he is in the company of qualified instructor 		', 'If the passengers are learner drivers 		', 'Never.', '3', 17, 'Never.'),
(364, 'Which is the correct way to negotiate a right turn?		', NULL, 0, 'Maintaining a firm position in the lane centre 		', 'Moving far to the right as possible within your lane 		', 'Moving far to the left as possible within your lane', '2', 17, 'Moving far to the right as possible within your lane 		'),
(365, 'A double continuous white line with a broken line in the center of a road may:		', NULL, 0, 'Be crossed if the road ahead is clear 		', 'Not be crossed.', 'Be crossed only on busy highways', '2', 17, 'Not be crossed.'),
(366, 'This road sign is	  	', 'assets/20230710160116745_897280_p2.33.PNG', 0, 'For information purposes only 		', 'Related to trucks only 		', 'Of regulatory effect', '3', 17, 'Of regulatory effect'),
(367, 'Which car goes last?	  	', 'assets/20230806203041302_131141_aa13.PNG', 0, 'hump ahead', 'slow down many humps ahead', 'Dip or ridge ahead', '3', 17, 'Dip or ridge ahead'),
(368, 'This traffic light regulates that:	  	', 'assets/20230711063057253_945928_PNG 14.PNG', 0, 'Traffic turning to the right may filter if the road is clear 		', 'Traffic turning to the left may filter if the road is clear 		', 'Traffic going straight may proceed if road is clear', '2', 14, 'Traffic turning to the left may filter if the road is clear 		'),
(369, 'This road sign means	  	', 'assets/20230711063059054_903966_p2.35.PNG', 0, 'Buses are being regulated 		', 'Buses are being warned 		', 'Buses are being informed', '1', 17, 'Buses are being regulated 		'),
(370, 'In which circumstances would a driver proceed against a red robot?		', NULL, 0, 'Very late at night 		', 'When directed by a police officer 		', 'When there is a red filter arrow', '2', 17, 'When directed by a police officer 		'),
(371, '	Which statement is true about Double Prohibition lines?	   	', 'assets/20230711063803408_148763_PNG 15.PNG', 0, 'No vehicle may at anytime be driven on the left hand side of this line	   	 	', 'Can not be crossed at anytime	  		', 'No vehicle may at anytime be driven on the right hand side of this line	', '2', 14, 'Can not be crossed at anytime	  		'),
(372, 'This road sign means	  	', 'assets/20230711063523693_457410_p2.36.PNG', 0, 'Overtaking prohibited 		', 'Heavy goods vehicles may not overtake 		', 'Heavy goods vehicles may not overtake another goods vehicle', '3', 17, 'Heavy goods vehicles may not overtake another goods vehicle'),
(373, 'When approaching a level crossing, what must you do?	  	', 'assets/20230711064012425_883689_PNG 16.PNG', 0, 'Increase speed 	', '	Reduce speed and be ready to stop 		', 'Maintain speed', '2', 14, '	Reduce speed and be ready to stop 		'),
(374, 'What is the maximum speed limit on wide tar roads?		', NULL, 0, 'There is no maximum speed limit 		', '100km/h 		', '120km/h', '3', 14, '120km/h'),
(375, 'This road sign means	  	', 'assets/20230711063848045_978560_p2.37.PNG', 0, 'Overtaking prohibited 		', 'Overtaking by light vehicles prohibited 		', 'Light vehicles may not overtake one another', '1', 17, 'Overtaking prohibited 		'),
(376, 'Which car stops?	  	', 'assets/20230711064242306_870557_PNG 17.PNG', 0, 'Either of the two 		', 'Car A 		', 'Car B', '3', 14, 'Car B'),
(377, 'To drive a public service vehicle one needs		', NULL, 0, 'Registration book, defensive driving certificate and 5yrs driving experience 		', 'Defensive driving certificate, 5yrs driving experience & medical certificate 		', 'Defensive driving certificate, insurance and 5yrs driving experience', '2', 17, 'Defensive driving certificate, 5yrs driving experience & medical certificate 		'),
(378, 'What is the general speed limit in an urban area?		', NULL, 0, '40km/h 		', '80km/h 		', '60km/h', '3', 14, '60km/h'),
(379, 'Which car stops?	  	', 'assets/20230809200004718_513934_BB11.jpeg', 0, 'Car B 		', 'Car C 		', 'Car A', '1', 17, 'Car B 		'),
(380, 'This sign regulates that:	  	', 'assets/20230711064530301_665202_PNG 18.PNG', 0, 'An about turn is prohibited 		', 'Roundabout ahead 		', 'Vehicles allowed to turn to the right only', '1', 14, 'An about turn is prohibited 		'),
(381, 'Which car moves last at this intersection?	  	', 'assets/20230711064227123_127721_p2.39.PNG', 0, 'Car B 		', 'Car A 		', 'Car C', '1', 17, 'Car B 		'),
(382, 'Which car goes last?	  	', 'assets/20230711064327585_361119_p2.40.PNG', 0, 'Car C 		', 'Car B 		', 'Car A', '1', 17, 'Car C 		'),
(383, 'To drive an agricultural tractor in Zimbabwe, the minimum age required is:		', NULL, 0, 'Sixteen years 		', 'Nineteen years. 		', 'Eighteen years.', '3', 17, 'Eighteen years.'),
(384, 'This means', 'assets/20230809194344209_251100_bb14.png', 0, 'Danger ahead		', 'Danger of variable nature   	 	', 'Danger of rain drops ahead', '2', 14, 'Danger of variable nature   	 	'),
(385, 'When changing lanes you		', NULL, 0, 'Signal, change lane, check blind spot 		', 'Signal, check blind spot, change lane 		', 'Change lane and signal after', '2', 17, 'Signal, check blind spot, change lane 		'),
(386, 'Hand signals should be used		', NULL, 0, 'By learner drivers only', 'To emphasize the driver\'s intention ', 'Only when turning right', '2', 17, 'To emphasize the driver\'s intention '),
(387, 'In Zimbabwe\'s Highway code the general rule is to		', NULL, 0, 'Overtake on the right 		', 'Overtake from between lanes if possible 		', 'Overtake from which ever side is safer', '1', 17, 'Overtake on the right 		'),
(388, 'When travelling behind another vehicle at night I must:		', NULL, 0, 'Switch on my spot lights and sidelights 		', 'Switch on dipped headlights 		', 'Switch on my full beam', '2', 14, 'Switch on dipped headlights 		'),
(389, 'The colours of an \'L-plate\' are		', NULL, 0, 'White on red background 		', 'Red on yellow background 		', 'Red on white background', '3', 17, 'Red on white background'),
(390, 'Which is the correct robot light sequence in Zimbabwe and South Africa ?		', NULL, 0, 'Green , Amber , Red	', 'Red, Amber, Green 		', 'Green, Red, Amber', '1', 14, 'Green , Amber , Red	'),
(391, 'When approaching a tunnel or a flyover, I must pay attention to:		', NULL, 0, 'Height and length restriction 		', 'Height and width restriction 		', 'Height and weight restriction', '2', 17, 'Height and width restriction 		'),
(392, 'This road sign indicates:	  	', 'assets/20230711064918568_470731_p2.41.PNG', 0, 'Weight restriction 		', 'Width restriction 		', 'Height restriction', '3', 17, 'Height restriction'),
(393, 'A continuous white line in the centre of the road:		', NULL, 0, 'May cross if there is no oncoming traffic 		', 'May be crossed in a rural area and game parks 		', 'May not be crossed under any circumstances.', '3', 14, 'May not be crossed under any circumstances.'),
(394, 'You see a person being knocked unconscious in a road accident. What action do you take?		', NULL, 0, 'Call the ambulance 		', 'Check for clear breathing 		', 'Report to the police as soon as possible', '2', 17, 'Check for clear breathing 		'),
(395, 'When in a straight ahead lane at an intersection I am allowed to:		', NULL, 0, 'Turn without indicating 		', 'Go straight', 'Change lanes without checking blind spots.', '2', 18, 'Go straight'),
(396, 'The first sign means	', 'assets/20230809194553023_262036_bb15.png', 0, 'Slippery Road ahead', 'Danger of falling stones ahead	', 'Mist ahead', '2', 14, 'Danger of falling stones ahead	'),
(397, 'Which of the following vehicles is not subject to carrying a fire extinguisher?		', NULL, 0, 'A pedal cycle 		', 'A motor vehicle which is not yet registered 		', 'A public service vehicle which is not carrying passengers', '1', 14, 'A pedal cycle 		'),
(398, 'At a four way junction which car goes first?		', NULL, 0, 'The car on the left 		', 'The car on the right 		', 'The first car to stop whether on the right or left', '1', 18, 'The car on the left 		'),
(399, 'A speed derestriction sign means I may:		', NULL, 0, 'Do not exceed the stated speed 		', 'Exceed previous speed limit 		', 'Not exceed a speed of 130km/h', '2', 18, 'Exceed previous speed limit 		'),
(400, 'A motor vehicle towing two trailers should carry:		', NULL, 0, '6 breakdown triangles 		', '3 breakdown triangles ', '2 breakdown triangles', '1', 14, '6 breakdown triangles 		'),
(401, 'When meeting a breakdown vehicle flashing its beacon lights I must:		', NULL, 0, 'Pull off the road completely 		', 'Keep to the extreme left and pass as fast as possible. 		', 'Proceed with caution', '3', 18, 'Proceed with caution'),
(402, 'Breakdown triangles should be placed within		', NULL, 0, '30 - 50 centimeters from the nearest point of the breakdown vehicle 		', '30 - 50 meters from the nearest point of the breakdown vehicle 		', '25 - 60 centimeters from the nearest point of the breakdown vehicle', '2', 14, '30 - 50 meters from the nearest point of the breakdown vehicle 		'),
(403, 'When I intend to stop on the road I must:		', NULL, 0, 'Slow down check my rear view mirrors and stop. 		', 'Slow down, check mirror, indicate intention, pull off the road and stop 		', 'Flash my hazards and apply emergency brakes', '2', 18, 'Slow down, check mirror, indicate intention, pull off the road and stop 		'),
(404, 'The position of a motor cyclist travelling on a highway in rural areas is		', NULL, 0, 'Extreme left of lane 	', '	Centre of lane 		', 'Extreme right of lane', '1', 18, 'Extreme left of lane 	'),
(405, 'To drive a Taxicab you must have reached at least the age of:		', NULL, 0, 'Twenty years and medically fit 		', 'Twenty-five years and medically fit 		', 'Twenty-one years and medically fit', '2', 14, 'Twenty-five years and medically fit 		'),
(406, 'When approaching an animal drawn vehicle I must:		', NULL, 0, 'Blow my horn and pass 		', 'Slow down and pass on the safest side 		', 'Flash headlights and pass', '2', 18, 'Slow down and pass on the safest side 		'),
(407, 'Which car moves SECOND at this intersection?	  	', 'assets/20230711070330495_929163_PNG 21.PNG', 0, 'Car A 		', 'Car C 		', 'Car B', '1', 14, 'Car A 		'),
(408, 'How many passengers are permitted to be carried by a motor cycle with a side car attached?		', NULL, 0, 'Two 		', ' One 		', 'Three', '2', 18, ' One 		'),
(409, 'At a robot controlled intersection where you have stopped over pedestrian crossing lines, do you:		', NULL, 0, 'Reverse the vehicle 		 ', 'Stay where you are 		', 'Decide to carry on in order not to obstruct', '2', 14, 'Stay where you are 		'),
(410, 'You may overtake:		', NULL, 0, 'On a blind rise. 		', 'Where there is a continuous line and a broken line on your side 		', 'When there are two lanes going opposite directions.', '2', 18, 'Where there is a continuous line and a broken line on your side 		'),
(411, 'When temporarily parked by the side of the road at night, one must leave:		', NULL, 0, 'Your headlights on bright beam 		', 'Your tail lights and side lights on. 		', 'Your headlamps on low beam', '2', 14, 'Your tail lights and side lights on. 		'),
(412, 'When approaching an animal drawn vehicle:		', NULL, 0, 'You blow your horn and pass quickly 		', 'You flash your headlamps 		', 'You slow down and pass through the safer side', '3', 14, 'You slow down and pass through the safer side'),
(413, 'What should you remember when approaching a pedestrian crossing?		', NULL, 0, 'Maintain your speed at 60km/h 		', 'Prepare to stop regardless that there are no pedestrians 		', 'Increase speed so that you pass quickly', '2', 18, 'Prepare to stop regardless that there are no pedestrians 		'),
(414, 'You may overtake:		', NULL, 0, 'On a blind rise. 		', 'When there is a continuous white line 		', 'When there are two or more lanes going in the same direction', '3', 14, 'When there are two or more lanes going in the same direction'),
(415, 'A vehicle turning right should		', NULL, 0, 'Give way to oncoming traffic proceeding straight 		', 'Give way to pedestrians leaving the pavement 		', 'Give way to cyclists going straight ahead', '1', 18, 'Give way to oncoming traffic proceeding straight 		'),
(416, 'A special medical certificate for public service vehicle drivers expires after:		', NULL, 0, 'Twelve months 		', 'Eighteen months 		', 'Five years', '1', 18, 'Twelve months 		'),
(417, 'You may drive without a safety belt:		', NULL, 0, 'When you are driving slowly 		', 'When reversing 		', 'When you are driving very fast', '2', 14, 'When reversing 		'),
(418, 'At the age of 17 years a person is allowed to drive		', NULL, 0, 'Light motor vehicles only 		', 'Minibuses and light cars 		', 'Both heavy and light provided he/she is a holder of a class two driving licence', '1', 18, 'Light motor vehicles only 		'),
(419, 'The hooter is only used:		', NULL, 0, 'When there are animals in the road. 		', 'To greet friends 		', 'When brakes suddenly fail and there is an accident danger.', '3', 14, 'When brakes suddenly fail and there is an accident danger.'),
(420, 'A tractor drivers permit is issued to a person who is aged:		', NULL, 0, '18 and above before obtaining a licence 		', 'Anyone as and when it is required. 		', 'Above 20 years who is not a holder of any licence', '1', 18, '18 and above before obtaining a licence 		'),
(421, 'A \'one way\' sign is:		', NULL, 0, 'A danger warning sign 		', 'A parking sign 		', 'An informative sign', '3', 18, 'An informative sign'),
(422, 'A weight restriction is usually associated with		', NULL, 0, 'Bridges capacity on weight 		', 'Wet roads capacity on speed 		', 'Strip roads weight capacity', '1', 14, 'Bridges capacity on weight 		'),
(423, 'Hazard perception means:		', NULL, 0, 'Reading a traffic situation well in advance 		', 'Following police instructions as may be necessary 		', 'Obeying danger signs only.', '1', 18, 'Reading a traffic situation well in advance 		'),
(424, 'A blind spot on a road is a part of the road		', NULL, 0, 'Not covered by rear view mirror 		', 'Where visibility is poor due to mist 		', 'Directly in front of where the vehicle is moving towards', '1', 14, 'Not covered by rear view mirror 		'),
(425, 'In well lit areas drivers are required to drive with		', NULL, 0, 'Headlights on low beam and spot lights off. 		', 'Headlights on high beam and spot lights off 		', 'Headlights and stop lights off.', '1', 18, 'Headlights on low beam and spot lights off. 		'),
(426, 'A learner driver is exempted from wearing a safety belt		', NULL, 0, 'When being driven by an instructor 		', 'When reversing 		', 'When driving at a constant speed of 60km/h', '2', 18, 'When reversing 		'),
(427, 'Being the first at an accident scene, what are you expected to do?		', NULL, 0, 'Observe from far away and contact V.I.D. 		', 'Render first aid and report to the nearest police. 		', 'Take pictures which will assist your report to the police.', '2', 18, 'Render first aid and report to the nearest police. 		'),
(428, 'At a give way sign		', NULL, 0, 'You give right of way to vehicles from your right', 'Slow down and give right of way to all cross traffic ', 'You stop and give right of way to all cross traffic', '2', 18, 'Slow down and give right of way to all cross traffic '),
(429, 'When a vehicle starts skidding, I should		', NULL, 0, 'Brake harder 		', 'Increase speed 		', 'Release brakes', '3', 19, 'Release brakes'),
(430, 'A dualised carriageway means		', NULL, 0, '2 lanes in one direction 		', '2 lanes in opposing directions with dividing strip 		', 'Wide lanes', '1', 18, '2 lanes in one direction 		'),
(431, 'How far from a corner am I prohibited from parking my vehicle?		', NULL, 0, '7m 		', '17.5m 		', '7.5m', '1', 18, '7m 		'),
(432, '	You are going to reverse but you are not sure the area is clear. You should		', NULL, 0, 'Assume it is clear and reverse anywhere	   		', 'Check only the rear view mirrors	  		', 'Get out of the car and check	', '3', 19, 'Get out of the car and check	'),
(433, 'This sign means', 'assets/20230815074216874_248357_BB34.png', 0, 'Traffic cycle ahead under construction', 'Traffic cycing ahead exercise caution and expect to be stopped by police', 'Traffic cycle ahead', '3', 18, 'Traffic cycle ahead'),
(434, 'You come across stray animals on the road. You ..		x', NULL, 0, 'Flash your headlights when passing 		', 'Sound horn to alert them 		', 'Drive past slowly and give them plenty of room', '3', 19, 'Drive past slowly and give them plenty of room'),
(435, 'When towing caravan trailers safest mirrors to use are?		', NULL, 0, 'Extended arm side mirrors 		', 'Interior wide angle mirrors 		', 'Ordinary mirrors', '1', 19, 'Extended arm side mirrors 		'),
(436, 'MEANING OF THIS SIGN IS :', 'assets/20230809202358214_17512_BB1.PNG', 0, 'TRAFFIC LIGHTS AHEAD	', 'TRAFFIC LIGHTS IN ORDER', 'TRAFFIC LIGHTS NOT IN ORDER', '3', 18, 'TRAFFIC LIGHTS NOT IN ORDER'),
(437, 'When overtaking a bike rider in windy weather give more room because		', NULL, 0, 'He may accelerate 		', 'He can be blown off course 		', 'He may not see you', '3', 19, 'He may not see you'),
(438, 'Which car goes last?	  	', 'assets/20230711071516461_89850_p2.43.PNG', 0, 'Car C 		', 'Car B 		', 'Car A', '2', 18, 'Car B 		'),
(439, 'To facilitate easy movement going uphill you have to		', NULL, 0, 'Select lower gear ', 'Select highest gear 		', 'Accelerate using high gears', '1', 19, 'Select lower gear '),
(440, 'Engine braking effect is felt when you		', NULL, 0, 'Select low gear 		', 'Select neutral 		', 'You apply your handbrake', '1', 19, 'Select low gear 		'),
(441, 'When going down a long descent, keeping clutch down too long can cause		', NULL, 0, 'More fuel consumption	 		', 'Brake overheating	   		', 'Car can loose control	', '3', 19, 'Car can loose control	'),
(442, 'This sign indicates:	  	', 'assets/20230711072229180_535374_PNG 22.PNG', 0, 'Portion of road is set aside for pedestrians and pedal cyclists 		', 'Portion of road set aside for motor cyclists and pedestrians 		', 'Pedal cyclists and pedestrians should yield right of way', '1', 19, 'Portion of road is set aside for pedestrians and pedal cyclists 		'),
(443, 'This sign mean  	', 'assets/20230807050037011_140669_AA15.PNG', 0, 'Be expected to check my vehicle', 'expect to see road works ahead', 'Slow down and expect to be stopped', '3', 20, 'Slow down and expect to be stopped'),
(444, 'Labelling on abnormal load vehicle reads		', NULL, 0, 'Abnormal vehicle 		', 'Abnormal load 		', 'Abnormal size vehicle', '2', 19, 'Abnormal load 		'),
(445, 'Which car goes last', 'assets/20230807044835102_809410_aa14.PNG', 0, 'Car C	', 'Car A', 'Car B', '3', 19, 'Car B'),
(446, 'You are waiting behind a cyclist at a traffic light. When it changes, you should..		', NULL, 0, 'Beep your hooter a drive through before the cyclist does 		', 'Try to move before the cyclist does 		', 'Allow cyclist room and time to move', '3', 19, 'Allow cyclist room and time to move'),
(447, 'Which car goes last?	  	', 'assets/20230711072133827_558452_p2.45.PNG', 0, 'Car C 		', 'Car B 		', 'Car A', '2', 20, 'Car B 		'),
(448, 'The reaction distance increases because of ...', NULL, 0, 'Old age 		', 'Engine speed 		', 'Spongy brakes', '2', 19, 'Engine speed 		'),
(449, 'When approaching this sign I should:	  	', 'assets/20230711072311241_603785_p2.46.PNG', 0, 'Disengage gears. 		', 'Engage high gear 		', 'Engage a lower gear', '3', 20, 'Engage a lower gear'),
(450, 'When approaching a traffic light that has been green for long		', NULL, 0, 'Accelerate quickly 		', 'Maintain your speed 		', 'Be prepared to stop', '3', 19, 'Be prepared to stop'),
(451, 'When travelling behind another vehicle at night I must:		', NULL, 0, 'Switch on my spot lights and sidelights 	', '	Switch on dipped headlights 		', 'Switch on my full beam', '2', 20, '	Switch on dipped headlights 		'),
(452, 'When should a cellphone be used during driving:		', NULL, 0, 'In an emergency 		', 'When traffic density is low 		', 'Never', '3', 19, 'Never'),
(453, 'You may legally block an intersection:		', NULL, 0, 'When you enter the intersection on the green light 		', 'During rush hour traffic 		', 'Under no circumstances', '3', 20, 'Under no circumstances'),
(454, 'A transverse yield or stop line at a pedestrian crossing		', NULL, 0, 'Has same effect 		', 'Has differing effect 		', 'Is for confusing the learner driver', '1', 20, 'Has same effect 		'),
(455, 'This sign warns of:	  	', 'assets/20230711072952303_466503_PNG 23.PNG', 0, 'Dual carriageway ahead 		', 'Two way carriageway 		', 'One way street', '2', 19, 'Two way carriageway 		'),
(456, 'When meeting a breakdown vehicle flashing its beacon light every driver must		', NULL, 0, 'Pull off the road completely 		', 'Keep to the extreme left and pass as fast as possible 		', 'Slow down and proceed with caution.', '3', 19, 'Slow down and proceed with caution.'),
(457, 'How many passengers are allowed to be carried in a vehicle being driven by a learner driver?		', NULL, 0, 'Two 		', ' The instructor and one other 		', 'No passengers', '3', 19, 'No passengers'),
(458, 'What should be remembered when approaching a pedestrian crossing?		', NULL, 0, 'Maintain constant speed 		', 'Pay special attention to pedestrians 		', 'Increase speed', '2', 19, 'Pay special attention to pedestrians 		'),
(459, 'At the age of 17 years a person can drive motor vehicles classes of		', NULL, 0, '	Heavy vehicles 		', 'Light motor vehicles 		', 'Agricultural tractors', '2', 19, 'Light motor vehicles 		'),
(460, 'At night, in well lit areas, drivers should drive with		', NULL, 0, 'Headlamps on high beam 		', 'Spot lights on 		', 'Headlamps on low beam', '3', 19, 'Headlamps on low beam'),
(461, 'At an uncontrolled intersection which car should go first bear in mind at an uncontrolled intersection	', 'assets/20230810072746610_390507_BB4.jpeg', 0, 'Car B 		', 'Car C 		', 'Car A', '1', 20, 'Car B 		'),
(462, 'An accident has just happened, you being the first at the scene, what are you expected to do?		', NULL, 0, 'Render first aid and drive away 		', 'Render first aid and report to the nearest police 		', 'Observe from afar and phone the roads department.', '2', 19, 'Render first aid and report to the nearest police 		'),
(463, 'Which of the following vehicles is not subject to carrying a fire extinguisher?		', NULL, 0, 'A motor vehicle which is not yet registered 		', 'A public service vehicle which is not carrying passengers 		', 'A motor cycle', '3', 20, 'A motor cycle'),
(464, 'A motor vehicle towing two trailers should carry		', NULL, 0, '6 breakdown triangles 		', '3 breakdown triangles 		', '2 breakdown triangles', '1', 20, '6 breakdown triangles 		'),
(465, 'When stopping a motor vehicle on a road except in traffic, where will you stop?		', NULL, 0, 'On the extreme right of the road 		', 'Stop in the middle if it is safe to do so 		', 'On the extreme left of the road or in an authorized parking place', '3', 19, 'On the extreme left of the road or in an authorized parking place'),
(466, 'Breakdown triangles should be placed within		', NULL, 0, '20 - 45 meters from the nearest point of the breakdown vehicle 		', '30 - 50 meters from the nearest point of the breakdown vehicle 		', '25 - 60 meters from the nearest point of the breakdown vehicle', '2', 20, '30 - 50 meters from the nearest point of the breakdown vehicle 		'),
(467, 'To drive a motor omnibus you must have reached the age of		', NULL, 0, 'Eighteen years. 		', 'Twenty years and medically fit 	', '	Twenty- five years', '3', 20, '	Twenty- five years'),
(468, 'When following a heavy box body goods vehicle, avoid following closely so as.		', NULL, 0, 'To avoid thrown litter 		', 'To be seen by crossing animals 		', 'To allow safe overtaking and to be visible', '3', 19, 'To allow safe overtaking and to be visible'),
(469, '...to move forward from behind a parked vehicle?		', NULL, 0, 'Apply signal 		', 'Use all the mirrors, exercise caution and drive off. 		', 'Just check your blind spot', '2', 19, 'Use all the mirrors, exercise caution and drive off. 		'),
(470, 'Which car moves first at this intersection?	  	', 'assets/20230711073741076_380038_p2.48.PNG', 0, 'Car A 		', 'Car C 		', 'Car B', '3', 20, 'Car B'),
(471, 'When you are temporarily parked by the side of the road at night, you are to leave		', NULL, 0, 'Your headlights on bright beam 		', 'Your tail lights and side lights on. 		', 'Your headlamps on low beam', '2', 21, 'Your tail lights and side lights on. 		'),
(472, 'At this sign	  	', 'assets/20230711073841099_165977_p2.49.PNG', 0, 'Previous speed is cancelled 		', 'Stopping is prohibited 		', 'Speeding is restricted', '2', 20, 'Stopping is prohibited 		'),
(473, 'When approaching an animal drawn vehicle	', NULL, 0, 'You blow your horn and pass quickly 	', 'You flash your headlamps 		', 'You slow down and pass through the safer side', '3', 21, 'You slow down and pass through the safer side'),
(474, 'When travelling at 75 km/h I must leave a gap of		', NULL, 0, 'Four vehicle lengths.', 'Seven vehicle lengths ', 'Five vehicle lengths', '3', 20, 'Five vehicle lengths'),
(475, 'You may overtake		', NULL, 0, 'On a blind rise. 		', 'When there is a continuous white line 		', 'When there are two or more lanes going in the same direction', '3', 21, 'When there are two or more lanes going in the same direction'),
(476, 'Which car stops?	  	', 'assets/20230711074125371_637909_p2.50.PNG', 0, 'Car C 		', 'Car A 		', 'Car B', '2', 20, 'Car A 		'),
(477, 'You may drive without a safety belt		', NULL, 0, 'When you are driving slowly 		', 'When reversing 		', 'When you are driving very fast', '2', 21, 'When reversing 		'),
(478, 'Which of the following vehicles does not need reverse gears?		', NULL, 0, 'A tractor towing two trailers 		', 'A motor cycle 		', 'A combine harvester in a field', '2', 20, 'A motor cycle 		'),
(479, 'Which car is breaking the law?	  	', 'assets/20230711074620552_66227_p2.51.PNG', 0, 'Car A 		', 'Car C 		', 'Car B', '3', 20, 'Car B'),
(480, 'The sign indicates:	   	', 'assets/20230711075022495_666225_PNG 24.PNG', 0, 'Rainy weather ahead 		', 'Rainy area ahead 		', 'Reduced visibility in the road ahead', '3', 21, 'Reduced visibility in the road ahead'),
(481, 'Into which grouping of road signs does this sign fall?	  	', 'assets/20230711074806615_436908_p2.52.PNG', 0, 'A location sign 		', 'A direction sign 		', '3 way road sign', '2', 20, 'A direction sign 		'),
(482, 'This road sign	  	', 'assets/20230711074914102_413299_p2.53.PNG', 0, 'Is for warning 		', 'Is for information 		', 'Has a regulatory effect', '2', 20, 'Is for information 		'),
(483, 'When facing a red robot with an illuminated straight ahead Green arrow, I may:		', NULL, 0, 'Proceed straight ahead 		', 'Turn right should I wish 		', 'Not proceed', '1', 21, 'Proceed straight ahead 		'),
(484, 'We use heavy gears when		', NULL, 0, 'Going uphill	', 'In muddy area only	 		', 'Starting from rest only	', '1', 21, 'Going uphill	'),
(485, 'If involved in a serious accident I must		', NULL, 0, 'Report to hospital within the next 24 hours 		', 'Report to police within 48 hours', 'Report to police as soon as possible, or within 24 hours.', '3', 20, 'Report to police as soon as possible, or within 24 hours.'),
(486, 'Which is not true if we need to save on fuel?		', NULL, 0, 'Avoid heavy gears 		', 'Avoid very high speeds 		', 'Gears and speed have nothing to do with fuel consumption', '3', 21, 'Gears and speed have nothing to do with fuel consumption'),
(487, 'what is the age restriction for one to drive a 12 tonne Car', NULL, 0, '18', '16', '25', '1', 21, '18'),
(488, 'This sign indicates	  	', 'assets/20230711075415637_282059_p2.54.PNG', 0, 'Height restriction 		', 'Weight restriction 		', 'Speed restriction', '2', 20, 'Weight restriction 		'),
(489, 'Seeing this sign, I would	  	', 'assets/20230711075517820_869965_p2.55.PNG', 0, 'Increase my speed if there is no congestion 		', 'Reduce speed 		', 'Park my car because the ground is wet', '2', 20, 'Reduce speed 		'),
(490, 'How many classes of driver\'s licences do we have in Zimbabwe?		', NULL, 0, 'Five 		', 'Four 		', 'Six', '1', 20, 'Five 		'),
(491, 'When driving at 120km/h your total stopping distance is?		', NULL, 0, '80 meters 		', '100 meters 		', '130 meters', '3', 20, '130 meters'),
(492, 'The reaction distance at 60km/h is?		', NULL, 0, '12.4 meters 		', '5.6 meters 		', '8.3 meters', '3', 20, '8.3 meters'),
(493, 'How many beer drinks should one consume before driving?		', NULL, 0, 'One 		', 'Two', 'Never', '3', 22, 'Never'),
(494, 'What do you do on hearing an ambulance approaching sounding special warning device?		', NULL, 0, 'Move as fast as possible 		', 'Move out of its course and stop 		', 'Move slowly on the left side', '2', 22, 'Move out of its course and stop 		'),
(495, 'What time should persons driving on the road switch on their headlights?		', NULL, 0, 'Between 5:30pm and 6:30am 		', 'Between 5:30am and 6:30pm 		', 'Any convenient time', '1', 22, 'Between 5:30pm and 6:30am 		'),
(496, 'A pedal cyclist is allowed to carry a maximum weight of?		', NULL, 0, '90kg 		', '40kg 		', '25kg', '2', 22, '40kg 		'),
(497, 'When you are driving and feel sleepy, what must you do?		', NULL, 0, 'Maintain a slow speed 		', 'Move off the road and rest 		', 'Maintain a high speed', '2', 22, 'Move off the road and rest 		'),
(498, 'At what speed must you approach a cross road, corner, bridge, sharp turn or steep descent?		', NULL, 0, '40km/h 		', '60km/h 		', 'Safe speed', '3', 22, 'Safe speed');
INSERT INTO `questions` (`id`, `question_text`, `img_insert`, `option_image`, `option_a`, `option_b`, `option_c`, `correct_option`, `exam_id`, `answer`) VALUES
(499, 'This sign indicates	  	', 'assets/20230711080553920_515645_p2.56.PNG', 0, 'Road narrows centrally 		', 'Road narrows to the right 		', 'Road narrows to the left', '3', 22, 'Road narrows to the left'),
(500, 'This sign warns of	  	', 'assets/20230711080711287_647745_p2.57.PNG', 0, 'Side road ahead 		', 'Narrow bridge ahead 		', 'A grid ahead', '2', 22, 'Narrow bridge ahead 		'),
(501, 'The maximum speed limit of heavy vehicles towing two trailers on wide tarred road is?		', NULL, 0, '80km/h 		', '40km/h 	', '120km/h', '1', 22, '80km/h 		'),
(502, 'Your steering wheel must not have more than  	of free play?		', NULL, 0, '90 degrees 		', '30 degrees 		', '45 degrees', '3', 22, '45 degrees'),
(503, 'Heavy vehicles should have the following reflectors		', NULL, 0, 'White in front and red at the rear 		', 'White in front and amber at the rear 		', 'White in front and red and yellow chevron pattern at the rear', '3', 22, 'White in front and red and yellow chevron pattern at the rear'),
(504, 'This sign means	  	', 'assets/20230711082003658_179492_p2.58.PNG', 0, 'Give way to cyclists 		', 'Cyclists to yield right of way 		', 'Danger of cyclists ahead', '3', 22, 'Danger of cyclists ahead'),
(505, 'Which car goes first?	  	', 'assets/20230711082119618_477021_p2.59.PNG', 0, 'Car B 		', 'Car A 		', 'Car C', '2', 22, 'Car A 		'),
(506, 'Which car goes last?	  	', 'assets/20230807052502090_738834_aa14.PNG', 0, 'Car C', 'Car B ', 'Car A', '3', 22, 'Car A'),
(507, 'Which car has right of way?	  	', 'assets/20230711082802807_623792_p2.61.PNG', 0, 'Car B 		', 'Car A 		', 'Car C', '1', 22, 'Car B 		'),
(508, 'This traffic light regulates that	  	', 'assets/20230711082929062_873603_p2.62.PNG', 0, 'Traffic turning to the right may filter if the road is clear 		', 'Traffic turning to the left may filter if the road is clear 		', 'Traffic going straight may proceed if road is clear', '2', 22, 'Traffic turning to the left may filter if the road is clear 		'),
(509, 'Which statement is true about double prohibition lines?	  	', 'assets/20230711083038534_350043_p2.63.PNG', 0, 'Can only be crossed if necessary 		', 'These lines may be crossed if the vehicle in front of you is moving slowly 		', 'Overtaking on this portion of the road is prohibited', '3', 22, 'Overtaking on this portion of the road is prohibited'),
(510, 'Which car must be given right of way	', 'assets/20230810175721635_551340_bb18.jpeg', 0, 'Car B', 'Car A', 'Car B if its turning to the left only', '2', 22, 'Car A'),
(511, 'What is the maximum speed limit on wide tar roads?		', NULL, 0, 'There is no maximum speed limit 		', '100km/h 		', '120km/h', '3', 22, '120km/h'),
(512, 'Which car stops?	  	', 'assets/20230711083719035_818742_p2.65.PNG', 0, 'Car A', 'Car B', '	Either of the two 	', '2', 22, 'Car B'),
(513, 'What is the general speed limit in an urban area?		', NULL, 0, '40km/h 		', '80km/h 		', '60km/h', '3', 22, '60km/h'),
(514, 'This sign regulates that	  	', 'assets/20230711083959154_405053_p2.66.PNG', 0, 'An about turn is prohibited 		', 'A right turn strictly prohibited 		', 'Previous U-turn permission cancelled', '1', 22, 'An about turn is prohibited 		'),
(515, 'Which car has right of way?	  	', 'assets/20230711084114665_411135_p2.67.PNG', 0, 'Car A 		', 'Car B 		', 'Either A or B as long as it is safe to do so', '2', 22, 'Car B 		'),
(516, 'What is the meaning of this sign?	  	', 'assets/20230812134703184_887473_BB20.jpeg', 0, 'iTS A DANGER WARNING SIGNS', 'ITS IN TRAFFIC LIGHTS SIGNS', 'ITS IN REGULAR SIGNS', '2', 22, 'ITS IN TRAFFIC LIGHTS SIGNS'),
(517, 'This sign warns of	  	', 'assets/20230711084541688_730741_p2.69.PNG', 0, 'Children on road ahead 		', 'Road works ahead 		', 'Pedestrian crossing ahead', '2', 22, 'Road works ahead 		'),
(518, 'Vehicle pre-driving checks include		', NULL, 0, 'Checking rear view mirrors are properly adjusted 		', 'Checking underneath and around the vehicle for animals and children 		', 'Making sure we have carried the registration book', '2', 21, 'Checking underneath and around the vehicle for animals and children 		'),
(519, 'At this sign l', 'assets/20230810172734271_726713_bb17.PNG', 0, 'Vehicles should give precedence to all cross traffic', 'Vehicles should give precedence to traffic oncomming from the road from the right', 'Vehicles should give precedence to traffic coming from the left', '1', 21, 'Vehicles should give precedence to all cross traffic'),
(520, 'When stopping a motor vehicle on a road except in traffic, where will you stop?		', NULL, 0, 'On the extreme right of the road 		', 'On the extreme left of the road or in an authorized parking place 		', 'Stop in the middle if it is safe to do so', '2', 23, 'On the extreme left of the road or in an authorized parking place 		'),
(521, 'At what age are cyclists not allowed to carry passengers?		', NULL, 0, '50 years 		', 'Over 18 years 		', 'Under 16 years', '3', 23, 'Under 16 years'),
(522, 'What must be avoided when raining?		', NULL, 0, 'Driving at high speed 		', 'Reducing speed 		', 'Switching on wipers', '1', 21, 'Driving at high speed 		'),
(523, 'In which circumstances would I proceed against a red robot?		', NULL, 0, 'When there is no approaching traffic 		', 'When the road is clear on the right 		', 'When the green arrow is illuminated', '3', 21, 'When the green arrow is illuminated'),
(524, 'A broken yellow line on the left hand side of the road indicates:			', NULL, 0, 'It may be straddled to overtake traffic which is turning right	', 'It may be straddled to overtake cyclists	   		', 'It may not be straddled', '1', 21, 'It may be straddled to overtake traffic which is turning right	'),
(525, 'A motor vehicle may tow		', NULL, 0, 'Any number of trailers 		', 'A vehicle of any size if it is able 		', 'A vehicle only if it has good brakes', '3', 21, 'A vehicle only if it has good brakes'),
(526, 'Who is required to wear a crash helmet?		', NULL, 0, 'Cyclists only 		', 'Motor cyclists only 		', 'Both of the above', '2', 23, 'Motor cyclists only 		'),
(527, 'Which must give right of way ', 'assets/20230812133728955_168898_bb19.PNG', 0, 'CAR C	', 'CAR B', 'CAR A', '1', 21, 'CAR C	'),
(528, 'Which car stops?	  	', 'assets/20230711090639441_394183_PNG 26.PNG', 0, 'Car A 		', 'Car B 		', 'Car C', '1', 21, 'Car A 		'),
(529, 'This means 	', 'assets/20230807051503972_162885_aa16.PNG', 0, 'Give right of way to motor cyclist	', 'Motor cyclist without a pavilion seat prohibited', 'Motor cyclist prohibited', '3', 21, 'Motor cyclist prohibited'),
(530, 'Which car goes last?	  	', 'assets/20230711092455000_43066_PNG 28.PNG', 0, 'Car C 		', 'Car B 		', 'Car A', '2', 21, 'Car B 		'),
(531, 'A clutch is used to:		', NULL, 0, 'Increase vehicle speed 		', 'Decrease vehicle speed 		', 'Avoid noise when gear changing.', '3', 21, 'Avoid noise when gear changing.'),
(532, 'Diverging lanes means	', NULL, 0, 'Two lanes becoming one 		', 'One lane becoming two 		', 'A road off a roundabout', '2', 21, 'One lane becoming two 		'),
(533, 'Hazard perception means		', NULL, 0, 'Following directions of police officers 		', 'Obeying traffic signals 	', 'Reading a traffic situation in advance', '3', 21, 'Reading a traffic situation in advance'),
(534, 'When you see a rabbit crossing the road in the rural areas, you:		', NULL, 0, 'Increase speed to run it over 		', 'Reduce speed and stop when necessary 		', 'Flash your headlamps and hoot', '2', 21, 'Reduce speed and stop when necessary 		'),
(535, 'A weight restriction is usually associated with		', NULL, 0, 'Bridges capacity on weight 		', 'Wet roads capacity on speed 		', 'Strip roads', '1', 21, 'Bridges capacity on weight 		'),
(536, 'A blind spot on a road is a part of the road		', NULL, 0, 'Directly in front of where the vehicle is moving towards 		', 'Not covered by rear view mirror 		', 'Where visibility is poor due to mist', '2', 21, 'Not covered by rear view mirror 		'),
(537, 'Which statement is not true?		', NULL, 0, 'All road tests in Zimbabwe are strictly with manual vehicle 		', 'Heavy vehicles must have a net mass of 5000kg and above for road test purpose', 'Dual footbrake pedals may be required for driving school vehicles', '1', 24, 'All road tests in Zimbabwe are strictly with manual vehicle 		'),
(538, '	When approaching a give way sign:		', 'assets/20230812135502231_603124_bb17.PNG', 0, 'I am obliged to stop before proceeding	 			   		', 'I am obliged to give way to traffic approaching the intersection on my right only	', 'I may proceed with caution and without stopping provided there is no other approaching traffic', '3', 24, 'I may proceed with caution and without stopping provided there is no other approaching traffic'),
(539, 'Which statement is true?		', NULL, 0, 'Pedestrians enjoy right of way only at a pedestrian crossing 		', 'A person pushing a wheelbarrow is a motorist 		', 'All motorists must be courteous to the old, disabled and children when using the roads', '1', 24, 'Pedestrians enjoy right of way only at a pedestrian crossing 		'),
(540, 'In rural areas where traffic is not controlled, I should give precedence to:		', NULL, 0, 'Traffic approaching from the road on the left', ' Traffic approaching from the road on the right 		', 'Traffic already in the intersection regardless of which side it is coming from.', '3', 24, 'Traffic already in the intersection regardless of which side it is coming from.'),
(541, 'During rainy weather		', NULL, 0, 'Make sure a vehicle is fitted with good tyres 		', 'Good hand brake is important 		', 'Internal lights need to be functioning properly', '1', 24, 'Make sure a vehicle is fitted with good tyres 		'),
(542, 'When approaching a narrow bridge, I must pay attention to:		', NULL, 0, 'Height restriction 		', 'Length restriction 		', 'Width restriction', '3', 24, 'Width restriction'),
(543, 'Whilst driving when do you take a mobile phone call?		', NULL, 0, 'Once you have stopped in a legally permitted place 		', 'Whilst travelling in rural areas which do not have much traffic 		', 'If you are confident that your ability will not be compromised by the distraction', '1', 24, 'Once you have stopped in a legally permitted place 		'),
(544, 'Which car stops?	  	', 'assets/20230807061826533_599004_aa17.PNG', 0, 'Car B	', 'Car C', 'Car A	', '2', 24, 'Car C'),
(545, 'Which car is breaking the law if both are moving?	  	', 'assets/20230711095001065_958363_PNG 30.PNG', 0, 'Car B 		', 'Car C 		', 'Both cars', '2', 24, 'Car C 		'),
(546, 'A car sun visor provides a shield against		', NULL, 0, 'Sun glare 		', 'Street lights 		', 'Rain', '1', 24, 'Sun glare 		'),
(547, 'THIS SIGN MEANS', 'assets/20230807062021761_106015_aa9.PNG', 0, 'DANGER OF A VARIABLE NATURE', 'DANGER ZONE	', 'NO TRAFFIC SIGN LIKE THIS IN MY COUNTRY', '1', 24, 'DANGER OF A VARIABLE NATURE'),
(548, 'When in a straight ahead lane at an intersection I am not allowed to:		', NULL, 0, 'Turn without indicating 		', 'Turn at all 		', 'Turn without checking blind spots 	', '2', 24, 'Turn at all 		'),
(549, 'On approaching a narrow bridge I am allowed to		', NULL, 0, 'Flash my lights even for oncoming vehicles 		', 'Overtake slow moving vehicles 		', 'Slow down and proceed with caution.', '3', 24, 'Slow down and proceed with caution.'),
(550, 'A speed restriction sign means:		', NULL, 0, 'Do not exceed the stated speed	   		', 'Drive below the stated speed	 		', 'Watch out for the police	', '1', 24, 'Do not exceed the stated speed	   		'),
(551, 'When I intend to stop on the road I must:		', NULL, 0, 'Check blind spots and brake hard 		', 'Flash my hazard lights 		', 'Slow down, check the rear view mirror, pull off the road and stop', '3', 24, 'Slow down, check the rear view mirror, pull off the road and stop'),
(552, 'The insignia of a detour ahead warning sign is inside a		', NULL, 0, 'A rectangle 		', 'A triangle 		', 'A circle', '2', 23, 'A triangle 		'),
(553, 'At a rail level crossing with open booms a heavy vehicle driver should		', NULL, 0, 'Quickly cross the railway 				', 'Stop, look both sides and cross when safe 			', 'Stop and look to the right', '2', 24, 'Stop, look both sides and cross when safe 			'),
(554, 'Passengers disembarking from a bus should:		', NULL, 0, 'Wait until the bus takes off and then cross the road 		', 'Cross the road from rear or front of the bus 		', 'Cross from whichever side is safe', '1', 23, 'Wait until the bus takes off and then cross the road 		'),
(555, 'When approaching a flooded bridge what do you do?		', NULL, 0, 'You can cross only when driving a heavy vehicle 		', 'Do not attempt to cross 		', 'Engage low gear and proceed slowly', '2', 23, 'Do not attempt to cross 		'),
(556, 'Which car goes first?	  	', 'assets/20230711100238783_490209_p2.70.PNG', 0, 'Car A 		', 'Car C 	', '	Car B', '3', 23, '	Car B'),
(557, 'The purpose of the parking brake is to		', NULL, 0, 'Keep the vehicle stationary 		', 'Keep the vehicle stationary on a gradient only 		', 'Slow the vehicle down', '1', 24, 'Keep the vehicle stationary 		'),
(558, 'At a pedestrian crossing every driver must		', NULL, 0, 'Wave the pedestrians through 		', 'Hoot when it is his turn to go 		', 'Wait patiently and proceed when appropriate', '3', 24, 'Wait patiently and proceed when appropriate'),
(559, 'What is the meaning of this sign?	  	', 'assets/20230807074330044_820841_AA6.PNG', 0, 'Stadium ahead', 'Warning presence of athletes', ' Soccer match', '1', 23, 'Stadium ahead'),
(560, 'Fog lights are to be used		', NULL, 0, 'In dusty areas only 		', 'In heavy mist 		', 'At night', '2', 24, 'In heavy mist 		'),
(561, 'A \'one way\' sign is a		', NULL, 0, 'Warning sign	 		', 'Danger sign	   			', 'Command sign	', '3', 24, 'Command sign	'),
(562, 'In an urban area, which car has the right of way?	  	', 'assets/20230711100922756_272929_p2.72.PNG', 0, 'Car A 		', 'Car B 		', 'The one which enters the intersection first', '2', 23, 'Car B 		'),
(563, 'All vehicles shall have		', NULL, 0, 'Red reflectors in front 		', 'White reflectors in front 		', 'Either red or white reflectors in front', '2', 24, 'White reflectors in front 		'),
(564, 'A vehicle turning right should		', NULL, 0, 'Give way to window shopping pedestrians 		', 'Give way to oncoming traffic 		', 'Give way to pedestrians standing on the pavement.', '2', 24, 'Give way to oncoming traffic 		'),
(565, 'Which is a possible sequence of a robot?		', NULL, 0, 'Green, Red, filter arrow 		', 'Red, filter arrow, Green, Amber 		', 'Amber, Green, Red , filter arrow', '2', 23, 'Red, filter arrow, Green, Amber 		'),
(566, 'This sign regulates that:	  	', 'assets/20230711102316579_923192_p2.73.PNG', 0, 'Vehicles should give right of way to cyclists 		', 'Cyclists should stop and give way to cross traffic 		', 'Stop and give way to cyclists from the right', '2', 23, 'Cyclists should stop and give way to cross traffic 		'),
(567, 'This sign regulates that:	  	', 'assets/20230711102516014_135105_p2.74.PNG', 0, 'Give right of way to motor cyclist 		', 'Motor cyclist prohibited 		', 'Motor cycles without a pillion seat prohibited', '2', 23, 'Motor cyclist prohibited 		'),
(568, 'The sign warns of:	  	', 'assets/20230711102818269_313459_p2.75.PNG', 0, 'Presence of wild animals crossing 		', 'Stray domestic animals crossing 		', 'All kinds of animals crossing', '1', 23, 'Presence of wild animals crossing 		'),
(569, 'What is the legal maximum speed on a Zimbabwean highway?		', NULL, 0, '120km/h for all vehicles that are light/heavy and  then heavy should mainly be 80km/hr', 'Between 80 and 120 km/h on all roads. 		', '120km/h for light vehicles and 80km/h for heavy vehicles', '3', 24, '120km/h for light vehicles and 80km/h for heavy vehicles'),
(570, 'The sign warns of:	  	', 'assets/20230807075710845_206222_AA3.PNG', 0, 'Presence of people crossing the road ahead 		', 'Presence of friends crossing ahead', 'Presence of children ahead', '3', 23, 'Presence of children ahead'),
(571, 'In a traffic circle, I shall indicate		', NULL, 0, 'When going out 		', 'When going in 		', 'When making a \'U\' turn', '1', 24, 'When going out 		'),
(572, 'A driving school vehicle must have the following documents:		', NULL, 0, '\'L-plates\' and driving instructor certificate 		', 'Certificate of fitness and comprehensive vehicle insurance 		', 'Dual brakes and vehicle licence.', '1', 23, '\'L-plates\' and driving instructor certificate 		'),
(573, 'When driving a motor vehicle at 06.00am the vehicle must have its headlights lit.		', NULL, 0, 'Yes 		', 'No 		', 'Depends on day light', '1', 24, 'Yes 		'),
(574, 'When approaching this sign I would:	  	', 'assets/20230711103635361_65031_p2.77.PNG', 0, 'Be expected to check my vehicle 		', 'Slow down and expect to be stopped 		', 'Expect to see road works ahead', '2', 23, 'Slow down and expect to be stopped 		'),
(575, 'This sign warns us of:	  	', 'assets/20230711103747297_815636_p2.78.PNG', 0, 'Rail level crossing ahead 		', 'Physical barrier ahead 		', 'A grid ahead', '2', 23, 'Physical barrier ahead 		'),
(576, 'This sign is a:	  	', 'assets/20230711104038952_624209_p2.79.PNG', 0, 'Danger warning sign. 		', 'A regulatory sign 		', 'An informative sign', '1', 23, 'Danger warning sign. 		'),
(577, 'When parked on such an incline:	  	', 'assets/20230711104404222_477057_p2.80.PNG', 0, 'Engage lower gear, apply handbrake 		', 'Engage reverse, apply handbrake 		', 'Engage high gear and turn steering wheel torwards the curb', '1', 23, 'Engage lower gear, apply handbrake 		'),
(578, 'The lane you are travelling in suddenly end, in the setup below	  	', 'assets/20230711104525559_306318_p2.81.PNG', 0, 'Road has been temporarily narrowed to the left 		', 'Road has been temporarily narrowed to the right 		', 'Road has been temporarily narrowed to the centre', '3', 23, 'Road has been temporarily narrowed to the centre'),
(579, 'At this sign I should:	  	', 'assets/20230711104742077_485961_p2.82.PNG', 0, 'Slow down and proceed if there is no traffic 		', 'Slow down and give way to cross traffic 		', 'Stop and proceed when the road is clear on both sides.', '2', 23, 'Slow down and give way to cross traffic 		'),
(580, 'The sign warns of:	  	', 'assets/20230711104901029_835386_p2.83.PNG', 0, 'Cross road ahead 		', 'Give way sign or stop sign ahead 		', 'Rail and level crossing ahead.', '2', 23, 'Give way sign or stop sign ahead 		'),
(581, 'A vehicle should be fitted with efficient reflectors of what colour?		', NULL, 0, 'White at the front and red at the back 		', 'Amber at the front and red at the back 		', 'White at the front and amber at the back', '1', 23, 'White at the front and red at the back 		'),
(582, 'Which car moves second at this intersection?	  	', 'assets/20230711105140964_244169_p2.84.PNG', 0, 'Car A 		', 'Car B 		', 'Car C', '1', 23, 'Car A 		'),
(583, 'Warning reflective \'T\' plate signs are fitted on a		', NULL, 0, 'Towed trailer 		', 'Towed broken down motor vehicle 		', 'Drawing motor vehicle', '1', 23, 'Towed trailer 		'),
(584, 'This sign means	  	', 'assets/20230711115725609_90543_p2.85.PNG', 0, 'Bridge ahead 		', 'Dual carriage free way begins here 		', 'The road narrows ahead', '2', 26, 'Dual carriage free way begins here 		'),
(585, 'This sign is a:	  	', 'assets/20230711115903191_307485_p2.87.PNG', 0, 'Sign of hard road ahead narrowing 		', 'Flyover bridge ahead', 'Sign that a single carriageway freeway begins here', '3', 26, 'Sign that a single carriageway freeway begins here'),
(586, 'This sign warns us of:	   	', 'assets/20230711120124792_744956_p2.86.PNG', 0, 'Rail level crossing ahead 		', 'Traffic light presence ahead 		', 'Malfunctioning traffic light ahead', '2', 26, 'Traffic light presence ahead 		'),
(587, 'Which car is NOT breaking the law assuming all vehicles are moving?	  	', 'assets/20230711120236774_198289_p2.88.PNG', 0, 'Car A 		', 'Car C 		', 'Car B', '1', 26, 'Car A 		'),
(588, 'What does this sign warn of?	  	', 'assets/20230711120400909_757825_p2.89.PNG', 0, 'Bad tarred road ahead 		', 'Road markings faded in the road ahead 		', 'Tarred road about to end and gravel road ahead', '3', 26, 'Tarred road about to end and gravel road ahead'),
(589, 'When travelling in a bus:		', NULL, 0, 'You can dispose your litter through the window 		', 'Dispose your litter under the seats 		', 'Hold on to your litter until you can dispose of it properly.', '3', 26, 'Hold on to your litter until you can dispose of it properly.'),
(590, 'When stopping a motor vehicle on a road except in traffic, where will you stop?		', NULL, 0, 'On the extreme right of the road 		', 'Stop in the middle if it is safe to do so 		', 'On the extreme left of the road or in an authorized parking place', '3', 26, 'On the extreme left of the road or in an authorized parking place'),
(591, 'This sign warns of:	  	', 'assets/20230807143636941_969809_aa16.PNG', 0, 'Motor bikes not allowed', 'Motor cycles without foot rest not allowed', 'Motorists to give way to motor bikes', '1', 26, 'Motor bikes not allowed'),
(592, 'Who is exempted from wearing a seat belt?		', NULL, 0, 'Learner driver 		', 'Driving instructor 		', 'Ambulance driver during the course of work', '2', 26, 'Driving instructor 		'),
(593, 'Which car goes first?	  	', 'assets/20230711121034346_75337_p2.91.PNG', 0, 'Car A 		', 'Car B 		', 'Car C', '1', 26, 'Car A 		'),
(594, 'Which car goes last', 'assets/20230812143435879_799649_BB21.PNG', 0, 'Car B	', 'CAR C	', 'CAR A AND B', '2', 26, 'CAR C	'),
(595, 'Which statement is appropriate?		', NULL, 0, 'I may not wear a seatbelt where a vehicle has air bags 		', 'I should pull down the sun visor when dazzled by headlights 		', 'There is road signage to warn of possibility of congestion', '2', 26, 'I should pull down the sun visor when dazzled by headlights 		'),
(596, 'In an urban area, which car has NO right of way?	  	', 'assets/20230711121429929_137944_p2.93.PNG', 0, 'Car A 		', 'The one which enters the intersection first 		', 'Car B', '1', 26, 'Car A 		'),
(597, 'Which statement is true?		', NULL, 0, 'We have speed limit for gravel roads ', 'We have a clear legal driver\'s licence class for pedal cyclists. 		', 'Steering backlash not to exceed 45% of steering wheel movement', '2', 26, 'We have a clear legal driver\'s licence class for pedal cyclists. 		'),
(598, 'Which car moves FIRST at this intersection?	  	', 'assets/20230711121735639_416255_p2.94.PNG', 0, 'Car A 		', 'Car C 		', 'Car B', '3', 26, 'Car B'),
(599, 'Which statement is not appropriate?		', NULL, 0, 'Motor cycles are exempted from being fitted with a rearview mirror 		', 'All motor vehicles must be fitted with rear view mirror(s) 		', 'Sun visors are mandatory for all motor vehicles', '1', 26, 'Motor cycles are exempted from being fitted with a rearview mirror 		'),
(600, 'This sign regulates that:	  	', 'assets/20230711121944078_167282_p2.95.PNG', 0, 'No stopping 		', 'Hitch hiking allowed 		', 'Hitch hiking prohibited', '3', 26, 'Hitch hiking prohibited'),
(601, 'The sign warns of:	  	', 'assets/20230711122057206_482764_p2.96.PNG', 0, 'Width restriction warning 		', 'Width restriction of 15m 		', 'Warns of length restriction of 15m', '3', 26, 'Warns of length restriction of 15m'),
(602, 'This sign is:	  	', 'assets/20230711122257301_618476_p2.97.PNG', 0, 'Seat reserved for disabled 		', 'Lane reserved for disabled 		', 'Parking for vehicles of disabled', '3', 26, 'Parking for vehicles of disabled'),
(603, 'Holding a class 4 & 5 driver\'s licence means I am qualified to drive:		', NULL, 0, 'Agricultural tractor and small car 		', 'Small car and coupe imp 		', 'Small car and vintage vehicles', '1', 26, 'Agricultural tractor and small car 		'),
(604, 'This sign indicates that:	  	', 'assets/20230711122553380_715452_p2.98.PNG', 0, 'Buses may reverse', 'Lane reserved for buses', ' Buses keep right', '2', 26, 'Lane reserved for buses'),
(605, 'Which statement is true with regard to overtaking?		', NULL, 0, 'You must overtake if visibility is bad 		', 'You must not overtake in the face of oncoming traffic 		', 'You are prohibited from overtaking at night', '2', 26, 'You must not overtake in the face of oncoming traffic 		'),
(606, 'This sign regulates that:	  	', 'assets/20230711122846411_392313_p2.99.PNG', 0, 'Cutting corners prohibited 		', 'Left turn not allowed 		', 'Sharp curve no longer applies', '2', 26, 'Left turn not allowed 		'),
(607, 'Which rule is not true for pedal cyclists?		', NULL, 0, 'Avoid towing or being towed 		', 'Sit only on the saddle of your cycle 		', 'Never worry about keeping both feet on the pedal', '3', 26, 'Never worry about keeping both feet on the pedal'),
(608, 'Warning reflective T plates sign are fitted on a		', NULL, 0, 'Towed trailer 		', 'Towed broken down motor vehicle 		', 'Drawing motor vehicle', '1', 26, 'Towed trailer 		'),
(609, 'How many passengers is a motor cyclist allowed to carry? ', NULL, 0, '2	', '3', '1', '3', 28, '1'),
(610, 'What do you do when you see an aeroplane in your view mirror? 	', NULL, 0, 'Stop	', ' Reduce speed	', 'Adjust your rear view mirror', '3', 28, 'Adjust your rear view mirror'),
(611, 'At a stop sign I should? ', NULL, 0, 'Reduce speed	', ' Stop	', 'Slow down', '2', 28, ' Stop	'),
(612, 'The correct sequence of a robot is?', NULL, 0, ' Green Red Amber	', 'Green Amber Red	', 'Red Amber Green', '2', 28, 'Green Amber Red	'),
(613, 'A church up ahead sign is in which class?', NULL, 0, 'Danger Warning', ' Informative	', ' Regulatory', '2', 28, ' Informative	'),
(614, 'When driving in a slippery road you should?', NULL, 0, ' Slow down	', 'Stop	', ' Reduce speed and exercise caution', '3', 28, ' Reduce speed and exercise caution'),
(615, 'This diagram means?', 'assets/20230812145210570_350232_bb22.jpg', 0, ' Rail Level crossing', ' Traffic turning', ' You are entering into a town', '1', 27, ' Rail Level crossing'),
(616, 'At a stop sign I must? ', NULL, 0, 'Give way to traffic from my left', ' Give way to traffic from my right ', ' Stop and give way to traffic from both sides', '3', 28, ' Stop and give way to traffic from both sides'),
(617, 'When travelling at 75km/h I must allow a gap between my vehicle and the car in front ', NULL, 0, '4 vehicle from	', ' 6 vehicle length	', '5 vehicle length', '3', 28, '5 vehicle length'),
(618, 'This sign is', 'assets/20230807143807479_302218_aa10.PNG', 0, 'Traffic lights signal for packing', 'You can park here', 'Parking prohibited', '2', 28, 'You can park here'),
(619, 'You dip your lights', NULL, 0, 'When driving in a well lit road ', 'When turning to the left ', 'When entering  a bridge', '1', 27, 'When driving in a well lit road '),
(620, 'When approaching this sign I would ', 'assets/20230713081142523_989945_PNG 29.PNG', 0, 'Be expected to check my vehicle', 'Slow down and expected to be stopped ', 'Expected to see road works ahead', '2', 28, 'Slow down and expected to be stopped '),
(621, 'This sign means', 'assets/20230812145332016_376596_bb23.jpg', 0, 'Danger warning ', 'Narrow bridge ahead ', 'Road narrows both sides', '2', 27, 'Narrow bridge ahead '),
(622, 'At this sign I should ', 'assets/20230807144145781_410999_aa12.PNG', 0, 'Stop and give way to crossing traffic  to the left', 'Slow and proceed when the road is clear on traffic to the right', 'Exercise caution and change direction because of barrier ahead', '3', 28, 'Exercise caution and change direction because of barrier ahead'),
(623, 'Which car moves last at the intersection? ', 'assets/20230713081611669_286344_.PNG 30.PNG', 0, 'Car B 	', 'Car C ', 'Car A', '3', 28, 'Car A'),
(624, 'How far from a corner are you forbidden to park a vehicle?', NULL, 0, ' 7m	', ' 7.5m', '10m', '1', 28, ' 7m	'),
(625, 'To drive public service vehicle you must have reached the age of ', NULL, 0, 'Nineteen	', 'Twenty-five', 'Eighteen  ', '2', 28, 'Twenty-five'),
(626, 'This sign regulates that', 'assets/20230807183735629_691912_aa120.PNG', 0, 'Vehicles should give right of way to cyclists ', 'Stop and give way to cyclists from the right', 'Cyclist should stop and give way to crossing traffic', '3', 28, 'Cyclist should stop and give way to crossing traffic'),
(627, 'What do you consider at this', 'assets/20230807185104182_999507_aa29.PNG', 0, 'cyclists to give way to pedestrains', 'Both cyclists and pedestrains are prohibited beyond this point to give way to cars', 'Both cyclists and pedestrains are prohibited beyond this point', '3', 27, 'Both cyclists and pedestrains are prohibited beyond this point'),
(628, 'Before driving a motor vehicle on public road it must have the following document	', NULL, 0, 'A certificate of fattiness, license and route', 'A registration book, insurance and vehicle license', 'A driver’s license and registration book', '2', 28, 'A registration book, insurance and vehicle license'),
(629, 'When oncoming vehicle lights are on bright beam what do you do?', NULL, 0, 'Pull down the sun visor', 'Switch on your lights ', 'Slow down and cast your eyes slightly to the left.', '3', 28, 'Slow down and cast your eyes slightly to the left.'),
(630, 'What are the directions given by a fixed of flashing amber robot at an intersection? ', NULL, 0, 'Give precedence to all crossing traffic', 'Give precedence to vehicles coming from the right', 'Give precedence to vehicles coming from the left', '2', 28, 'Give precedence to vehicles coming from the right'),
(631, '	This sign is A.	 ', 'assets/20230713084056312_889932_PNG 32.PNG', 0, 'An informative', 'A carriage marking', 'regulatory sign', '1', 28, 'An informative'),
(632, 'Which car goes first? ', 'assets/20230713084412723_490603_PNG 33.PNG', 0, 'Car C	', 'Car A ', 'Car B', '1', 28, 'Car C	'),
(633, 'Which sign is this? ', 'assets/20230713084616368_239959_PNG 34.PNG', 0, 'Informative', 'Regulatory', 'Danger', '3', 28, 'Danger'),
(634, 'In which class is this sign under?', 'assets/20230812145408049_651322_bb23.jpg', 0, 'Danger Warning ', 'Narrow bridge', 'Road narrowing from both sides', '1', 27, 'Danger Warning '),
(635, 'Who is the last to go?', 'assets/20230713084625964_518537_p2.102.PNG', 0, ' CarB ', 'CarC ', 'CarA', '1', 27, ' CarB '),
(636, 'Which sign is this? 	', 'assets/20230812144234153_879791_bb14.png', 0, 'Warning Sign of danger', 'Warning Sign of danger ahead of variable nature', 'Robot ahead out of order', '2', 28, 'Warning Sign of danger ahead of variable nature'),
(637, 'At a flash amber light robot means ', NULL, 0, 'Stop', ' Give way to Traffic coming from the right', 'Give way to Traffic coming from the left', '2', 27, ' Give way to Traffic coming from the right'),
(638, 'The sign is a? 	', 'assets/20230807183825614_894259_A27.PNG', 0, 'Danger warning', 'Traffic lights out of order', 'Direction sign', '2', 28, 'Traffic lights out of order'),
(639, 'This sign means ', 'assets/20230713085404368_409325_p2.103.PNG', 0, 'Height restriction ', 'Width restriction', ' None of the above', '1', 27, 'Height restriction '),
(640, 'The road ahead is a ', 'assets/20230713085744759_962407_PNG 37.PNG', 0, 'New give way or stop sign ahead', 'Left Junction road', 'Right side road ahead', '3', 28, 'Right side road ahead'),
(641, 'Which car goes second? ', 'assets/20230713085917986_71041_PNG 38.PNG', 0, 'Car B ', 'Car A', 'Both', '2', 28, 'Car A'),
(642, 'This sign means ', 'assets/20230812145559159_198395_bb24.png', 0, '7.5 tonnes vehicles only ', 'Weight restriction', 'Five kilometers to town', '2', 27, 'Weight restriction'),
(643, 'This sign means ', 'assets/20230812145715026_741316_bb25.gif', 0, 'No road ', 'Previously imposed speed limit is cancelled ', 'No through road', '2', 27, 'Previously imposed speed limit is cancelled '),
(644, 'DDC is valid for how long? ', NULL, 0, ' 12 months', ' 48 months ', '56 months', '2', 29, ' 48 months '),
(645, 'Which class is this sign? ', 'assets/20230713085944661_473538_p2.106.PNG', 0, 'Regulatory ', 'Danger ', 'Informative', '1', 27, 'Regulatory '),
(646, 'What do you do when the oncoming vehicle does not deep its lights? ', NULL, 0, 'Do not deep your lights', 'slow down and do not deep yours', 'slow down and look slightly to the left', '3', 29, 'slow down and look slightly to the left'),
(647, 'Which class is this sign? ', 'assets/20230812145902944_271693_bb26.png', 0, 'Danger ', 'Informative', 'Regulatory', '3', 27, 'Regulatory'),
(648, 'Which is the driving procedure when turning to the right? ', NULL, 0, 'Check mirror, show your intention, slow down, signal, brakes, select suitable gear ', 'Check mirror, select suitable gear, slow down, show intentions and break', 'Check mirror, show intention, brake, slowdown, signal and select suitable gear', '3', 29, 'Check mirror, show intention, brake, slowdown, signal and select suitable gear'),
(649, 'When impaired by the use of alcohol or drugs?', NULL, 0, 'Stay off the road ', 'Drive fast', 'Move slowly', '1', 27, 'Stay off the road '),
(650, 'On which side of the road do you overtake animal drawn wagon? ', NULL, 0, ' On whichever side is safe to do so ', 'To the Left ', 'When there is no side safe to do so use right side', '1', 29, ' On whichever side is safe to do so '),
(651, 'Which car goes first? ', 'assets/20230713090328063_399947_p2.108.PNG', 0, 'CarA ', 'CarB', 'CarC', '1', 27, 'CarA '),
(652, 'What are the colours of reflectors at rear of a vehicle? ', NULL, 0, 'Blue', ' White', 'Red', '3', 29, 'Red'),
(653, 'When driving in rural areas you give way to?', NULL, 0, 'Vehicle moving fast	', 'First at the junction', 'Vehicle flashing indicators', '2', 29, 'First at the junction'),
(654, 'Who is breaking the law? ', 'assets/20230713090527961_978462_p2.108.PNG', 0, 'CarC ', 'CarA', 'CarB', '3', 27, 'CarB'),
(655, 'Who gives way? ', 'assets/20230807185334144_240009_aa30.PNG', 0, 'CarB', 'Car C   and B', 'CarA', '3', 27, 'CarA'),
(656, 'Which are the documents required for one to drive?', NULL, 0, ' Licence, Registration book, insurance', 'Licence, insurance and clearance certificate ', 'licence or learner’s licence', '3', 29, 'licence or learner’s licence'),
(657, 'Which car goes first? ', 'assets/20230713090818058_92481_p1.2.PNG', 0, 'CarC ', 'CarA ', 'CarB', '2', 27, 'CarA '),
(658, 'Certificate of competence if valid for how long?', NULL, 0, ' 1 year', '1/2  year', '11/2 year', '1', 29, ' 1 year'),
(659, 'Which is the correct robot sequence?', NULL, 0, 'Green Amber Red', 'Amber Red Green', 'Red Amber Green', '1', 27, 'Green Amber Red'),
(660, 'In which circumstances may you proceed against a red robot?', NULL, 0, 'When the green arrow is illuminated', 'When there is no approaching traffic ', 'At midnight', '1', 27, 'When the green arrow is illuminated'),
(661, 'When do you indicate at a round about?', NULL, 0, ' When entering a round-about	', ' When you are in the round about', 'When you are going out the round about', '3', 29, 'When you are going out the round about'),
(662, 'Which is the correct light sequence of a robot? ', NULL, 0, ' Red- Amber- Green', 'Amber- Red- Green	', ' Green- Amber- Red', '3', 29, ' Green- Amber- Red'),
(663, 'When  parked at a lay-by you? ', NULL, 0, ' put headlights on	', 'put the brakes on', 'put off the head lights and put on the park lights', '3', 29, 'put off the head lights and put on the park lights'),
(664, 'WHICH CAR IS BREAKING THE LAW', 'assets/20230812152206078_517328_BB21.PNG', 0, 'CAR A AND B', 'CAR A AND C', 'CAR C', '3', 29, 'CAR C'),
(665, 'A broken yellow line on the side of the road indicate ', NULL, 0, 'It may be straddled to overtake traffic which is turning to the right', 'May be straddled overtaking vehicles turning to the left ', 'It may not be straddled', '1', 27, 'It may be straddled to overtake traffic which is turning to the right'),
(666, 'Which car is breaking the law?', 'assets/20230713091831047_388866_p1.3.PNG', 0, 'CarC', 'CarA ', 'CarB', '1', 27, 'CarC'),
(667, 'When are you allowed to overtake? ', NULL, 0, 'When the broken white line is on the right of the solid line ', 'When the broken white line is on the left of the solid line ', 'When entering a sharp cave ', '2', 29, 'When the broken white line is on the left of the solid line '),
(668, 'This sign means', 'assets/20230807185426759_801378_AA28.PNG', 0, 'Stop sign ahead ', 'Give way or stop sign ahead ', 'Give way sign ahead', '1', 27, 'Stop sign ahead '),
(669, 'Which of the following is the correct change down procedure? ', NULL, 0, 'Depress clutch, engage the required gear, release accelerator, clutch and accelerate', 'Release accelerator, depress clutch, engage required gear, release clutch and accelerate or de- accelerate as required', 'none', '2', 29, 'Release accelerator, depress clutch, engage required gear, release clutch and accelerate or de- accelerate as required'),
(670, 'Which class is this sign?', 'assets/20230713092106368_259292_p1.5.PNG', 0, 'Informative ', 'Regulatory ', 'Danger', '1', 27, 'Informative '),
(671, 'When driving at 90km/h you leave a gape of? ', NULL, 0, ' 4 cars', '8 cars', ' 6 cars', '3', 29, ' 6 cars'),
(672, 'Direction arrows used inconjunction with longitudinal prohibition lines indicate that', NULL, 0, 'They are in class A Danger warning signs ', 'They are force of law and they guide your route ', 'They are in class D traffic light signal', '2', 27, 'They are force of law and they guide your route '),
(673, 'You dip your lights? ', NULL, 0, 'When behind other traffic', 'when driving in wet road', 'Any conditions', '1', 29, 'When behind other traffic'),
(674, 'The legal age for one to drive is', NULL, 0, '21years ', '18years ', '16years', '3', 27, '16years'),
(675, 'Which is the correct procedure of starting the engine? ', NULL, 0, 'Check handbrake, depress clutch, check gear in neutral position and turn key on-situation, check dash board and start the engine', 'Check handbrake, check dash board and start the engine, turn key on-situation', 'Check gear in neutral position, depress the clutch', '1', 29, 'Check handbrake, depress clutch, check gear in neutral position and turn key on-situation, check dash board and start the engine'),
(676, 'Which car has the right of way?', 'assets/20230713093627615_55448_p1.6.PNG', 0, 'CarC', 'CarA', 'CarB', '3', 30, 'CarB'),
(677, 'Whats the meaning of this in urban areas', 'assets/20230808180354606_510206_BB1.PNG', 0, 'Traffic lights are ahead of you in good order', 'Traffic lights out of order', 'Traffic lights ', '2', 30, 'Traffic lights out of order'),
(678, 'Which car has the right of way? ', 'assets/20230713094055814_25385_p1.8.PNG', 0, 'CarC ', 'CarA ', 'CarB', '3', 30, 'CarB'),
(679, 'Which car goes first? ', 'assets/20230808180634400_217189_bb2.jpeg', 0, 'CarA ', 'CarB', 'CarC', '3', 30, 'CarC'),
(680, 'Which car is breaking the law? ', 'assets/20230713094405997_64355_p1.10.PNG', 0, 'CarB ', 'CarA ', 'CarC', '2', 30, 'CarA '),
(681, 'This sign indicates', 'assets/20230812153435309_59837_bb25.gif', 0, 'Hospital ahead ', 'Brocken down vehicle ', 'End of speed restriction', '3', 30, 'End of speed restriction'),
(682, 'When going down a hillI should ', 'assets/20230812153541061_121974_bb27.jpg', 0, 'Disengage gears ', 'Engage lower gear', 'Apply handbrake', '2', 30, 'Engage lower gear'),
(683, 'This sign I am', 'assets/20230812153656700_381793_bb28.gif', 0, 'Permited to make a U-turn ', 'Prohibited from making a U-turn ', 'I cannot turn right', '2', 30, 'Prohibited from making a U-turn '),
(684, 'At a bridge you consider ', NULL, 0, 'Height restriction', 'Width restriction', ' Cattle ahead', '2', 30, 'Width restriction'),
(685, 'At this sign I should. ', 'assets/20230812153818910_690557_bb29.png', 0, 'Stop and only proceed when the road is clear both sides ', 'Stop and proceed when the road is clear on the right ', 'Stop and proceed when the road is clear on the left', '1', 30, 'Stop and only proceed when the road is clear both sides '),
(686, 'This sign regulates ', 'assets/20230812153927139_470545_bb30.png', 0, 'I may park my vehicle ', 'I may not park my vehicle ', 'A lay-by ahead', '2', 30, 'I may not park my vehicle '),
(687, 'A heavy vehicle may not tow more than ', NULL, 0, 'One trailer ', 'Two trailers ', 'Three trailers', '3', 30, 'Three trailers'),
(688, 'When carrying a passenger on a motorbike:-', NULL, 0, 'Have head lamps fitted', ' Have petrol tank fitted ', 'Have a pillion and foot rests firmly fitted', '3', 30, 'Have a pillion and foot rests firmly fitted'),
(689, 'When involved in a serious accident  I must ', NULL, 0, 'Report to police after 24 hours', 'Report to the police within 48 hours', 'Report to the police within 24 hours', '3', 30, 'Report to the police within 24 hours'),
(690, 'When driving behind another vehicle at night I should ', NULL, 0, 'Dim my headlamps ', 'Switch on my sidelight', 'Drive slowly', '1', 30, 'Dim my headlamps '),
(691, 'What is blind spot?', NULL, 0, 'The front part of a vehicle', 'The point not seen by the mirror', ' The bottom part of the mirror', '2', 29, 'The point not seen by the mirror'),
(692, 'When should a horn be used? ', NULL, 0, 'To attract  a friend’s attention', 'Only in emergency', 'When cattle are blocking ahead', '2', 30, 'Only in emergency'),
(693, 'When a heavy vehicle has a break down it shows by? ', NULL, 0, 'Red reflective triangle placed 30m - 50m rear and front', 'Red reflective triangle placed 30m - 50m rear to front', 'Red reflective triangle placed 30m - 50m rear only', '1', 29, 'Red reflective triangle placed 30m - 50m rear and front'),
(694, 'I may park close to a corner no less than:- ', NULL, 0, '9.5m', '75m', '7.5m', '3', 30, '7.5m'),
(695, 'What is the purpose of a 3 point 10?', NULL, 0, 'To stop', ' to turn to the right', ' To make a U turn', '3', 29, ' To make a U turn'),
(696, 'At a flashing amber robot I should:- ', NULL, 0, 'Wait until the road is clear', 'Give right of way to the left', 'Give right of way to the right', '3', 30, 'Give right of way to the right'),
(697, 'A person with a tractor driving permit only drives?', NULL, 0, 'Tractor and light vehicles	', 'Tractor and any other earth moving vehicles', 'Tractor only', '3', 29, 'Tractor only'),
(698, 'In which circumstances may one proceed against red robot? ', NULL, 0, 'When the green arrow is illuminated ', 'When there is no approaching traffic', 'When the green arrow pointing my direction is illuminated', '3', 30, 'When the green arrow pointing my direction is illuminated'),
(699, 'Which is the correct robot sequence? ', NULL, 0, 'Red,Amber,Green ', 'Green,Amber,Red', 'None of the above', '2', 30, 'Green,Amber,Red'),
(700, 'What is the maximum speed limit for light vehicles in wide roads? ', NULL, 0, '80km/h', ' 60km/h', '120km/h', '3', 29, '120km/h'),
(701, 'A driver’s medical certificate is valid for how long? ', NULL, 0, ' 16 months', '24 months', '12 months', '3', 29, '12 months'),
(702, 'A continuous line in the center of the road ', NULL, 0, 'Maybe crossed if there is no coming traffic ', 'May not be crossed', 'Maybe crossed in rural areas', '2', 30, 'May not be crossed'),
(703, 'What is the speed limit in urban areas? C.B.D', NULL, 0, '60km/h	', '75km/h', '70km/h', '1', 29, '60km/h	'),
(704, '	A valesolex carries how many passengers ', NULL, 0, '3', '1', 'none', '3', 29, 'none'),
(705, 'A broken white line besides a continuous white line in the center of the road indicates that', NULL, 0, 'I may overtake if the continuous line is on my side ', 'I may over take if the broken line is on my side ', 'I must keep well left', '2', 30, 'I may over take if the broken line is on my side '),
(706, 'A broken yellow line on the left hand side ', NULL, 0, 'It may not be straddled ', 'It may be straddled to overtake traffic which is turning right', 'May be straddled to overtake a cyclist', '2', 30, 'It may be straddled to overtake traffic which is turning right'),
(707, 'Legal age to drive a bus is ', NULL, 0, '18 years', '25 years', '60 years', '2', 31, '25 years'),
(708, 'What must you do when meeting a motor displaying an “L” plate?', NULL, 0, 'Hoot if the vehicle is blocking road', 'Exercise extreme caution', 'Flash my headlights', '2', 30, 'Exercise extreme caution'),
(709, 'When you come across this sign it means', 'assets/20230812154101451_231370_bb22.jpg', 0, 'Boom gate crossing', 'Rail level crossing ', 'Danger warning sign', '2', 30, 'Rail level crossing '),
(710, 'How far from a corner are you allowed to park a car? ', NULL, 0, ' 75m', ' 7.5m	', '8m', '2', 31, ' 7.5m	'),
(711, 'Which car goes last? ', 'assets/20230713105552674_630521_PNG 40.PNG', 0, 'Car C', 'Car B', 'Car A', '2', 31, 'Car B'),
(712, 'Direction arrows used in conjunction with prohibitory lines on the road surfaces:- ', NULL, 0, 'Are informative	', 'Have no effect to a vehicle', 'Have regulatory effect', '3', 31, 'Have regulatory effect'),
(713, 'At a stop sign:-  ', NULL, 0, '	Stop and proceed when the road is clear to your right ', 'You do not have necessary to stop', 'Stop and proceed when the road is clear on both sides', '3', 31, 'Stop and proceed when the road is clear on both sides'),
(714, 'BREAKING DISTANCE WHEN TRAVELLING AT 60KM\\HR IS', NULL, 0, '18 Meters', '27.7 Meters', '36 Meters', '2', 31, '27.7 Meters'),
(715, 'Which is the correct sequence of the traffic robot light? ', NULL, 0, 'Green, Amber, Red', 'Red, Amber, Green', 'Amber, Green, Red', '1', 31, 'Green, Amber, Red'),
(716, 'You may straddle the broken yellow line……. ', NULL, 0, 'When overtaking traffic turning to the right or when you want to stop', 'When driving a slow moving vehicle', ' When driving at night only   ', '1', 31, 'When overtaking traffic turning to the right or when you want to stop'),
(717, 'Which car has got right of way?    ', 'assets/20230713123901761_237697_PNG 42.PNG', 0, '	C only ', 'A and B ', 'A only', '2', 31, 'A and B '),
(718, 'Which of the following shows danger warning sign? ', NULL, 0, 'Triangle', ' Rectangle', ' Circle', '1', 31, 'Triangle'),
(719, 'At a flashing amber robot? ', NULL, 0, 'Give way traffic from your left', 'Give way traffic from your right', 'Give way traffic from both sides', '2', 31, 'Give way traffic from your right'),
(720, 'When approaching a narrow bridge you are not allowed to overtake because of ', NULL, 0, 'Width restriction', ' Length restriction	', 'Height restriction  ', '1', 31, 'Width restriction'),
(721, 'Which car is breaking the law? ', 'assets/20230713124735114_157658_PNG 43.PNG', 0, 'Car A ', 'Car B', 'Car C', '2', 31, 'Car B'),
(722, 'At a give way sign ', NULL, 0, 'Give way to traffic from your right', ' I do not have necessary to stop', 'Stop and proceed when the road is clear both sides', '1', 31, 'Give way to traffic from your right'),
(723, 'An amber sequence of a robot insists that you should ', NULL, 0, 'Give way to traffic from your right', 'Proceed fast before signal changes', 'Stop unless it is not safe to do so', '1', 31, 'Give way to traffic from your right'),
(724, 'When do you overtake?', NULL, 0, ' Only when running late ', 'When there are double lanes in the direction of my travel', 'When driving to the hospital', '2', 32, 'When there are double lanes in the direction of my travel'),
(725, 'Prohibition lines indicate that:- ', NULL, 0, 'You may not overtake', 'You may overtake from left', 'You may overtake from right', '1', 31, 'You may not overtake'),
(726, 'A red robot in conjunction with a green arrow pointing upwards means ', NULL, 0, 'you may proceed straight ahead', 'You must stop if going straight', 'Robot is malfunctioning', '1', 31, 'you may proceed straight ahead'),
(727, 'What is the function of a clutch pedal?', NULL, 0, 'It keeps the driver ever alert', 'It avoids noise when changing gears', 'Its adds fuel to the engine', '2', 32, 'It avoids noise when changing gears'),
(728, 'Which car goes first? 	', 'assets/20230713131938064_493956_PNG 44.PNG', 0, 'Car B ', 'Car C ', 'Car A', '3', 31, 'Car A'),
(729, 'When involved in a serious accident, I should report the case to the police within a period of', NULL, 0, '24 hours	', ' 10 hours	', '12 hours', '1', 31, '24 hours	'),
(730, 'Fog lights are used ', NULL, 0, 'Only when driving at night ', 'Only when a vehicle is parked', 'When there is a heavy mist', '3', 32, 'When there is a heavy mist'),
(731, 'A seat belt is not necessary when…. ', NULL, 0, 'Driving at a low speed ', 'Driving a heavy vehicle ', 'Reversing', '3', 32, 'Reversing'),
(732, 'A heavy vehicle is not allowed to pull…… ', NULL, 0, ' Not more than 3 trailers', ' Not more than 2 trailers', 'Not more than 1 trailer', '1', 31, ' Not more than 3 trailers'),
(733, 'In rural areas, to which traffic you must give right of way? ', NULL, 0, 'To traffic that enters the junction before you at night', 'To traffic that enters the junction before you ', 'To traffic from your left', '2', 31, 'To traffic that enters the junction before you '),
(734, 'What does the term “blindsport” mean for a driver? ', NULL, 0, 'A portion not covered by your mirrors ', 'An area not covered by your headlights', 'An area covered by your right hand mirror', '1', 32, 'A portion not covered by your mirrors '),
(735, 'When do you indicate at a roundabout? ', NULL, 0, 'As you enter ', 'When circulating ', 'When going out', '3', 32, 'When going out'),
(736, 'You may straddle the broken yellow line……… ', NULL, 0, 'When driving a slow moving vehicle ', 'When driving a heavy vehicle', 'When overtaking traffic turning to the right or when you want to stop', '3', 32, 'When overtaking traffic turning to the right or when you want to stop'),
(737, 'Continuous white line means ', NULL, 0, 'You may not overtake', 'Overtake to both sides', 'Overtake to right only', '1', 31, 'You may not overtake'),
(738, 'What is hazard perception?', NULL, 0, 'Dangerous informative ', 'The transportation of hazardous chemicals', 'Choosing a safe route when driving', '1', 32, 'Dangerous informative '),
(739, 'Entering a robot controlled intersection when it is Amber or Red you had already crossed the pedestrian crossing line ', NULL, 0, 'Stay where you are', 'Turn to the left', 'You reverse the vehicle', '1', 31, 'Stay where you are'),
(740, 'How do you overtake an animal drawn wagon? ', NULL, 0, 'By the right side always ', 'By the left side always ', 'By whatever side is safe to do so', '3', 32, 'By whatever side is safe to do so');
INSERT INTO `questions` (`id`, `question_text`, `img_insert`, `option_image`, `option_a`, `option_b`, `option_c`, `correct_option`, `exam_id`, `answer`) VALUES
(741, 'When parking a vehicle on side of the road….. ', NULL, 0, 'Use taillights, sidelights, parklights ', 'Use only taillights', 'Use only sidelights', '1', 32, 'Use taillights, sidelights, parklights '),
(742, 'This sign means', 'assets/20230812161505022_20160_bb14.png', 0, 'Raining ahead', 'Danger of a variable nature', 'Neither', '2', 32, 'Danger of a variable nature'),
(743, 'When stopping a vehicle what do you do? ', NULL, 0, 'You apply your brakes ', 'Slow down, check the mirror, signal your intention', 'Stop, signal, check mirror', '2', 32, 'Slow down, check the mirror, signal your intention'),
(744, 'When travelling at 90km/h behind another vehicle which I will not intend to overtake ', NULL, 0, ' I will leave a gap of 10 cars	', ' I will leave a gap of 6 cars', ' I will leave a gap of 1 car', '2', 31, ' I will leave a gap of 6 cars'),
(745, 'This sign means ', 'assets/20230812155758929_225823_bb28.gif', 0, '3 point 10 ', 'About turn', 'U-turn is prohibitory', '3', 31, 'U-turn is prohibitory'),
(746, 'What is the use of a park brake?', NULL, 0, 'It has the same use as the foot brake', ' It is only used in an emergency', 'To keep the vehicle stationary', '3', 32, 'To keep the vehicle stationary'),
(747, 'A hooter is used…..', NULL, 0, 'When frustrated by others ', 'When pedestrians are at the middle of the road', 'When attracting a friend’s attention', '2', 32, 'When pedestrians are at the middle of the road'),
(748, 'What are diverging lines?', NULL, 0, 'One which form two ', 'One found at a round about', 'One that is not visible', '1', 32, 'One which form two '),
(749, 'Which reflectors do you put infront of a bus?', NULL, 0, 'White all over ', 'Yellow in front ', 'White in front', '3', 32, 'White in front'),
(750, 'Which car goes last', 'assets/20230812171450663_651404_bb3.jpg', 0, 'CAR A', 'CAR B', 'CAR C', '1', 32, 'CAR A'),
(751, 'On a bridge one should not… ', NULL, 0, 'Apply brakes', 'Sound a horn', 'Overtake slow moving vehicles', '3', 32, 'Overtake slow moving vehicles'),
(752, 'what are the colors of a private vehicle registration plate ? ', NULL, 0, '  Black on yellow background ', 'Black on white blackground', 'Black', '1', 33, '  Black on yellow background '),
(753, 'in case of a tyre burst :', NULL, 0, '  Apply brakes immediately and engage in lower gears ', '  slow down and don’t apply brakes immediately  ', 'Apply foot brakes immediately', '2', 33, '  slow down and don’t apply brakes immediately  '),
(754, 'when under the influence of alcohol and drugs what must you do ? ', NULL, 0, 'drive slowly ', 'dim your lights at night', ' Stay off the road', '3', 33, ' Stay off the road'),
(755, 'On rail crossing with boom gates open you should,', NULL, 0, 'Wait until the train has passed ', 'Look both sides and proceed', 'Wait until the gates have closed', '2', 32, 'Look both sides and proceed'),
(756, 'when approaching this sign I am expected to ;   ', 'assets/20230713142509927_908472_PNG 46.PNG', 0, 'Engage lower gears  ', '  Hoot ', 'Stop and exercise caution ', '1', 33, 'Engage lower gears  '),
(757, 'Which car goes first', 'assets/20230812180958746_453762_bb19.PNG', 0, 'CAR B', 'CAR C', 'CAR A', '1', 33, 'CAR B'),
(758, 'What is the maximum speed limit in Zimbabwe? ', NULL, 0, '80km/h heavy vehicle,120km/h small/light', '120km/h heavy vehicle,80km/h small/light ', '60km/h heavy vehicle,100km/h small/light', '1', 32, '80km/h heavy vehicle,120km/h small/light'),
(759, 'when you temporarily parked by the side of the road at night ,you are to leave ?   ', NULL, 0, ' Your tail lights and side lights on', 'Fog lights on ', 'Main lights on and backlights', '1', 33, ' Your tail lights and side lights on'),
(760, 'A clutch is used to     ', NULL, 0, 'Reduce speed', 'Avoid noise when changing gears', 'none of the above', '2', 33, 'Avoid noise when changing gears'),
(761, 'A weight restriction is usually associated with  ', NULL, 0, 'Bridges capacity on weight ', 'Weight', ' Information signs', '1', 33, 'Bridges capacity on weight '),
(762, 'Weight is usually associated with….. ', NULL, 0, 'Hills ', 'Curves', 'Weight bridges', '3', 32, 'Weight bridges'),
(763, 'what must be avoided when raining ', NULL, 0, '   Driving at high speeds', ' Tarred roads', 'Engaging in high gears', '1', 33, '   Driving at high speeds'),
(764, 'When you are on a straight ahead lane you should ', NULL, 0, 'Turn right ', 'Not turn at all ', 'Give way always', '2', 32, 'Not turn at all '),
(765, 'You may drive without a seat belt when ? ', NULL, 0, ' When driving locally  ', 'When you driving private vehicle ', ' Reversing only', '3', 33, ' Reversing only'),
(766, 'On pedestrian crossing…', NULL, 0, 'You do not need to stop for slow moving people ', 'Exercise caution and proceed if safe to do so ', 'You always have to stop', '2', 32, 'Exercise caution and proceed if safe to do so '),
(767, 'Diverging lines means ?  ', NULL, 0, 'Lane changing ', 'Moving between lanes  ', 'One lane becoming two', '3', 33, 'One lane becoming two'),
(768, 'The hooter is used ?    ', NULL, 0, 'When greeting friends', 'When passing through people you may know', 'When there are animals in the middle of the road .', '3', 33, 'When there are animals in the middle of the road .'),
(769, '	A broken yellow line    ', NULL, 0, 'May not allow overtaking', 'None of all ', ' It may be straddled to overtake cars turning right', '3', 33, ' It may be straddled to overtake cars turning right'),
(770, 'A red robot in conjunction with a green arrow  pointing upwards means?', NULL, 0, 'You may proceed straight ahead ', 'You must stop if going straight', 'The robot is malfunctioning', '1', 32, 'You may proceed straight ahead '),
(771, 'A ONE WAY sign is in which class of signs?', NULL, 0, 'Dangerwarning', 'Regulatory', 'Informative', '3', 32, 'Informative'),
(772, 'how far from the corner are you forbidden to park ? ', NULL, 0, '  8m', '  14m', '7.5 m', '3', 33, '7.5 m'),
(773, 'when facing a red robot with a straight ahead arrow pointing upwards it means ? ', NULL, 0, ' stop ', ' check the traffic officer straight ', ' You may proceed straight ahead ', '3', 33, ' You may proceed straight ahead '),
(774, 'a motor vehicle may tow ?  ', NULL, 0, '4 trailers', '1 trailer', ' A vehicle of any size if it is able to do so ', '2', 33, '1 trailer'),
(775, 'when you see a rabbit crossing the road ', NULL, 0, 'Reduce speed and stop if its necessary ', 'Giveway to all small cars passing ', ' Expect humps', '1', 33, 'Reduce speed and stop if its necessary '),
(776, 'we use heavy gears when ?  ', NULL, 0, 'Going uphill ', 'Carrying heavy loads ', 'When you want to reduce speed', '1', 33, 'Going uphill '),
(777, 'When approaching a animal drawn wagon vehicle ? ', NULL, 0, 'You slow down and pass with the safe side to do so', ' Left Side', ' Best side', '1', 33, 'You slow down and pass with the safe side to do so'),
(778, 'Which car goes first? ', 'assets/20230713144619028_868356_p1.17.PNG', 0, '	Car A	', 'Car B	', 'Any car', '2', 34, 'Car B	'),
(779, 'if involved in a car accident you ?  ', NULL, 0, 'Report to the police within 24 hours', ' Call your next of kin', ' Don’t leave your belongings in the Car', '1', 33, 'Report to the police within 24 hours'),
(780, 'In a vehicle, if you are a learner, how many passengers are you allowed to carry?', NULL, 0, 'None	', ' 2	', 'Only one', '1', 34, 'None	'),
(781, 'What are the lane changing procedures?', NULL, 0, 'Rear view, electrical signal, Blind spot and hand signal ', 'Rear view, blind spot, hand signal and electrical signal', 'Do nothing', '1', 34, 'Rear view, electrical signal, Blind spot and hand signal '),
(782, 'in which circumstances should I proceed against a red robot ? ', NULL, 0, ' When the green arrow is illuminated ', ' When all sides are clear ', ' at night when there are no cars moving', '1', 33, ' When the green arrow is illuminated '),
(783, 'A holder of class five drivers’ licence can drive agricultural vehicle only ', NULL, 0, 'False	', ' Yes	', 'Even a lorry', '1', 34, 'False	'),
(784, '	vehicle predriving checks include     ', NULL, 0, 'Checking if fuel is enough', 'Check if the car have been serviced', 'Checking rear view mirrors are properly working  ', '3', 33, 'Checking rear view mirrors are properly working  '),
(785, 'A holder of class five driver’s permit is allowed to drive vehicles normally driven by class five drivers', NULL, 0, 'No', 'Yes	', 'Even Four', '2', 34, 'Yes	'),
(786, 'A person under the age of seventeen years is allowed to drive class two motor vehicles', NULL, 0, '	No	', 'Yes	', 'Under supervision', '1', 34, '	No	'),
(787, 'This sign means', 'assets/20230812181808714_931104_BB1.PNG', 0, 'Robots aheads', 'Traffic lights out of order', 'Traffic lights in order', '2', 34, 'Traffic lights out of order'),
(788, 'what does the sign mean   ', 'assets/20230713145923100_212221_PNG 47.PNG', 0, ' Congestion', ' Slow down', 'Danger sign ahead', '1', 33, ' Congestion'),
(789, 'This sign mean', 'assets/20230812181933706_566817_bb14.png', 0, 'Danger ahead', 'Danger that always changes or varies always', 'Danger of rain drops', '2', 34, 'Danger that always changes or varies always'),
(790, 'A tractor driver’s permit is only used when the driver is accompanied by a licenced one', NULL, 0, 'False	', 'True	', 'None', '2', 34, 'True	'),
(791, 'Ambulance vehicles must be fitted with safety belts before they are used ', NULL, 0, 'True	', ' False	', 'Only when the driver wishes', '1', 34, 'True	'),
(792, 'At night in well lighted areas, drivers should drive with', NULL, 0, 'Head lamps on low beam	', ' Head lamps on high beam	', 'Head lamps off', '1', 34, 'Head lamps on low beam	'),
(793, 'what does the sign mean  ', 'assets/20230713150351919_393418_PNG 48.PNG', 0, 'Reduced visibility', 'Mist ahead ', 'Exercise caution ahead', '1', 33, 'Reduced visibility'),
(794, 'A Learner driver is exempted from wearing seat belts only', NULL, 0, 'When reversing	', 'When checking the mirror	', 'When overtaking', '1', 34, 'When reversing	'),
(795, 'which car moves last in the intersection                     ', 'assets/20230808185509908_345728_bb3.jpg', 0, ' Car A  ', 'Car B  ', 'Car C', '1', 33, ' Car A  '),
(796, 'You check your view mirror and you see an airplane in the sky', NULL, 0, 'Reduce speed and prepare to stop', 'Adjust the mirror	', ' Slow down', '2', 34, 'Adjust the mirror	'),
(797, 'Which can an applicant apply for a duplication learner’s licence?', NULL, 0, 'When the original is lost or default', 'When you give your friend ', ' When the original is expired', '1', 34, 'When the original is lost or default'),
(798, 'An accident has just happened, you being the first at the scene what are you expected to do?', NULL, 0, 'Render first aid and report to the nearest police ', 'Report to the hospital ', 'Call the police', '1', 34, 'Render first aid and report to the nearest police '),
(799, 'It is legally permissible to carry a child under the age of 10 years in a pick-up truck which has canopy on that portion where goods are normally carried while not accompanied ', NULL, 0, 'No', 'Yes	', 'None', '1', 34, 'No'),
(800, 'At a Four way stop which car must you give the right of way when you intend to turn to the left?', NULL, 0, 'The car which stops first	', 'The car from the left', 'car from the right', '2', 34, 'The car from the left'),
(801, 'A Driver’s Medical Certificate is valid only', NULL, 0, '12 months	', '24 months	', '16 months', '1', 34, '12 months	'),
(802, 'Class five is allowed to drive tractors only', NULL, 0, 'False	', 'True	', 'A tractor and a bus', '1', 34, 'False	'),
(803, 'What do you do at a detour? ', NULL, 0, 'You slow down and follow directions	', 'Increase speed	', 'Flash your lights', '1', 34, 'You slow down and follow directions	'),
(804, 'Which vehicle is used by class 2 driving students?', NULL, 0, '5000kg 7m truck', '2100kg 5m truck	', '700kg 2m truck', '1', 34, '5000kg 7m truck'),
(805, 'An ambulance has the right of way when', NULL, 0, 'Flashing its emergence lights and sounding its siren ', 'In main road ', 'When the hazard light a flashing', '1', 34, 'Flashing its emergence lights and sounding its siren '),
(806, 'Motor cycle should travel in which position of the lane?', NULL, 0, 'Center of the left lane	', 'Right lane', 'Behind any car', '1', 34, 'Center of the left lane	'),
(807, 'Ambulance drivers are required to wear safety belts each time they are driving an ambulance', NULL, 0, 'Yes	', 'True	', 'Only when they are travelling fast', '1', 34, 'Yes	'),
(808, 'When vehicle ahead of you is towing what do you do?', NULL, 0, 'Reduce speed and exercise caution', 'Overtake him ', 'Reduce speed and follow behind', '1', 34, 'Reduce speed and exercise caution'),
(809, 'A medical certificate is valid for  ', NULL, 0, '12 months', '24 months', '48 months', '1', 35, '12 months'),
(810, 'How many meters are you forbidden to park from the corner  ', NULL, 0, '14m', ' 21m', ' 7m', '3', 35, ' 7m'),
(811, 'Reflectors on a heavy vehicle are of what color  , ', NULL, 0, ' Black and White', ' Yellow and White', 'White and Chevron.', '3', 35, 'White and Chevron.'),
(812, 'Minimum age to apply for driver licence is ', NULL, 0, '18', '21', '16', '3', 35, '16'),
(813, 'Will an ambulance driver wear a seat belt when is ringing a siren. ', NULL, 0, 'No', ' not always', ' yes', '3', 35, ' yes'),
(814, 'A vehicle with a trailer is allowed to travel at what speed on wide tar.? ', NULL, 0, ' 120km/hr', ' 100km/hr ', '80 Km/hr', '3', 35, '80 Km/hr'),
(815, 'A crush helmet is a must for?', NULL, 0, 'Pedal cyclists only.  ', 'Motor cyclists only. ', 'both of the above', '2', 36, 'Motor cyclists only. '),
(816, 'At a railway crossing.  ', 'assets/20230812183115631_809315_bb22.jpg', 0, 'Giveway ', 'Stop sometimes', ' you stop', '3', 35, ' you stop'),
(817, 'At a zebra crossing you!?  ', NULL, 0, 'you stop and give precedence to any pedestrian crossing.  ', 'you do not necessarily need to stop ', 'you accelerate.', '1', 36, 'you stop and give precedence to any pedestrian crossing.  '),
(818, 'A hazard is a    ', NULL, 0, ' Is an object on the road ', 'Grid or humps  ahead', 'an anticipation of danger ahead', '3', 35, 'an anticipation of danger ahead'),
(819, 'At a controlled robot intersection when you intend to turn left? ', NULL, 0, 'you turn right. ', 'you give way to trafﬁc from your right.  ', 'yield precedence to any pedestrian within the crossing.', '3', 36, 'yield precedence to any pedestrian within the crossing.'),
(820, 'An animal drawn wagon can be overtaken on which side.  ', NULL, 0, 'on whichever side is safe to do so.', 'Left side ', ' Centre', '1', 35, 'on whichever side is safe to do so.'),
(821, 'An abnormal load vehicle must.  ', NULL, 0, 'Be labeled abnormal load, have red ﬂags attached to its front and rear left corner.  ', 'And it must have ﬂashing amber and it\'s read lamps must always be on.', 'All of the above', '3', 36, 'All of the above'),
(822, 'A speed restrictions sign states that.  ', NULL, 0, 'Travel above certain speed', 'Limit your speed to 60KM', ' you must not exceed stated speed', '3', 35, ' you must not exceed stated speed'),
(823, 'At a four-way sign ', NULL, 0, 'Check if the sides are clear ', 'Giveway to cars on the right', ' the cars in main road goes first', '3', 35, ' the cars in main road goes first'),
(824, 'Which side must you overtake an abnormal load vehicle. ', NULL, 0, 'Which ever side is safe to do so.  ', 'left side. ', 'never overtake an abnormal vehicle load unless the rear escort vehicle signals that you should do so or the road ahead is clear', '3', 36, 'never overtake an abnormal vehicle load unless the rear escort vehicle signals that you should do so or the road ahead is clear'),
(825, 'Which side must passengers disembarking from the bus cross the road from? ', NULL, 0, 'Front side', 'rear side ', 'passengers disembarking from the bus must wait for the bus to move off then cross the road.', '3', 36, 'passengers disembarking from the bus must wait for the bus to move off then cross the road.'),
(826, 'Which class does this sign follow under', 'assets/20230812183239704_387398_bb7.jpeg', 0, 'Information', 'Regulatory signs', 'Informative signs', '3', 35, 'Informative signs'),
(827, 'A red robot in conjuction with a a straight green arrow states.     ', NULL, 0, 'Stop', 'Go to the right', 'cars going straight can proceed.', '3', 35, 'cars going straight can proceed.'),
(828, 'where should you put litter when traveling in a bus? ', NULL, 0, 'under the bus.  ', 'throw over the window ', 'put in a bin or wait for the bus to stop and put in a bin.', '3', 36, 'put in a bin or wait for the bus to stop and put in a bin.'),
(829, 'What do you do at 4 or 3 Way stop controlled Junction.', NULL, 0, 'you give way to trafﬁc from your right.  ', 'you do not have to wait for slow moving trafﬁc.', 'Stop until the vehicle that has stopped at the Junction before you has cleared the Junction.', '3', 36, 'Stop until the vehicle that has stopped at the Junction before you has cleared the Junction.'),
(830, 'What is the correct sequence of a robot ', NULL, 0, 'Red green amber', ' Red amber lime-green', 'Amber red amber', '3', 35, 'Amber red amber'),
(831, 'When you hear an ambulance siren or Motor acade sounding it\'s beacon you?  ', NULL, 0, 'move to left side o fb the road  ', 'you stop on the extreme left of the road or  Move out of its course and remain stationery until it has passed.  ', 'you don\'t necessarily have to stop.', '2', 36, 'you stop on the extreme left of the road or  Move out of its course and remain stationery until it has passed.  '),
(832, 'If you notice an accident.      ', NULL, 0, 'Put breakdown sign to notify others', 'Exercise caution and proceed', 'You render first aid and report to police within 24 hours', '3', 35, 'You render first aid and report to police within 24 hours'),
(833, 'A driver medical certiﬁcate is valid for.', NULL, 0, '12 months ', '24 months  ', '18 month\'s', '1', 36, '12 months '),
(834, 'What are diverging lines?', NULL, 0, 'One which form two ', 'One found at a round about.  ', 'One that is visible', '1', 36, 'One which form two '),
(835, 'Continuous white line with broken ones on the left. ', NULL, 0, 'may not he straddled ', 'may not be crossed ', ' cross it with caution', '3', 35, ' cross it with caution'),
(836, 'What are converging lines? ', NULL, 0, 'two becoming one.', 'One which form two.  ', 'When the road become one.', '1', 36, 'two becoming one.'),
(837, 'Which car is breaking low', 'assets/20230812183507342_251407_bb31.jpg', 0, 'Car Q', ' Car R', 'CAR A', '1', 35, 'Car Q'),
(838, 'When traveling in a ordinary city trafﬁc.?  ', NULL, 0, 'you indicate 50 metres before you turn. ', 'you indicate 100 metres before you turn. ', 'you indicate 150 before you turn', '1', 36, 'you indicate 50 metres before you turn. '),
(839, 'Double solid lines means  .  ', NULL, 0, ' you may not overtake', 'Overtake with caution', 'A blind spot ahead ', '1', 35, ' you may not overtake'),
(840, 'Which car goes last', 'assets/20230812185231491_865406_BB4.jpeg', 0, 'Car C', 'CAR B', 'Car A', '3', 36, 'Car A'),
(841, 'Before you use a public vehicle it ', NULL, 0, 'Have a driver 40 years old', ' Have all papers in place   ', ' must have a registration book & insurance', '3', 35, ' must have a registration book & insurance'),
(842, 'what does the sign mean?  ', 'assets/20230714064721034_140099_p1.18.PNG', 0, 'Dual carriage freeway.  ', 'Single way', ' Highway ahead', '1', 36, 'Dual carriage freeway.  '),
(843, 'Who has the right of way in rural areas ', NULL, 0, 'the car which arrive at the Junction first', 'first one in the main road ', ' fast moving car', '1', 35, 'the car which arrive at the Junction first'),
(844, 'A tractor can be driven without a license  ', NULL, 0, ' Only when its at the farm ', 'When used for personal farming only', ' yes if there is a permit.', '3', 35, ' yes if there is a permit.'),
(845, 'Pulling off to stop you  ', NULL, 0, 'Check your right side and stop well ', 'you check your mirror.. Blind spot.. Slow down down indicate and stop', ' Check blind spot , verify if no one is following you', '2', 35, 'you check your mirror.. Blind spot.. Slow down down indicate and stop'),
(846, 'At a give away', NULL, 0, ' you don\'t necessarily need to stop.  ', 'Stop then proceed with caution', ' Exercise extreme caution', '1', 35, ' you don\'t necessarily need to stop.  '),
(847, 'What type of road should you never reverse into?', NULL, 0, ' Main road', ' Busy Road ', 'A major road or a one way street.', '3', 35, 'A major road or a one way street.'),
(848, 'Where would you see a triangle painted on the road?  ', NULL, 0, 'On approach to junctions, roundabouts and yield signs ', 'On approach  roundabouts and yield signs  ', 'Government buildings', '1', 35, 'On approach to junctions, roundabouts and yield signs '),
(849, 'Which car goes first', 'assets/20230714071247817_148870_PNG 50.PNG', 0, 'Car A ', 'Car B ', 'Both cars', '2', 37, 'Car B '),
(850, 'What does the first sign represents?     ', 'assets/20230812185542491_968184_bb15.png', 0, 'Stones may falling because of rain and slippery road ahead', 'Take caution stones ahead', 'Road ahead have loose stones', '3', 36, 'Road ahead have loose stones'),
(851, 'In a vehicle if you are a learner how many passengers are you allowed to carry? 	', NULL, 0, '1 and the instructor', 'None ', 'Two', '2', 37, 'None '),
(852, 'What does the sign represents? ', 'assets/20230714071222119_341523_p1.20.PNG', 0, 'width  ', 'width of 15m', 'LENGTH OF 15m', '3', 36, 'LENGTH OF 15m'),
(853, 'What are lane changing procedures? 	', NULL, 0, 'Rear view mirror, electrical signals, blind sport, hand signal', 'Rear view mirror and blind spot ', 'Blind spot and electrical signal', '1', 37, 'Rear view mirror, electrical signals, blind sport, hand signal'),
(854, 'What does the sign represents!?                 ', 'assets/20230714071741485_7811_p1.21.PNG', 0, '   end of tarred road and begins or gravel  ', 'slippery road ahead  ', 'none of the above', '1', 36, '   end of tarred road and begins or gravel  '),
(855, 'A holder of class 5 driver’s licence can drive agricultural vehicle only. ', NULL, 0, 'True ', '	False ', 'Only on farm lands', '2', 37, '	False '),
(856, 'A person under the age of seventeen years is allowed to drive class two motor vehicles?	', NULL, 0, 'Yes ', 'No ', 'With a defensive course', '2', 37, 'No '),
(857, 'At the age of sixteen years a person can get a licence in which class?', NULL, 0, 'Classes 2 and 5', 'Class 3 and 4', 'Class 1 and 2', '2', 37, 'Class 3 and 4'),
(858, 'At the age of 17 years a person can drive? 	', NULL, 0, 'Heavy Vehicles ', 'Light motor vehicles ', 'Agricultural vehicles', '2', 37, 'Light motor vehicles '),
(859, 'Which car goes first in urban areas with well lit up roads at night', 'assets/20230808210824121_799003_BB6.PNG', 0, 'CAR A', 'CAR B', 'CAR C', '2', 37, 'CAR B'),
(860, 'Ambulance vehicle must be fitted with safety belts before they are used?', NULL, 0, 'True ', 'False ', 'For rescuing only', '1', 37, 'True '),
(861, 'This means that', 'assets/20230812194526174_644155_bb12.PNG', 0, 'Road narrows to the left', 'Road narrows to the right', 'Road narrows to the centre', '3', 37, 'Road narrows to the centre'),
(862, 'This sign means', 'assets/20230812194357663_81621_bb30.png', 0, 'All small cars can park', 'Heavy vehicle can not park here', 'I can park here', '3', 37, 'I can park here'),
(863, 'If you check your mirror and see an aeroplane in the sky what do you do? ', NULL, 0, 'Slow down and prepare to stop', 'Increase your speed', 'Adjust your mirrors', '3', 37, 'Adjust your mirrors'),
(864, 'When can an applicant apply for a duplicate learner’s licence when? ', NULL, 0, 'The original has expired', 'The original has been lost or defaced', '	When going for road test.', '2', 37, 'The original has been lost or defaced'),
(865, 'An accident has just happened you being the first at the scene what are expected to do?', NULL, 0, 'Render first aid and drive away', '	Render first aid and report to the nearest police station.', 'Call the police', '2', 37, '	Render first aid and report to the nearest police station.'),
(866, 'What does the sign represents?          .  ', 'assets/20230714074127764_387900_p1.22.PNG', 0, 'Proceed to the left  ', 'No smoking   at this area ', 'no hitch hiking is allowed. Or hitch hiking prohibited', '3', 36, 'no hitch hiking is allowed. Or hitch hiking prohibited'),
(867, 'What does the sign represents?                        ', 'assets/20230714074305916_726421_p1.23.PNG', 0, '      ambulance ahead ', 'stop or give away sign', ' none of the above', '2', 36, 'stop or give away sign'),
(868, 'This sign represents?', 'assets/20230714074942752_300047_p1.26.PNG', 0, 'Mist ahead ', 'Slippery road ahead ', 'the sign represents reduced visibility drive with caution', '3', 36, 'the sign represents reduced visibility drive with caution'),
(869, 'It is legally permissible to carry a child under the age of 10 years in a pickup which has no canopy on that portion where goods are normally carried while not accompanied by an elder? ', NULL, 0, '	Yes', 'No ', 'If there seat belts are available', '2', 37, 'No '),
(870, '	At seeing this sign I should travel at what speed?                 ', 'assets/20230714074538825_189451_p1.24.PNG', 0, ' 80KM on the main road or road ahead.  ', 'Minimum speed is 80KM ahead ', ' Travel below 55KM ', '1', 36, ' 80KM on the main road or road ahead.  '),
(871, 'WHICH CAR GOES LAST              ', 'assets/20230808200820690_65823_bb3.jpg', 0, 'CAR A', 'CAR B', 'CAR C', '1', 36, 'CAR A'),
(872, 'What does a reﬂective T means.? ', NULL, 0, 'vehicle being towed.', 'heavy vehicle  ', 'it means a vehicle is towing a trailer ', '1', 36, 'vehicle being towed.'),
(873, 'When you see this sign you', 'assets/20230808211712865_737800_bb7.jpeg', 0, 'you have left Gokwe 10km now', 'you can drive well for next 10km to Gokwe', '10km away from Gokwe', '3', 37, '10km away from Gokwe'),
(874, 'What does the sign represents.', 'assets/20230714074902789_328087_p1.25.PNG', 0, ' Information ', ' Regulatory ', ' Distance and directions ', '1', 36, ' Information '),
(875, 'A driver’s medical certificate is valid for how long?', NULL, 0, '12 months', '8 months', '16 months', '1', 37, '12 months'),
(876, 'Class five is allowed to drive tractors only. 	', NULL, 0, '	True', 'When on job assignment', 'False', '3', 37, 'False'),
(877, 'What do you do at a detour?', NULL, 0, 'Reduce speed and follow directions', 'Drive at 50km/hr ', 'Reduce speed and stop', '1', 37, 'Reduce speed and follow directions'),
(878, '	Which vehicle is used by a class 2 drivers students? 	', NULL, 0, '5000kgs and 7m truck', 'Any lorry  ', 'Bedford or Hino', '1', 37, '5000kgs and 7m truck'),
(879, 'An ambulance have the right of way when? ', NULL, 0, 'Sounding its siren ', 'Travelling at high speed ', 'Flashing its emergency lights and sounding its siren', '3', 37, 'Flashing its emergency lights and sounding its siren'),
(880, 'Motor cycles should travel in which lane? 	', NULL, 0, 'Right lane ', 'Left lane', 'The centre lane', '2', 37, 'Left lane'),
(881, 'At this sign when travelling in a highway', 'assets/20230812194225486_768820_bb14.png', 0, 'You slow down and exercise caution of danger ahead', 'l will know there is danger ahead of variable nature', 'An accident has occurred', '2', 37, 'l will know there is danger ahead of variable nature'),
(882, 'What is the correct sequence of a robot?', NULL, 0, 'Green, Red, Amber ', 'Amber , Red , Green', 'Red, Green, Amber', '2', 38, 'Amber , Red , Green'),
(883, 'In urban areas which car has the right of way?   ', 'assets/20230714080631063_867358_p1.27.PNG', 0, 'The approaching car from your left side. ', 'The approaching car from your right side. ', 'The car which stops first', '2', 38, 'The approaching car from your right side. '),
(884, 'When travelling at 75km/hr I must allow a gap between my vehicle and the car in front of me. ', NULL, 0, '4 cars length ', '6 cars length ', '5 cars length', '3', 38, '5 cars length'),
(885, 'When a vehicle ahead of you is towing what do you do?', NULL, 0, 'Reduce speed and exercise caution ', 'Reduce speed and stop ', 'Drive at 40km/hr  ', '1', 37, 'Reduce speed and exercise caution '),
(886, 'This sign is a  ', 'assets/20230714080944301_116271_p1.28.PNG', 0, 'Regulatory sign ', 'Danger warning sign ', 'Informative', '2', 38, 'Danger warning sign '),
(887, 'What is a blind sport 	', NULL, 0, 'Depression', 'A dangerous place', 'The potion that not seen by mirrors', '3', 39, 'The potion that not seen by mirrors'),
(888, 'This sign warns us of   ', 'assets/20230714081057448_679065_p1.29.PNG', 0, 'Physical barrier ahead ', 'Rail level crossing ahead ', 'A grid ahead', '1', 38, 'Physical barrier ahead '),
(889, 'What is hazardous perception? ', NULL, 0, 'A dangerous place', 'An anticipation of what is in front', '	A wrong turn', '2', 39, 'An anticipation of what is in front'),
(890, 'When approaching this I would ', 'assets/20230714081330036_310622_p1.30.PNG', 0, 'Be expected to check my vehicle ', 'Slow down and expected to be stopped', 'Expected to see road works ahead', '2', 38, 'Slow down and expected to be stopped'),
(891, 'On a bridge one should not ', NULL, 0, 'Accelerate', 'Change gears ', 'Overtake slow moving vehicles', '3', 39, 'Overtake slow moving vehicles'),
(892, 'When approaching this sign I am expected to  ', 'assets/20230714081545819_291245_p1.31.PNG', 0, 'Engage breaks continuously ', 'Engage low gears ', 'Engage high gears', '2', 38, 'Engage low gears '),
(893, 'What is the maximum speed limit in Zimbabwe?', NULL, 0, '80km/hr 	', '80km/hr - heavy vehicles and 120km/hr – small light vehicles', 'none', '2', 39, '80km/hr - heavy vehicles and 120km/hr – small light vehicles'),
(894, 'What do you do when you see an aeroplane in your rear view mirror', NULL, 0, '	I will exercise extremely caution', 'I will do nothing ', 'adjust view mirrors', '3', 39, 'adjust view mirrors'),
(895, 'Which car goes First  ', 'assets/20230714081820481_748646_p1.32.PNG', 0, 'Car A ', 'Car B ', 'Car C', '1', 38, 'Car A '),
(896, 'Fog lights are used	', NULL, 0, 'When parking', 'During a break down', 'When it is misty', '3', 39, 'When it is misty'),
(897, 'At this sign I should', 'assets/20230714081934825_46973_p1.33.PNG', 0, 'Stop and give way to all crossing traffic.', 'Slow down and proceed when the road is clear on both sides ', 'Stop and proceed when the road is clear on traffic', '2', 38, 'Slow down and proceed when the road is clear on both sides '),
(898, 'This sign regulates that ', 'assets/20230714082044065_256558_p1.34.PNG', 0, 'The speed limit on this road is 80km/hr ', 'Speed limit on this road is in between 80km/hr and 60km/hr', 'Which car moves last at the intersection?', '1', 38, 'The speed limit on this road is 80km/hr '),
(899, 'Do you switch on lights when travelling at 6:00am', NULL, 0, 'Yes but only on heavy vehicles ', 'No ', 'Yes', '3', 39, 'Yes'),
(900, 'Which car moves last at the intersection? ', 'assets/20230714082205471_160457_p1.35.PNG', 0, 'Car B', 'Car C ', 'Car A', '2', 38, 'Car C '),
(901, 'what are the colors of a private vehicle registration plate ? ', NULL, 0, ' Black on yellow background  ', 'Black on white background ', ' Black', '1', 39, ' Black on yellow background  '),
(902, 'A vehicle should be fitted with efficient reflectors of what colour? ', NULL, 0, 'Amber at the front and red at the back ', 'White at the front and amber at the back', 'White at the front and red at the back', '3', 38, 'White at the front and red at the back'),
(903, 'A seat belt is not necessary when?	', NULL, 0, 'Reversing ', 'Driving in rural areas ', 'Increasing speed', '1', 39, 'Reversing '),
(904, 'This sign warns us of  ', 'assets/20230714082406159_922751_p1.36.PNG', 0, 'Stop and give way sign ahead ', 'Rail / road crossing sign ', 'Cross roads ahead', '1', 38, 'Stop and give way sign ahead '),
(905, 'When stopping a motor vehicle on a road except in traffic where would you stop?', NULL, 0, 'On the extremely left ', 'Stop in the middle if it is safe to do so. ', 'On the extreme left of the road or in an authorised parking space.', '3', 38, 'On the extreme left of the road or in an authorised parking space.'),
(906, 'What is the use of park brakes? ', NULL, 0, 'T park at a lay-by', 'To assist the foot brake', 'To keep the vehicle stationery', '3', 39, 'To keep the vehicle stationery'),
(907, 'How far from a corner are you forbidden to park your vehicle? ', NULL, 0, '7m  ', '7.5m', '10m', '1', 38, '7m  '),
(908, 'When the under the influence of drugs or alcohol what you must do? ', NULL, 0, 'Drive slowly ', 'Stay off the road', 'Drive on the extreme left of the road', '2', 38, 'Stay off the road'),
(909, 'How do you stop at the road? 	', NULL, 0, 'Slow down, check mirror and signal', 'Check mirror, reduce speed, signal , pull off then stop', 'Reduce speed, stop', '2', 39, 'Check mirror, reduce speed, signal , pull off then stop'),
(910, 'The insignia of a danger warning sign is? ', NULL, 0, 'Triangle ', 'Rectangle ', 'Circle', '1', 38, 'Triangle '),
(911, 'What is the use of a clutch ', NULL, 0, 'To reduce speed', 'To avoid noise when changing gears ', 'To disengage gears', '2', 39, 'To avoid noise when changing gears '),
(912, 'A driver’s medical certificate is valid for how long? 	', NULL, 0, '24 months', '18 months', '12 months', '3', 39, '12 months'),
(913, 'On which side must you overtake an animal drawn wagon? ', NULL, 0, 'Left side ', 'Right side', 'By whichever side is safe to do so', '3', 38, 'By whichever side is safe to do so'),
(914, 'What are direction given by a fixed flashing robot at an intersection?', NULL, 0, 'Give precedence to all crossing traffic. ', 'Give precedence to vehicle coming from the right ', 'Give precedence to vehicle coming from the left', '2', 38, 'Give precedence to vehicle coming from the right '),
(915, 'What is the colour of reflector at the front of vehicles? 	', NULL, 0, 'Red reflectors', 'White reflectors ', 'Yellow reflectors', '2', 39, 'White reflectors '),
(916, 'A restrict sign signifies that ', NULL, 0, 'Do not cross', 'Drive with caution', 'Do not exceed', '3', 39, 'Do not exceed'),
(917, 'Which car goes first?  ', 'assets/20230714083351722_448636_p1.37.PNG', 0, 'Car A', 'Car B ', 'Car C', '3', 38, 'Car C'),
(918, 'What are diverging lines? ', NULL, 0, 'Transverse lines', 'Lines crossing the road', 'One which forms two', '3', 39, 'One which forms two'),
(919, 'This sign is a ', 'assets/20230714083511514_692974_p1.39.PNG', 0, 'An informative sign ', 'Carriage marking ', 'A regulatory', '1', 38, 'An informative sign '),
(920, 'When do you indicate in a round-about? 	', NULL, 0, 'When slowing down', 'To caution other drivers', 'When going out', '3', 39, 'When going out'),
(921, 'When parking a vehicle on the side of the road use ', NULL, 0, 'Lights ', 'Park lights ', 'Side lights', '2', 39, 'Park lights '),
(922, 'This sign regulates that ', 'assets/20230714083853984_48680_p1.40.PNG', 0, 'Vehicle should give right of way to cyclists ', 'Stop and give way to cyclists from the right ', 'Cyclists should stop and give right of way to all crossing traffic.', '3', 38, 'Cyclists should stop and give right of way to all crossing traffic.'),
(923, 'Before driving a motor vehicle on a public road it must have which of the following documents?', NULL, 0, 'A certificate of fitness, licence and route permission.', 'A registration book, insurance and vehicle licence. ', 'A drivers licence and registration book.', '2', 38, 'A registration book, insurance and vehicle licence. '),
(924, 'When oncoming vehicle lights are on bright beam what do you do?', NULL, 0, 'Pull down the sun visor', 'Switch on your head lights ', 'Slow down and cast your eyes slightly to the left.', '3', 38, 'Slow down and cast your eyes slightly to the left.'),
(925, 'To drive public service vehicle you must reach the age of?', NULL, 0, 'Nineteen', 'Twenty five ', 'Eighteen', '2', 38, 'Twenty five '),
(926, 'At pedestrian crossing place what do you do? ', NULL, 0, 'Keep to the extreme left side of the road ', 'Use your hazards', 'Exercise caution and proceed if it is safe to do so', '3', 39, 'Exercise caution and proceed if it is safe to do so'),
(927, 'Which car goes last? ', 'assets/20230714084831757_596687_p1.41.PNG', 0, 'Car C', 'Car A ', 'Car B', '2', 40, 'Car A '),
(928, 'At a junction you should not?', NULL, 0, 'Turn to the left ', 'Turn to the right', 'Turn right in front of oncoming vehicle traffic', '3', 39, 'Turn right in front of oncoming vehicle traffic'),
(929, 'Which car goes last   ', 'assets/20230714084948307_386243_p1.42.PNG', 0, 'Car C ', 'Car B', 'Car A', '1', 40, 'Car C '),
(930, 'When you reach a lay-by sign at night you should? ', NULL, 0, 'Park on the left', 'Reduce speed', 'Put your hazards', '2', 39, 'Reduce speed'),
(931, 'What is the purpose of a handbrake 	', 'assets/20230812190823281_899338_bb32.jpeg', 0, 'To keep the car stationery in the parking bay', 'To keep the car stationery against a steep gradient', 'To keep the car stationery', '3', 39, 'To keep the car stationery'),
(932, 'Class 1 driver applicants must have age of', NULL, 0, '16 ', '18 and defensive ', '25 and medical', '3', 40, '25 and medical'),
(933, 'The correct sequence of a robot ', NULL, 0, 'Green, Red, Amber ', ' Green, Amber , Red', 'Red, Amber, Green', '2', 40, ' Green, Amber , Red'),
(934, 'What is the purpose of a hooter?', NULL, 0, 'For alerting animals the middle of the road.', 'For alerting pedestrian on the middle of the road', 'For alerting other vehicles', '2', 39, 'For alerting pedestrian on the middle of the road'),
(935, 'At this sign I must? ', 'assets/20230714085513688_145585_p1.43.PNG', 0, 'Engage brakes continuously', 'Engage lower gears ', 'Reduce speed and exercise caution.', '2', 40, 'Engage lower gears '),
(936, 'In which class is a one way sign? 	', NULL, 0, 'Regulatory ', 'Informative', 'Carriage markings', '2', 39, 'Informative'),
(937, 'When travelling at 60km/hr the reaction distance is.', NULL, 0, '27.7m ', '8.3m', '16.7m', '2', 40, '8.3m'),
(938, 'Which vehicle cannot have a fire extinguisher?', NULL, 0, 'Motor cycle', 'Motor parked at home ', 'Registered motor travelling on the road.', '1', 40, 'Motor cycle'),
(939, 'Which car has the right of way   ', 'assets/20230714090325268_789581_p1.44.PNG', 0, 'Car C', 'Car B', 'Car A', '1', 40, 'Car C'),
(940, 'A layby sign is coloured in', NULL, 0, ' Blue ', 'Green', 'Yellow', '1', 41, ' Blue '),
(941, 'When entering a robot controlled intersection and already crossed the pedestrian crossing line. ', NULL, 0, 'stay where you are', 'Turn to the left ', 'Reverse your vehicle', '1', 40, 'stay where you are'),
(942, 'When another vehicle wishes to overtake me ', NULL, 0, 'I will pull off the road', ' I will change my lane', ' I will reduce speed', '3', 41, ' I will reduce speed'),
(943, 'Which vehicle does not have a reverse gear?', NULL, 0, 'Combine harvester ', 'A motor cycle ', 'Tractor ', '2', 40, 'A motor cycle '),
(944, 'When driving behind another vehicle at night ', NULL, 0, 'You put your headlights on but on bright beam ', 'You dip your headlights', 'Switch off your lights', '2', 40, 'You dip your headlights'),
(945, 'When do you use a red reflective triangular sign?', NULL, 0, 'When a truck is heavily loaded', 'When your motor vehicle has broken down', 'When a heavy vehicle has broken down', '3', 41, 'When a heavy vehicle has broken down'),
(946, 'What is used to indicate that a heavy vehicle has broken down? ', NULL, 0, 'The \'L\' Plate', 'A crash helmets', 'A red reflective triangular sign', '3', 41, 'A red reflective triangular sign'),
(947, 'Which car goes first? ', 'assets/20230714091010097_320522_p1.45.PNG', 0, 'Car A', 'Car B ', 'Car C', '3', 40, 'Car C'),
(948, 'When involved in serious accident ', NULL, 0, 'Report to hospital within 24hrs ', 'Report to the police immediately ', 'Proceed with your journey if it is safe to do so', '2', 40, 'Report to the police immediately '),
(949, 'Which car gives the right of way?  ', 'assets/20230714091153152_424906_p1.46.PNG', 0, 'Car B ', 'Car C ', 'Car A', '1', 40, 'Car B '),
(950, 'Which car is breaking the law  ', 'assets/20230812195320885_965837_bb33.png', 0, 'Car A ', 'Car B ', 'Car C', '1', 40, 'Car A '),
(951, 'In which class is a give way sign? ', NULL, 0, ' Informative', ' Regulatory', 'Danger warning', '2', 41, ' Regulatory'),
(952, '	How many classes of road signs do we have in Zimbabwe?', NULL, 0, '	6 ', '	5 ', '4', '2', 40, '	5 '),
(953, 'Which car gives the right of way?  ', 'assets/20230714091510054_436148_p1.48.PNG', 0, 'Car B', 'Car A ', 'Car C', '1', 40, 'Car B'),
(954, 'If you see an L Plate displayed on a vehicle in front of you, what do you do?', NULL, 0, 'Increase speed and take over', 'Reduce speed and drive cautiously', 'Put hazards', '2', 40, 'Reduce speed and drive cautiously'),
(955, 'At what distance do you put a reflective triangular ', NULL, 0, '7.5m ', '30m – 50m ', '15 – 20m', '2', 40, '30m – 50m '),
(956, 'Which Car is breaking the law?  ', 'assets/20230714092124981_221993_p1.49.PNG', 0, 'Car A ', 'Car B', 'Car C', '1', 40, 'Car A '),
(957, 'What do you do when seeing this sign? ', 'assets/20230714092318331_324061_p1.50.PNG', 0, 'Stay off the road ', 'Reduce speed and exercise caution', 'Engage lower gear', '2', 40, 'Reduce speed and exercise caution'),
(958, 'How many reflective triangles does a lorry carrying 2 trailers have? ', NULL, 0, '2 ', '3 ', '6', '3', 40, '6'),
(959, 'Travelling at 120km/hr total stopping distance is. ', NULL, 0, '113.3m ', '130.0m ', '15m', '2', 40, '130.0m '),
(960, 'This sign is   ', 'assets/20230714092637778_874021_p1.51.PNG', 0, 'Informative ', 'Traffic light ', 'Danger warning sign', '2', 40, 'Traffic light '),
(961, 'A broken white line in conjunction with continuous arrows on the road surface they have. ', NULL, 0, 'Informative message ', 'Regulatory effect and driver must obey ', 'Danger warning sign', '2', 40, 'Regulatory effect and driver must obey '),
(962, 'Which of the following statements is correct?  ', NULL, 0, 'A circle regulates traffic', ' A triangle regulates traffic  ', 'A rectangle regulates traffic', '1', 41, 'A circle regulates traffic'),
(963, 'When overtaking traffic turning to the right, a motorist may', NULL, 0, 'Straddle the continuous white line ', 'Straddle the broken white line', 'Straddle the broken yellow line', '3', 41, 'Straddle the broken yellow line'),
(964, 'When can a motorist straddle the broken yellow line? ', NULL, 0, 'When overtaking traffic turning to the left', 'When overtaking traffic turning to the right ', 'When turning to the left', '2', 41, 'When overtaking traffic turning to the right '),
(965, 'Which traffic would I stop for at a stop sign?  ', NULL, 0, ' I will stop for traffic approaching from all directions', ' I will stop for traffic approaching from my right', ' I will stop for traffic approaching from the left', '1', 41, ' I will stop for traffic approaching from all directions'),
(966, '. At a flashing amber robot ', NULL, 0, 'Wait until the road is clear', 'Give way to traffic from your left', ' Give way to traffic from your right', '3', 41, ' Give way to traffic from your right'),
(967, 'At what speed should you travel when turning? ', NULL, 0, '40km/hr', '60km/hr ', 'Safe speed', '3', 42, 'Safe speed'),
(968, 'When meeting other cars on slippery roads ', NULL, 0, 'Increase speed', ' Reduce speed and exercise caution ', 'Stop with caution', '2', 41, ' Reduce speed and exercise caution '),
(969, 'At what time do you switch your lights on?', NULL, 0, '5:30pm – 6:30am', '5:00am – 6:00pm', ' At night', '1', 42, '5:30pm – 6:30am'),
(970, 'If an ambulance and police or motorcade sounding its siren what do you do? ', NULL, 0, '	You should pull off the road and stop', 'Drive to the extreme left of the road', '	Reduce speed and exercise caution', '1', 42, '	You should pull off the road and stop'),
(971, 'What do you use to park your car? ', NULL, 0, 'Footbrake', ' Hooter', ' Handbrake', '3', 41, ' Handbrake'),
(972, '	Which statement is true about these lines? Double continuous lines    ', 'assets/20230714094114988_295964_p1.52.PNG', 0, '	No vehicle is allowed to overtake ', 'No vehicle at any time should be driven on the right hand of these lines', 'No vehicle should straddle these lines', '1', 42, '	No vehicle is allowed to overtake '),
(973, 'Direction signs are ', NULL, 0, 'Danger warning signs', ' Regulatory Signs ', 'Informative signs', '3', 41, 'Informative signs'),
(974, 'When you see this sign you cannot? ', 'assets/20230714094234051_163849_p1.53.PNG', 0, '	Turn right', 'Turn left', 'Make an about turn', '3', 42, 'Make an about turn'),
(975, ' A broken white line on the road indicates that  ', NULL, 0, 'I may overtake ', ' I may not overtake', 'I may stop', '1', 41, 'I may overtake '),
(976, 'This sign regulates that ', 'assets/20230714094336929_900392_p1.54.PNG', 0, 'A round about sign', 'Height restriction sign ', 'Weight restriction', '3', 42, 'Weight restriction'),
(977, 'What is the maximum speed limit in Zimbabwe? ', NULL, 0, '80km/hr', '60km/hr ', '80km/hr heavy vehicle and 120km/hr light motor vehicles', '3', 42, '80km/hr heavy vehicle and 120km/hr light motor vehicles'),
(978, 'Which car goes first? ', 'assets/20230714094607872_342397_p1.55.PNG', 0, 'None', 'Car B', 'Car A', '2', 42, 'Car B'),
(979, 'Which car goes first?  ', 'assets/20230714094718256_222118_p1.56.PNG', 0, '	Car B ', '	Car A ', 'Both', '2', 42, '	Car A '),
(980, 'A red light appearing with a green arrow pointed to the left means that ', NULL, 0, 'Traffic turning to the right may proceed ', 'Traffic to the left may proceed', '	There are road marks ahead', '2', 42, 'Traffic to the left may proceed'),
(981, ' At what speed should you travel when seeing this sign?', 'assets/20230714095221201_650215_PNG 51.PNG', 0, ' Between 60 and 90km/hr', ' At a speed which is not more than 80km/hr on the main road', '70Km/hr on the main road', '2', 41, ' At a speed which is not more than 80km/hr on the main road'),
(982, 'This sign means ', 'assets/20230714094932847_505499_p1.57.PNG', 0, 'A warning of a narrow grid', 'A warning of a gravel road ahead ', 'A warning of a narrow bridge ahead', '3', 42, 'A warning of a narrow bridge ahead'),
(983, 'A triangle is an insignia for ', NULL, 0, 'A danger warning sign  ', 'A regulatory sign', 'An informative sign', '1', 41, 'A danger warning sign  '),
(984, ' A heavy vehicle towing trailers must have  ', NULL, 0, 'As many spare wheels as possible ', ' Fewer passengers', 'Safety chains fitted to the trailer', '3', 41, 'Safety chains fitted to the trailer'),
(985, 'This sign means  ', 'assets/20230714095041486_812716_p1.58.PNG', 0, 'The road narrows to the right ahead ', '	The road is narrow to the left ahead ', 'The road narrows centrally', '2', 42, '	The road is narrow to the left ahead '),
(986, 'When travelling at 60km/hr behind another vehicle which I do not intend to overtake I will leave a gap of?', NULL, 0, '5 Cars ', '4 Cars', '	6 cars', '2', 42, '4 Cars'),
(987, 'Which vehicle moves last?  ', 'assets/20230714095217037_130910_p1.59.PNG', 0, 'Car A', 'Car C ', 'Car B', '3', 42, 'Car B'),
(988, 'When should safety chains be used? ', NULL, 0, 'To pull a broken down vehicle.', 'On a heavy vehicle towing trailers', 'On all luggage.', '2', 41, 'On a heavy vehicle towing trailers'),
(989, 'At give way sign I should', NULL, 0, 'Give way to traffic turning to the right. ', 'Give way to traffic turning to the left.', '	Give way to traffic coming from both sides and proceed if the road is clear', '3', 42, '	Give way to traffic coming from both sides and proceed if the road is clear'),
(990, 'At a pedestrian zebra variety, what must you do? ', NULL, 0, 'Proceed fast', 'Give right of way to pedestrians', ' Watch out for stray animals', '2', 41, 'Give right of way to pedestrians'),
(991, 'In which class is a de-restriction sign?  ', 'assets/20230714095433340_52356_p1.39.PNG', 0, '	Informative ', '	Regulatory ', 'Danger Warning', '1', 42, '	Informative '),
(992, 'When traveling at a low speed, which lane of the road should you keep? ', NULL, 0, ' The centre lane', 'The left lane', ' The right lane', '2', 41, 'The left lane'),
(993, 'This sign is a ', 'assets/20230714095559308_744995_p1.60.PNG', 0, 'Rail road level crossing', 'Rail road crossing with flashing lights', 'Traffic light signal.', '1', 42, 'Rail road level crossing'),
(994, '. In which class is a hump ahead sign? ', 'assets/20230714100211387_91742_PNG 52.PNG', 0, 'Danger warning', ' Informative ', ' Reguatory', '1', 41, 'Danger warning'),
(995, 'When meeting another vehicle with flashing lights what do you do?', NULL, 0, 'Reduce speed and exercise caution ', 'Cast your eyes slightly to the left and reduce speed. ', 'Slow down', '2', 42, 'Cast your eyes slightly to the left and reduce speed. '),
(996, 'When are you not allowed to overtake? ', NULL, 0, 'When passing a narrow bridge', 'Where there is a hospital ', 'Where there is a post office', '1', 41, 'When passing a narrow bridge'),
(997, 'What do you do when seeing this sign? ', 'assets/20230714100101018_397097_p1.61.PNG', 0, 'Engage  to lower gears', 'Reduce speed and exercise caution ', 'Stay off the road', '2', 42, 'Reduce speed and exercise caution '),
(998, 'What do you do at this prohibition lines? ', 'assets/20230714100304201_814982_p1.62.PNG', 0, 'My vehicle can cross both lines if it is safe to do so', 'Overtaking is prohibited', 'Not straddle this line', '3', 42, 'Not straddle this line'),
(999, 'The sign means...', 'assets/20230714100651062_989336_PNG 53.PNG', 0, ' The road narrows to the right ahead ', 'The road narrows to the left ahead ', ' The road narrows centrally ahead', '1', 41, ' The road narrows to the right ahead '),
(1000, '	What is your precaution if you see a heavy vehicle parked near side of the road?  ', NULL, 0, 'Look both sides and proceed faster', 'Reduce speed and exercise caution ', '	Drive faster', '2', 42, 'Reduce speed and exercise caution '),
(1001, 'Which car is breaking the law?', 'assets/20230714100448416_212469_p1.63.PNG', 0, 'Car A ', 'Bar B', 'Car C', '3', 42, 'Car C');
INSERT INTO `questions` (`id`, `question_text`, `img_insert`, `option_image`, `option_a`, `option_b`, `option_c`, `correct_option`, `exam_id`, `answer`) VALUES
(1002, 'When you run over a dog in rural areas what  do you do? ', NULL, 0, ' Proceed with your journey ', 'Stop and try to find the owner', ' Take the animal to the hospital', '2', 41, 'Stop and try to find the owner'),
(1003, 'What is the maximum speed limit in urban area? ', NULL, 0, '60km/hr', '80km/hr ', '120km/hr', '1', 42, '60km/hr'),
(1004, 'What is the maximum speed limit in wide tars? ', NULL, 0, '80km/hr', '60km/hr ', '120km/hr', '3', 42, '120km/hr'),
(1005, 'Which car is breaking the law? ', 'assets/20230714101037073_129401_PNG 54.PNG', 0, 'None', 'Car A', 'Car B', '2', 41, 'Car A'),
(1006, 'What is the meaning of this sign?  ', 'assets/20230714100705982_902102_p1.64.PNG', 0, 'School children crossing ', 'Road works ahead ', 'Pedestrian crossing place', '2', 42, 'Road works ahead '),
(1007, 'A heavy vehicle is a vehicle exceeding:', NULL, 0, ' 2500Kgs Net mass ', '2300Kgs Net mass', '5000Kgs Net mass', '3', 43, '5000Kgs Net mass'),
(1008, 'Direction arrows used in conjunction with prohibitory lines on the road surface ', NULL, 0, ' Are danger warning signs ', ' Have a regulatory effect', ' Are informative signs', '2', 43, ' Have a regulatory effect'),
(1009, ' In Zimbabwe in which area(s) should you give right of way to traffic from your right? ', NULL, 0, 'In rural areas', ' In high density areas ', 'In urban areas.', '3', 44, 'In urban areas.'),
(1010, 'For every 15km/hr at which you are travelling, you leave a gap of what distance between your car and the car ahead of you? ', NULL, 0, ' A gap of 3 metres', 'A gap of 7 metres', 'A gap equivalent to the length of the vehicle', '3', 44, 'A gap equivalent to the length of the vehicle'),
(1011, 'When you enter a robot-controlled intersection when it is amber or red and you have already crossed the pedestrian crossing line what do you do?', NULL, 0, ' Reduce speed ', 'Stay where you are ', 'Reverse your vehicle', '2', 43, 'Stay where you are '),
(1012, 'What should you do when you stop to refuel your motor vehicle?', NULL, 0, 'Avoid naked lights ', 'Avoid excessive noise ', 'Drive cautiously.', '1', 44, 'Avoid naked lights '),
(1013, ' Waving your hand in form of a circle is an insignia for', NULL, 0, 'Turning right ', 'Approaching a round about ', 'Turning left', '3', 43, 'Turning left'),
(1014, 'A layby sign is coloured in ', NULL, 0, 'Blue', 'Green ', 'Either blue or green', '1', 44, 'Blue'),
(1015, 'When can you travel above a previously imposed speed limit? ', NULL, 0, 'When you pass a traffic congestion area. ', 'When a derestriction sign is imposed by your side of the road', ' When you pass the controlled intersection', '2', 44, 'When a derestriction sign is imposed by your side of the road'),
(1016, 'When overtaking traffic turning to the right, a motorist may', NULL, 0, ' Straddle the broken yellow line', 'Straddle the continuous white line ', 'Straddle the double continuos white line', '1', 43, ' Straddle the broken yellow line'),
(1017, 'A weight restriction sign emphasizes that ', 'assets/20230813063316202_874567_BB35.png', 0, ' Certain heavy vehicles may not enter ', 'Heavy vehicles may enter with caution', 'Any vehicle with a weight above that indicated may not enter.', '3', 44, 'Any vehicle with a weight above that indicated may not enter.'),
(1018, ' In which class is the one way sign?', NULL, 0, 'Danger warning', ' Informative', 'Regulatory', '2', 43, ' Informative'),
(1019, ' Where there are two traffic lanes in which lane should you travel when you intend to go straight ahead? ', NULL, 0, 'The left lane', 'The right lane', ' The lane marked by the broken white line', '1', 44, 'The left lane'),
(1020, ' What is the other word for transverse lines?', NULL, 0, ' Stop lines ', 'Edge lines', ' Longitudinal lines', '1', 43, ' Stop lines '),
(1021, ' This sign means that', 'assets/20230813063044483_252895_BB34.png', 0, 'You are approaching a traffic roundabout ahead ', 'You should stop ahead', 'You are approaching a traffic congestion area ahead', '1', 44, 'You are approaching a traffic roundabout ahead '),
(1022, 'When travelling at 60km/hour behind another vehicle which I do not intend to overtake I will leave a gap of... ', NULL, 0, ' 5 cars  ', '4 cars ', '3 cars', '2', 43, '4 cars '),
(1023, 'When travelling in a properly lit street I will ', NULL, 0, ' Reduce speed and dip my head lights ', ' Reduce speed and exercise caution ', 'Engage to the lowest gear', '1', 44, ' Reduce speed and dip my head lights '),
(1024, 'When can I leave a gap of 4 cars between my car and another which I do not intend to overtake? ', NULL, 0, ' When travelling at 40Km/hr', 'When travelling a 60Km/hr ', 'When travelling at 80Km/hr', '2', 43, 'When travelling a 60Km/hr '),
(1025, 'Which car has the right of way?', 'assets/20230714102118735_183566_p1.67.PNG', 0, 'Car B ', 'Car A ', ' None', '1', 44, 'Car B '),
(1026, 'How are cyclists required to ride their bicycles? ', NULL, 0, 'Side by side     ', ' In a single file     ', '1 to 2 abreast', '2', 44, ' In a single file     '),
(1027, 'What do you do if an oncoming vehicle does not dip it\'s lights?', NULL, 0, ' I will pull down the sun visor', 'I will cast my eyes slightly to the left ', 'I will switch off the spot lights', '2', 44, 'I will cast my eyes slightly to the left '),
(1028, 'When can one overtake from the left? ', NULL, 0, ' As you meet oncoming traffic', 'When the driver in front of you signals to turn to the right ', 'When you enter an uncontrolled intersection.', '2', 44, 'When the driver in front of you signals to turn to the right '),
(1029, '. This sign means...  ', 'assets/20230714102842924_614134_PNG 55.PNG', 0, 'A warning of physical barrier ahead', ' A warning of a railroad level crossing ahead', 'A warning of a grid ahead', '1', 43, 'A warning of physical barrier ahead'),
(1030, 'An unbroken white line with a broken white line on its left indicate that ', NULL, 0, ' The road around you is busy', ' My vehicle may cross both lines if it is safe to do so ', 'Overtaking is prohibited.', '2', 44, ' My vehicle may cross both lines if it is safe to do so '),
(1031, ' Which car goes first?', 'assets/20230714102732320_794064_p1.68.PNG', 0, 'Car B ', 'Car A', ' The car which is not turning right', '1', 44, 'Car B '),
(1032, ' Which car has the right of way?', 'assets/20230714103146699_778979_PNG 56.PNG', 0, ' None', 'Car B', ' Car A', '2', 43, 'Car B'),
(1033, ' When can I go through a red robot? ', NULL, 0, 'When I have the precedence to go', ' When it is in conjunction with a green arrow pointing in the direction of my travel ', 'When the road is clear', '2', 43, ' When it is in conjunction with a green arrow pointing in the direction of my travel '),
(1034, ' Applicants for classes 1.2 and 5 must be from what age? ', NULL, 0, '16 years ', '18 Years ', ' 13 Years', '2', 43, '18 Years '),
(1035, 'When you approach a traffic circle what do you do? ', 'assets/20230813062702987_530660_BB21.PNG', 0, 'Give way to traffic already circulating', ' Give way to traffic from your right ', ' Give way to buses only', '1', 44, 'Give way to traffic already circulating'),
(1036, 'What are the regulations with regard to the carriage of passengers on a motor cycle or side car?', NULL, 0, 'A proper pillion seat and foot rests must be provided', ' A seatbelt must be provided', ' A crash helmet should be provided', '1', 43, 'A proper pillion seat and foot rests must be provided'),
(1037, 'Which car is breaking the law?', 'assets/20230813062842977_212228_BB6.PNG', 0, 'Car A', ' Car B', 'Car C', '3', 44, 'Car C'),
(1038, 'Prohibition lines indicates that', NULL, 0, 'You may overtake ', 'You may be overtaken', 'You may not overtake', '3', 44, 'You may not overtake'),
(1039, 'Which is the rule of the road?', NULL, 0, ' To keep to the right and give the right of way to traffic approaching from the road on your left', 'To keep to the left and give the right of way to traffic approaching from the road on your left ', 'To keep to the left and give the right of way to traffic approaching from the road on your right', '3', 43, 'To keep to the left and give the right of way to traffic approaching from the road on your right'),
(1040, 'Which car must stop?', 'assets/20230813062927266_604453_bb3.jpg', 0, 'Car B', 'Car A', 'None of the two', '2', 44, 'Car A'),
(1041, ' Raising your hand slowly up and down is a signal for ', NULL, 0, 'Slowing down Turning to the right ', 'SLOWING DOWN', 'Stopping', '1', 43, 'Slowing down Turning to the right '),
(1042, 'To ensure safely at a parking bay, I will  ', NULL, 0, 'Lock my vehicle', 'Put on the handbrake ', 'Switch off the engine', '2', 43, 'Put on the handbrake '),
(1043, 'Which car has the right of way? ', 'assets/20230714104011892_561508_p1.73.PNG', 0, 'Either a or b ', 'Car A', ' Car B', '3', 44, ' Car B'),
(1044, 'A motor cycle is permitted to carry not more than', NULL, 0, '1 passenger ', ' 2 passengers  ', ' 3 passengers', '1', 44, '1 passenger '),
(1045, 'Longitudinal lines are there to', NULL, 0, ' Demarcate the lanes to be followed on the road ', 'Indicate parking bays', 'Inform the end of a previously imposed speed limit', '1', 44, ' Demarcate the lanes to be followed on the road '),
(1046, 'Before reversing a vehicle from a parking place I must', NULL, 0, ' Ensure that the handbrake is firmly on  ', ' Check underneath the car', 'Adjust the rear view mirror', '2', 44, ' Check underneath the car'),
(1047, 'A red reflective triangular sign should be placed at what distance from a heavy vehicle that has broken down? ', NULL, 0, ' 3,5mts behind ', '30-50mts behind', '350mts behind', '2', 44, '30-50mts behind'),
(1048, 'A robot ahead sign is in which class of signs?  ', 'assets/20230813062630405_717091_bb10.png', 0, 'Danger warning signs', 'Informative signs', 'Regulatory signs', '1', 43, 'Danger warning signs'),
(1049, 'What is the general speed limit when driving. in urban areas? ', NULL, 0, '60km/hr  ', ' 80km/hr ', '40km/hr', '1', 44, '60km/hr  '),
(1050, 'A faulty steering wheel has how many degrees of free play?', NULL, 0, ' 25 degrees ', '90 degrees', '45 degrees', '2', 43, '90 degrees'),
(1051, 'A sign marked cycle track is in which class of signs?', 'assets/20230714105051098_509936_PNG 58.PNG', 0, ' Danger warning signs ', 'Regulatory Signs', ' Informative signs', '3', 43, ' Informative signs'),
(1052, 'In which class of signs is a derestriction sign? ', 'assets/20230714105306264_757161_PNG 59.PNG', 0, ' Informative ', 'Danger warning', 'Regulatory', '1', 43, ' Informative '),
(1053, 'What should you do when meeting other vehicles at night? ', NULL, 0, 'Travel on your left side', 'Deep your lights ', ' Switch off the lights', '2', 43, 'Deep your lights '),
(1054, 'When should you dip your lights? ', NULL, 0, 'When you are parking your vehicle', ' When meeting other vehicles at night', 'When travelling at a safe speed ', '2', 43, ' When meeting other vehicles at night'),
(1055, 'The minimum legal age at which an applicant can learn to drive is', NULL, 0, '19 years ', ' 17 years', ' 16 years', '3', 45, ' 16 years'),
(1056, 'What is the characteristic of a danger warning sign?', NULL, 0, ' Circle  ', ' Triangle', ' Rectangle', '2', 43, ' Triangle'),
(1057, 'This sign means', 'assets/20230807201625604_319417_aa31.png', 0, 'There is a two way traffic ahead', ' I may overtake', ' I should not overtake', '3', 45, ' I should not overtake'),
(1058, 'Which of the following lines is the edge of the road?', NULL, 0, ' Broken yellow line', ' Broken white line ', 'Unbroken white line', '1', 43, ' Broken yellow line'),
(1059, 'This sign is', 'assets/20230807201751232_579859_aa32.png', 0, 'A width restriction sign ', 'A height restriction sign ', 'A weight restriction sign', '2', 45, 'A height restriction sign '),
(1060, 'This sign is', 'assets/20230807201952578_908330_aa33.jpeg', 0, 'A weight restriction sign  ', 'A height restriction sign', 'A width restriction sign', '3', 45, 'A width restriction sign'),
(1061, 'What does this sign mean?  ', 'assets/20230714110231340_4293_p1.77.PNG', 0, 'You may overtake ', 'The previously imposed speed limit has been cancelled ', ' You can travel above 60km/hr', '2', 45, 'The previously imposed speed limit has been cancelled '),
(1062, 'What does a broken yellow line signify?  ', NULL, 0, ' A busy urban road', ' The edge of the road', ' A controlled intersection', '2', 46, ' The edge of the road'),
(1063, '. In which class of motor vehicles do we find a motor cylcle? ', NULL, 0, ' Class 5', ' Class 4 ', 'Class 3', '3', 46, 'Class 3'),
(1064, '. Mandatory signs are ', NULL, 0, 'Danger warning signs', 'Regulatory signs', ' Informative signs', '2', 46, 'Regulatory signs'),
(1065, 'An amber sequence of a robot light insist that you should ', NULL, 0, 'Go', ' Stop unless it is not safe to do so', 'Give way to traffic from your right', '2', 46, ' Stop unless it is not safe to do so'),
(1066, 'Which car goes first?', 'assets/20230714123352281_729984_p1.78.PNG', 0, 'A', 'B', 'C', '1', 45, 'A'),
(1067, 'Followed by which car?', 'assets/20230714123426328_412863_p1.78.PNG', 0, 'A', 'B', 'C', '2', 45, 'B'),
(1068, 'What is the most important thing in an ambulance', NULL, 0, 'Wheel spanner', 'Patient', 'Driver', '2', 46, 'Patient'),
(1069, 'Which car has the right of way?', 'assets/20230714123541200_688149_P1.79.PNG', 0, ' Car A', 'None ', 'B', '3', 45, 'B'),
(1070, 'What is the most important thing in a bus?', NULL, 0, 'Wheel spanner', 'Passengers ', 'Driver', '2', 46, 'Passengers '),
(1071, 'In emergency we use', NULL, 0, ' Footbrakes', ' An ambulance', 'Handbrake', '1', 45, ' Footbrakes'),
(1072, 'A triangle is an insignia of which class? ', NULL, 0, ' Informative', 'Danger warning.', ' Regulatory', '2', 46, 'Danger warning.'),
(1073, 'What is used to indicate that a heavy vehicle has broken down? ', NULL, 0, 'Yellow reflectors', ' A red reflective triangular sign', 'Handbrake', '2', 45, ' A red reflective triangular sign'),
(1074, 'Which car must give right of way?', 'assets/20230714124423494_579571_PNG 60.PNG', 0, 'Car B', 'None  ', 'Car A', '3', 46, 'Car A'),
(1075, 'When travelling at 75km/hr behind another vehicle which you do not intend to overtake you leave a gap of', NULL, 0, ' 4 cars ', ' 5 cars ', '6 cars', '2', 45, ' 5 cars '),
(1076, 'How many classes of road signs do we have the in the traffic jungle? ', NULL, 0, ' 6 classes  ', '5 classes ', '4 classes', '2', 45, '5 classes '),
(1077, 'At an uncontrolled intersection ', NULL, 0, 'Give way to traffic already circulating', 'Give way to traffic from your left', 'Give way to traffic approaching from your right', '3', 46, 'Give way to traffic approaching from your right'),
(1078, 'What documentation is required before a motor vehicle may be used on the road? ', NULL, 0, ' Driver\'s licence and vehicle licence. ', ' Vehicle licence and insurance,  ', ' Insurance, registration book and vehicle licence.', '3', 45, ' Insurance, registration book and vehicle licence.'),
(1079, ' When you approach a traffic circle what do you do? ', NULL, 0, 'Give way to traffic already circulating', 'Give way to traffic from your right ', ' Give way to buses only', '1', 46, 'Give way to traffic already circulating'),
(1080, 'When turning from one road into another to the left in what portion of the road must you drive?  ', NULL, 0, 'The centre lane', 'The extreme left portion of the road ', 'The centre point of the Intersection', '2', 45, 'The extreme left portion of the road '),
(1081, 'What do you use to park your car?', NULL, 0, ') Footbrakes', ' Hooter', 'Handbrake', '3', 45, 'Handbrake'),
(1082, 'A rectangle is an insignia of which class? ', NULL, 0, ' Informative ', 'Danger warning', 'Regulatory', '1', 46, ' Informative '),
(1083, ' Informative signs are characterized by ', NULL, 0, ' A triangular shape', ' A circular shape', 'A rectangular shape', '3', 46, 'A rectangular shape'),
(1084, 'You may cross or straddle the broken yellow line', NULL, 0, 'When overtaking slow moving traffic: ', 'When overtaking traffic turning to the right ', 'When overtaking traffic turning to the left', '2', 45, 'When overtaking traffic turning to the right '),
(1085, 'When going down a hill', NULL, 0, 'Engage to a lower gear', 'Disengage your gear ', 'Apply the handbrake', '1', 46, 'Engage to a lower gear'),
(1086, 'Which car goes first?', 'assets/20230714124746437_428174_P1.80.PNG', 0, 'A', 'B', 'C', '1', 45, 'A'),
(1087, 'Followed by which car?', 'assets/20230714124810621_844831_P1.80.PNG', 0, 'A', 'B', 'C', '3', 45, 'C'),
(1088, 'When involved in a serious accident I should report the case to the police within a period of ', NULL, 0, ' 28 hours ', '48 hours  ', '24 hours', '3', 45, '24 hours'),
(1089, 'What is the rule of Zimbabwean roads? ', NULL, 0, 'To follow the imposed speed limit ', 'To keep to the left and to give right of way to traffic approaching from the right ', 'To drive below 60km/hr in urban areas', '2', 45, 'To keep to the left and to give right of way to traffic approaching from the right '),
(1090, 'Which car must stop?', 'assets/20230714125412343_82966_PNG 61.PNG', 0, 'Car A ', 'Car B', 'None', '1', 46, 'Car A '),
(1091, 'For every 30km/hr at which you are travelling. you leave a gap of', NULL, 0, '3 cars ', '5 cars', '2 cars', '3', 45, '2 cars'),
(1092, 'How should cyclists ride their bicycles?', NULL, 0, ' In a single file', 'Cautiously ', '1to 2 abreast', '1', 46, ' In a single file'),
(1093, 'This sign means', 'assets/20230807202237731_138890_aa34.jpg', 0, 'Turning round about ahead', 'Round about if you want to turn back', 'Round about ahead', '3', 45, 'Round about ahead'),
(1094, 'How far from a corner are you allowed to park your car?  ', NULL, 0, '7.5m from the corner  ', ' 5.7m from the corner 75m from the corner', 'about 14 m', '1', 46, '7.5m from the corner  '),
(1095, 'In which class of signs do we find the railroad level crossing sign? ', 'assets/20230807202314291_114088_aa23.PNG', 0, 'Regulatory ', ' Traffic light signals  ', ' Danger warning', '2', 45, ' Traffic light signals  '),
(1096, 'Where there are three traffic lanes in which lane should you travel when you intend to go straight ahead? ', NULL, 0, 'The centre lane', 'The right lane ', 'The left lane', '1', 46, 'The centre lane'),
(1097, 'Which car has the right of way? ', 'assets/20230714125712985_37513_P1.82.PNG', 0, 'Car A', 'Car B ', 'Either A or B', '2', 45, 'Car B '),
(1098, 'When entering an intersection controlled by the police, I will', NULL, 0, ' Park my vehicle', ' Follow the signals of the policeman ', ' Produce my licence', '2', 46, ' Follow the signals of the policeman '),
(1099, 'Which car must give right of way?', 'assets/20230714125834905_154711_P1.83.PNG', 0, 'All ', 'Car A ', 'Car B', '3', 45, 'Car B'),
(1100, 'When another vehicle wishes to overtake me ', NULL, 0, 'I would pull off the road ', ' I would reduce my speed', ' I would signal the other driver to overtake', '2', 46, ' I would reduce my speed'),
(1101, '. A physical barrier ahead sign is in which class of traffic signs? ', NULL, 0, ' Informative ', ' Danger warning', 'Regulatory', '2', 46, ' Danger warning'),
(1102, 'When passing through an ambulance parked by road side', NULL, 0, 'l Reduce speed', 'l proceed if its not hooting its siren and not flashing amber lights', 'l park to the far right side and let it pass ', '1', 46, 'l Reduce speed'),
(1103, 'Which car is breaking the law and endangering others?', NULL, 0, 'Car which have no driver\'s licence', 'Car without valid licence and ensurance', 'Car without brake lights and brakes', '3', 46, 'Car without brake lights and brakes'),
(1104, 'Which lane of the road should we keep when driving at a low speed?', NULL, 0, 'The right lane ', ' The left lane', ' The centre lane', '2', 47, ' The left lane'),
(1105, 'Which car goes last?', 'assets/20230714131342694_15742_PNG 62.PNG', 0, ' None', 'Car B  ', 'Car A', '3', 46, 'Car A'),
(1106, 'When turning right or left at a robot controlled intersection you give way to', NULL, 0, ' Traffic from your left', 'Traffic from your right  ', ' Pedestrians', '3', 47, ' Pedestrians'),
(1107, 'What is the meaning of this sign? ', 'assets/20230714131232547_161868_p1.84.PNG', 0, 'Traffic roundabout ahead ', 'It\'s a warning of a stop or give way sign ahead', ' Robot ahead sign', '2', 47, 'It\'s a warning of a stop or give way sign ahead'),
(1108, 'Which car must stop?', 'assets/20230714131400299_811655_p1.85.PNG', 0, 'Car A ', 'Car B', 'None', '1', 47, 'Car A '),
(1109, 'Which car goes first?', 'assets/20230714131542907_454291_p1.86.PNG', 0, 'A', 'B', 'C', '1', 47, 'A'),
(1110, 'Followed by which car? ', 'assets/20230714131614290_542655_p1.86.PNG', 0, 'A', 'B', 'C', '2', 47, 'B'),
(1111, 'Which car has the right of way?', 'assets/20230714131715699_543537_P1.87.PNG', 0, ' Car A ', 'Car B ', 'None', '2', 47, 'Car B '),
(1112, 'A broken white line on the road indicates that ', NULL, 0, 'I may overtake', 'I may not overtake', ' I may not stop.', '1', 47, 'I may overtake'),
(1113, 'A heavy vehicle is allowed to pull ', NULL, 0, 'Not more than 3 trailers ', 'Not more than 2 trailers ', 'Not more than 1 trailer', '1', 47, 'Not more than 3 trailers '),
(1114, 'When meeting other cars on slippery roads', NULL, 0, 'Increase speed', 'Accelerate with caution ', 'Reduce speed and exercise extreme caution.', '3', 47, 'Reduce speed and exercise extreme caution.'),
(1115, '. When approaching a rail/road level crossing ', NULL, 0, ' I may proceed if the red lights are flashing', 'I should proceed slowly', ' I should not proceed while the red lights are flashing', '3', 46, ' I should not proceed while the red lights are flashing'),
(1116, 'If you approach a flashing amber robot what do you do? ', NULL, 0, 'Give way to traffic from your right ', 'Proceed provided you are going straight ', ' Give way to traffic from your left', '1', 47, 'Give way to traffic from your right '),
(1117, 'In rural areas, to which traffic must you give the right of way? ', NULL, 0, ' To traffic approaching from my right  ', 'To traffic approaching from my left ', 'To all traffic which enters the junction before me', '3', 47, 'To all traffic which enters the junction before me'),
(1118, '. A one way sign is coloured in', NULL, 0, 'Green', 'Blue', ' Black', '1', 46, 'Green'),
(1119, 'How shall you overtake an animal drawn wagon? ', NULL, 0, 'By the right side ', ' By the left side ', 'By which ever side is safe to do so', '3', 47, 'By which ever side is safe to do so'),
(1120, 'You dip your lights at night', NULL, 0, ' When driving in a properly lit street ', 'When driving in a poorly lit street ', 'When driving a heavy vehicle', '1', 47, ' When driving in a properly lit street '),
(1121, 'When are you forbidden to overtake?', NULL, 0, 'Ahead of a comer', ' In urban areas', ' In rural areas?', '1', 47, 'Ahead of a comer'),
(1122, 'What is the general speed limit when travelling in urban areas? ', NULL, 0, '60km/hr ', '90km/hr', '80km/hr', '1', 47, '60km/hr '),
(1123, 'When your judgement is impaired by the use of drugs or alcohol', NULL, 0, ' Travel at a safe speed ', 'Stay completely off the road ', 'Travel below 60km/hr', '2', 47, 'Stay completely off the road '),
(1124, ' . This sign means ', 'assets/20230807203303402_164962_AA35.png', 0, ' Warning of narrow center road and curve ahead', 'Narrow bridge ahead', 'Warning of sharp narrow curve ahead', '2', 48, 'Narrow bridge ahead'),
(1125, 'When should you not turn right? ', NULL, 0, ' When you are driving a heavy vehicle towing a trailer.', 'When you are travelling on a slippery road ', ' In front of oncoming traffic', '3', 47, ' In front of oncoming traffic'),
(1126, 'When should you use a hooter?  ', NULL, 0, ' When pedestrians are crossing the road  ', 'For the safety of the public only ', ' When greeting people', '2', 47, 'For the safety of the public only '),
(1127, '. An ambulance has the right of way  ', NULL, 0, ' When carrying a patient', ' When sounding its siren ', 'When heading to the hospital', '2', 48, ' When sounding its siren '),
(1128, 'A cyclist\'s safety device is ', NULL, 0, ' A hooter ', ' Brakes ', 'A crash helmet', '3', 47, 'A crash helmet'),
(1129, 'An unbroken white line on the road on your right indicates that ', NULL, 0, 'You may overtake ', 'You may be overtaken ', 'You should not overtake', '3', 47, 'You should not overtake'),
(1130, 'When should you not turn right?  ', NULL, 0, ' At a controlled intersection', 'In front of oncoming traffic', 'When you may obstruct the course of other vehicles.', '2', 48, 'In front of oncoming traffic'),
(1131, 'An ambulance has the right of way ', NULL, 0, 'When flashing it\'s lights ', 'When rushing a patient to the hospital ', ' When sounding a siren', '3', 47, ' When sounding a siren'),
(1132, 'When you meet a vehicle displaying an \'L\' plate what do you do?', NULL, 0, 'Shout to the learner ', 'Use your hooter ', 'Leave enough gap and exercise extreme caution.', '3', 47, 'Leave enough gap and exercise extreme caution.'),
(1133, 'You should give right of way to pedestrians at', NULL, 0, ' The longitudinal lines ', 'The intersection', 'The zebra variety', '3', 48, 'The zebra variety'),
(1134, 'This sign is', 'assets/20230807203447115_740993_AA36.png', 0, 'A warning of a curve ahead', 'A warning of a double curve ahead', ' A warning of a sharp curve ahead', '2', 48, 'A warning of a double curve ahead'),
(1135, 'Which car goes first?', 'assets/20230714133613389_674057_P1.88.PNG', 0, 'A', 'B', 'C', '3', 47, 'C'),
(1136, 'Which car must stop? ', 'assets/20230714134011192_48130_PNG 65.PNG', 0, ' Car A ', 'Any of the two cars', 'Car B', '1', 48, ' Car A '),
(1137, 'Which car goes first?', 'assets/20230714133655668_273999_P1.89.PNG', 0, 'A', 'B', 'C', '1', 47, 'A'),
(1138, 'Which car has the right of way?', 'assets/20230714133922671_616503_p1.90.PNG', 0, 'A', 'B', 'C', '1', 49, 'A'),
(1139, '. This sign means ', 'assets/20230807203636219_776568_AA37.jpeg', 0, 'The road narrows to the left ahead', ' The road narrows to the right ahead  ', 'The road narrows centrally ahead', '3', 48, 'The road narrows centrally ahead'),
(1140, 'Where there are three traffic lanes, in which lane should you travel when you intend to turn to the right', NULL, 0, 'The centre lane', ' The right lane ', ' The left lane', '2', 48, ' The right lane '),
(1141, 'Which car goes first?', 'assets/20230714134048820_476180_P1.91.PNG', 0, 'A', 'B', 'C', '2', 49, 'B'),
(1142, 'Which car has the right of way?', 'assets/20230714134216108_166960_P1.92.PNG', 0, 'A', 'B', 'C', '1', 49, 'A'),
(1143, 'Which car goes first?', 'assets/20230714134320517_963721_P1.93.PNG', 0, 'A', 'B', 'B', '2', 49, 'B'),
(1144, 'Which car has the right of way?', 'assets/20230714134514460_810998_P1.94.PNG', 0, 'A', 'B', 'C', '3', 49, 'C'),
(1145, 'Which car goes first?', 'assets/20230714134603940_366708_181.PNG', 0, 'A', 'B', 'C', '1', 49, 'A'),
(1146, 'Which car goes lastly?', 'assets/20230714135023697_185005_PNG 67.PNG', 0, ' Car B', 'Car C ', 'Car A', '1', 48, ' Car B'),
(1147, 'This sign means', 'assets/20230813073213450_634768_BB1.PNG', 0, 'traffic lights out of order', 'traffic lights ahead', 'danger of robots in order ahead', '1', 49, 'traffic lights out of order'),
(1148, '. What is your precaution when the road on your right is marked by a double continuous white line?', NULL, 0, 'You may straddle the lines when you are turning to the right ', 'You may straddle the lines only with caution', 'You should not straddle the lines', '3', 48, 'You should not straddle the lines'),
(1149, 'Which car has the right of way? ', 'assets/20230714135453072_909850_PNG 68.PNG', 0, ' None', ' Car A', 'Car B', '3', 48, 'Car B'),
(1150, 'On what potion of the road will you drive when meeting other traffic or approaching a corner?  ', NULL, 0, 'On the left or near side of the road', 'On the right or near side of the road ', ' On the centre portion of the road', '1', 48, 'On the left or near side of the road'),
(1151, 'Which car goes first? ', 'assets/20230714135932564_466960_PNG 69.PNG', 0, 'None', 'Car B', 'Car A', '2', 48, 'Car B'),
(1152, 'Which car goes first?', 'assets/20230714135605334_746214_183.PNG', 0, 'A', 'B', 'C', '2', 49, 'B'),
(1153, 'This is a', 'assets/20230813073332913_460117_bb14.png', 0, 'Warning sign', 'Warning of danger sign ahead', 'Warning of a danger of variable nature', '3', 49, 'Warning of a danger of variable nature'),
(1154, ' Tractors and caterpillars are in which class of motor vehicles?', NULL, 0, 'Class 5', 'Class 3', ' Class 2', '1', 48, 'Class 5'),
(1155, 'Which car goes second', 'assets/20230807211711443_809865_AA2.jpeg', 0, 'A', 'B', 'C', '2', 49, 'B'),
(1156, 'Tractor is in which class', 'assets/20230813073509593_574725_bb8.jpeg', 0, 'Class 5', 'Class 3', 'Class 2', '1', 49, 'Class 5'),
(1157, 'Class 5 of motor vehicles is for ', NULL, 0, 'Light motor vehicles', 'Motor cycles ', ' Tractors and caterpillars', '3', 48, ' Tractors and caterpillars'),
(1158, 'Which car must give right of way ', 'assets/20230714135824268_248939_187.PNG', 0, 'A', 'B', 'C', '1', 49, 'A'),
(1159, 'Which car goes last? ', 'assets/20230807211804558_334986_aa25.PNG', 0, 'A', 'B', 'C', '2', 49, 'B'),
(1160, 'AT THIS POINT I SHOULD', 'assets/20230813073720090_33824_BB35.png', 0, 'NOT PASS THROUGH IF MY LOAD EXCEED THAT TONNAGE', 'NOT PASS IF MY NET WEIGHT EXCEED THAT WEIGHT', 'SEE THAT WEIGHT REISTRICTION SIGN', '2', 49, 'NOT PASS IF MY NET WEIGHT EXCEED THAT WEIGHT'),
(1161, 'What is the outstanding feature about a derestriction sign?', 'assets/20230813070519323_811019_bb25.gif', 0, ' It is mostly found on highways or major roads', ' It is coloured in blue while other informative signs are in black ', ' it is circular while other informative signs are rectangular in shape.', '3', 48, ' it is circular while other informative signs are rectangular in shape.'),
(1162, 'Which car goes first? ', 'assets/20230807212036605_352166_aa39.png', 0, 'car A', 'car B', 'car C', '3', 49, 'car C'),
(1163, 'Which car has the right of way?', 'assets/20230714140044580_962291_191.PNG', 0, 'A', 'B', 'C', '3', 49, 'C'),
(1164, 'Which car goes second? ', 'assets/20230714140111149_724474_192.PNG', 0, 'A', 'B', 'C', '1', 49, 'A'),
(1165, 'What is the sequence of the lights shown by a robot? ', NULL, 0, 'Green, Amber, Red ', 'Red, Green, Amber', 'Red, Amber, Green', '1', 48, 'Green, Amber, Red '),
(1166, 'Which car has the right of way?', 'assets/20230714140152541_38436_193.PNG', 0, 'A', 'B', 'C', '2', 49, 'B'),
(1167, 'Which car goes last? ', 'assets/20230714140232668_888357_194.PNG', 0, 'A', 'B', 'C', '2', 49, 'B'),
(1168, 'Which car goes second? ', 'assets/20230714140301964_290645_195.PNG', 0, 'A', 'B', 'C', '2', 49, 'B'),
(1169, 'Which car must stop? ', 'assets/20230714140340430_697580_196.PNG', 0, 'A', 'B', 'C', '2', 49, 'B'),
(1170, 'Which car goes second? ', 'assets/20230714140435285_371972_197.PNG', 0, 'A', 'B', 'C', '3', 49, 'C'),
(1171, 'Which car goes first? ', 'assets/20230714140515493_415374_198.PNG', 0, 'A', 'B', 'C', '2', 49, 'B'),
(1172, 'Which car goes first? ', 'assets/20230714140543021_901781_199.PNG', 0, 'A', 'B', 'C', '2', 49, 'B'),
(1173, 'Which car must stop? ', 'assets/20230714140617860_61699_200.PNG', 0, 'A', 'B', 'C', '2', 49, 'B'),
(1174, 'Which car goes first? ', 'assets/20230714141154767_628811_PNG 70.PNG', 0, 'Car A', 'Car B', 'The turning vehicle', '2', 48, 'Car B'),
(1175, 'At a Give Way sign I will', 'assets/20230813070552553_218033_bb17.PNG', 0, 'Give Way to traffic approaching from my right', 'Give way to traffic approaching from both sides and proceed if the road is clear', 'Stop and give way to oncoming traffic', '2', 48, 'Give way to traffic approaching from both sides and proceed if the road is clear'),
(1176, '. Which car goes first?', 'assets/20230714142345044_574414_PNG 71.PNG', 0, 'Car A', 'Car B', 'Car C', '1', 48, 'Car A'),
(1177, 'Followed by which car?', 'assets/20230714142518138_8679_PNG 71.PNG', 0, 'Car A', 'Car B', 'Car c', '2', 48, 'Car B'),
(1178, 'Which car goes first?', 'assets/20230714142956228_313558_PNG 72.PNG', 0, 'car A', 'car B', 'Car C', '2', 48, 'car B'),
(1179, 'Followed by which car?', 'assets/20230714143213931_890697_PNG 72.PNG', 0, 'Car A', 'car B', 'car C', '1', 48, 'Car A'),
(1180, 'What is a blind spot?', NULL, 0, ' A depression', 'A dangerous place', 'The portion not seen by mirrors ', '3', 48, 'The portion not seen by mirrors '),
(1181, 'What is hazardous perception?  ', NULL, 0, 'A dangerous place', 'An anticipation of what is in front', 'A wrong turn', '2', 48, 'An anticipation of what is in front'),
(1182, 'This sign means', 'assets/20230807154253292_735531_AA15.PNG', 0, 'Expect to be stopped for checking', 'V.I.D Ahead', 'Inspection for every car ahead be prepared', '1', 50, 'Expect to be stopped for checking'),
(1183, 'This sign means', 'assets/20230807154657732_207611_aa23.PNG', 0, 'An intersection', 'Rail road level crossing', 'Railway station', '2', 50, 'Rail road level crossing'),
(1184, 'Which car has the right of way?', 'assets/20230714143527458_764747_203.PNG', 0, 'A', 'B', 'C', '2', 50, 'B'),
(1185, 'Which car has the right of way?', 'assets/20230714143548562_677105_204.PNG', 0, 'A', 'B', 'C', '3', 50, 'C'),
(1186, 'Which car goes last? ', 'assets/20230714143632618_38153_205.PNG', 0, 'A', 'B', 'C', '3', 50, 'C'),
(1187, 'Which car is breaking the law?', 'assets/20230714143700819_416164_206.PNG', 0, 'A', 'B', 'C', '2', 50, 'B'),
(1188, 'Which car must stop?', 'assets/20230807155436891_141374_aa24.PNG', 0, 'A', 'B', 'C', '3', 50, 'C'),
(1189, 'Which car goes third ? ', 'assets/20230807155627643_304088_aa25.PNG', 0, 'A', 'B', 'C', '2', 50, 'B'),
(1190, 'What do you do when you see an aeroplane in your rear view mirror ', NULL, 0, 'I will exercise extreme caution ', ' I will adjust my mirror', ' I will slow down ', '2', 51, ' I will adjust my mirror'),
(1191, 'Which car goes lastly? ', 'assets/20230807155753964_368864_aa26.PNG', 0, 'A', 'B', 'C', '3', 50, 'C'),
(1192, 'This means', 'assets/20230807160001223_619076_aa27.PNG', 0, 'FARM AROUND', 'DANGER OF WILD ANIMALS', 'DANGER OF FARM ANIMALS AHEAD', '3', 50, 'DANGER OF FARM ANIMALS AHEAD'),
(1193, 'Which car must stop', 'assets/20230714144028706_619035_211.PNG', 0, 'A', 'B', 'C', '2', 50, 'B'),
(1194, 'Which car goes first', 'assets/20230714144055042_167079_212.PNG', 0, 'A', 'B', 'C', '2', 50, 'B'),
(1195, 'Which car goes first', 'assets/20230714144120538_362232_213.PNG', 0, 'A', 'B', 'C', '2', 50, 'B'),
(1196, 'Which car must give right of way?', 'assets/20230714144157971_343352_214.PNG', 0, 'A', 'B', 'C', '1', 50, 'A'),
(1197, 'Which car goes second? ', 'assets/20230714144241233_980110_215.PNG', 0, 'A', 'C', 'B', '3', 50, 'B'),
(1198, 'Which car goes first?', 'assets/20230714144310683_174692_216.PNG', 0, 'A', 'B', 'C', '2', 50, 'B'),
(1199, ' Which car must stop? ', 'assets/20230807160913910_531840_aa25.PNG', 0, 'A', 'B', 'C', '2', 50, 'B'),
(1200, 'Which car has the right of way?', 'assets/20230714144417778_804717_218.PNG', 0, 'A', 'B', 'C', '2', 50, 'B'),
(1201, 'Which car goes first', 'assets/20230807210205443_112611_AA38.jpeg', 0, 'All ', 'Car B', 'Car A', '3', 51, 'Car A'),
(1202, 'Which car goes lastly ', 'assets/20230807161054536_943406_AA7.PNG', 0, 'A', 'B', 'C', '3', 50, 'C'),
(1203, 'Which car has the right of way?', 'assets/20230714144621882_49878_220.PNG', 0, 'A', 'B', 'C', '2', 50, 'B'),
(1204, 'Which car must give right of way?', 'assets/20230714144702426_170495_221.PNG', 0, 'A', 'B', 'C', '2', 50, 'B'),
(1205, 'Which car goes last ? ', 'assets/20230714144752313_169272_222.PNG', 0, 'A', 'B', 'C', '3', 50, 'C'),
(1206, 'WHATS THE MEANING THERE', 'assets/20230807161406318_452599_aa13.PNG', 0, 'DIP HUMPS', 'MOUNTAINS', 'NONE OF THE ABOVE', '1', 50, 'DIP HUMPS'),
(1207, 'THIS SIGN MEANS', 'assets/20230807161635445_358839_A27.PNG', 0, 'RAIL ROAD LEVEL CROSSING', 'TRAFFIC LIGHTS AND RAIL ROAD CROSING AHEAD', 'TRAFFIC LIGHTS OUT OF ORDER', '3', 50, 'TRAFFIC LIGHTS OUT OF ORDER'),
(1208, 'THIS SIGN MEANS', 'assets/20230807161831735_139418_AA28.PNG', 0, 'GIVEWAY', 'STOP UNLESS UNLESS ROAD IS CLEAR ON ALL THE SIDES', 'STOP', '3', 50, 'STOP'),
(1209, 'What is the maximum speed limit in Zimbabwe? ', NULL, 0, '80km/hr', ' 80 km/hr/ heavy, 120km/hr small light', '120 km/hr', '2', 51, ' 80 km/hr/ heavy, 120km/hr small light'),
(1210, 'On a bridge one should not  ', NULL, 0, ' Accelarate ', 'Change gears', 'Overtake slow moving vehicles', '3', 51, 'Overtake slow moving vehicles'),
(1211, 'Fog lights are used ', NULL, 0, 'When parking', 'During a breakdown ', 'When it is misty', '3', 51, 'When it is misty'),
(1212, 'Do you switch your lights on when travelling at 6:00am ', NULL, 0, ' Yes but only on heavy vehicles', ' No ', ' Yes', '3', 51, ' Yes'),
(1213, 'When you are on a STRAIGHT AHEAD LANE you should ', NULL, 0, 'Reduce speed', ' Not turn at all ', 'Driving on side roads', '2', 51, ' Not turn at all '),
(1214, ' A seat belt is not necessary when ', NULL, 0, ' Reversing ', 'Driving in rural areas', ' Increase speed', '1', 51, ' Reversing '),
(1215, 'What is the use of park brakes? ', NULL, 0, 'To park at a laybye', 'To assist the foot brake', 'To keep the vehicle stationery', '3', 51, 'To keep the vehicle stationery'),
(1216, 'How do you stop on the road? ', NULL, 0, 'Slow down, check the mirror signal ', 'Check mirror, reduce speed, pull off then stop ', ' Reduce speed, pull off then stop', '2', 51, 'Check mirror, reduce speed, pull off then stop '),
(1217, 'What is the use of a clutch? ', NULL, 0, 'To reduce speed', 'To avoid noise when changing gears ', ' To disengage gears', '2', 51, 'To avoid noise when changing gears '),
(1218, 'A driver\'s medical certificate is valid for ', NULL, 0, '24 months', '12 months', '18 months', '2', 51, '12 months'),
(1219, 'What is the colour of reflectors at the front of a vehicle ', NULL, 0, 'Red reflectors', 'White reflectors', 'Yellow Reflecters', '2', 51, 'White reflectors'),
(1220, 'A restriction sign signifies..  ', NULL, 0, ' Do not cross', ' Drive with caution', 'Do not exceed stated speed ', '3', 51, 'Do not exceed stated speed '),
(1221, '. What are diverging lines? ', NULL, 0, ' Transverse lines', 'Lines crossing the road ', 'One which form two', '3', 51, 'One which form two'),
(1222, ' When do you indicate in a roundabout? ', NULL, 0, 'When slowing down', 'To caution other drivers', 'when going out', '3', 51, 'when going out'),
(1223, 'When parking a vehicle on the side of the road ', NULL, 0, ' Use tail lights', 'Use side lights ', 'Use park lights', '3', 51, 'Use park lights'),
(1224, 'At a pedestrian crossing place... ', NULL, 0, ' Keep to the extreme left side of the road', 'Use your hazards', ' Exercise caution and proceed if it is safe to do', '3', 51, ' Exercise caution and proceed if it is safe to do'),
(1225, 'On a rail crossing with open boom gates you should. ', NULL, 0, 'Stop and park ', 'Look both sides and proceed', ' Turn to the right', '2', 51, 'Look both sides and proceed'),
(1226, 'At a junction you should not... ', NULL, 0, 'Turn to the left ', 'Signal your intention', 'Turn right in front of oncoming traffic', '3', 51, 'Turn right in front of oncoming traffic'),
(1227, 'When you reach a laybye sign at night you should ', NULL, 0, 'Park on the left', 'Reduce speed', ' Put hazards', '2', 51, 'Reduce speed'),
(1228, 'Which car is breaking the law?', 'assets/20230715075824965_857169_226.PNG', 0, 'A', 'B', 'C', '2', 52, 'B'),
(1229, 'We find red reflectors ', NULL, 0, 'At the back of a vehicle', 'At the front of a vehicle', ' On both sides of the vehicle', '1', 51, 'At the back of a vehicle'),
(1230, 'This sign in Bulawayo CBD means', 'assets/20230813100506173_474097_bb23.jpg', 0, 'Narrow road ahead', 'Road Narrows to the centre', 'Narrow bridge ahead', '3', 52, 'Narrow bridge ahead'),
(1231, 'Which car must stop ', 'assets/20230715075936777_71062_228.PNG', 0, 'CAR A', 'CAR B', 'CAR C', '2', 52, 'CAR B'),
(1232, 'Which car goes second?', 'assets/20230715080002768_513854_229.PNG', 0, 'CAR A', 'CAR B', 'CAR C', '1', 52, 'CAR A'),
(1233, 'Before lane changing, the procedures are..  ', NULL, 0, 'Signal intention, check mirror, check blind spot', 'Check blind spot, check mirror, signal intention', 'Check mirror, check blind spot, signal intention', '3', 51, 'Check mirror, check blind spot, signal intention'),
(1234, 'Which car goes first? ', 'assets/20230715080047663_952092_230.PNG', 0, 'A', 'B', 'C', '2', 52, 'B'),
(1235, 'Which car goes last? ', 'assets/20230715080117239_542886_231.PNG', 0, 'A', 'B', 'C', '3', 52, 'C'),
(1236, 'Which car must give right of way', 'assets/20230715080154575_578446_232.PNG', 0, 'A', 'B', 'C', '1', 52, 'A'),
(1237, 'This sign means', 'assets/20230813101002933_393884_bb14.png', 0, 'DANGER OF VARIABLE NATURE BEHIND', 'DANGER OF VARIABLE NATURE IN THE OPPOSITE ROAD', 'DANGER OF VARIABLE NATURE AHEAD', '3', 52, 'DANGER OF VARIABLE NATURE AHEAD'),
(1238, 'Which car goes second? ', 'assets/20230715080320173_449457_234.PNG', 0, 'A', 'B', 'C', '1', 52, 'A'),
(1239, 'Which car must give right of way', 'assets/20230715080402670_664502_235.PNG', 0, 'A', 'B', 'C', '1', 52, 'A'),
(1240, 'Which car goes last? ', 'assets/20230715080450429_2038_236.PNG', 0, 'A', 'B', 'C', '2', 52, 'B'),
(1241, 'THIS SIGN MEANS THAT', 'assets/20230813101134741_122955_bb30.png', 0, 'YOU MAY PARK YOUR VEHICLE ', 'YOU MAY NOT PARK HERE', 'ONLY SMALL CARS ALLOWED TO PASS', '1', 52, 'YOU MAY PARK YOUR VEHICLE '),
(1242, 'A D.D.C. is valid for how long?', NULL, 0, '12 Months', '48 Months ', '56 Months', '2', 51, '48 Months '),
(1243, 'Which car is breaking the law?', 'assets/20230715080612357_767688_238.PNG', 0, 'A', 'B', 'C', '2', 52, 'B'),
(1244, 'Which car has the right of way ?', 'assets/20230715080650325_361629_239.PNG', 0, 'A', 'B', 'C', '2', 52, 'B'),
(1245, 'What do you do when the oncoming vehicle does not dip its lights? ', NULL, 0, ' Do not dip your lights ', 'Slow down and dip your lights', 'Slow down and look slightly to the left ', '3', 51, 'Slow down and look slightly to the left '),
(1246, 'Which car must stop', 'assets/20230715080719916_821187_240.PNG', 0, 'A', 'B', 'C', '2', 52, 'B'),
(1247, 'Which car goes second? ', 'assets/20230715080757733_627122_241.PNG', 0, 'A', 'B', 'C', '1', 52, 'A'),
(1248, 'Which car goes first? ', 'assets/20230715080825772_905007_242.PNG', 0, 'A', 'B', 'C', '2', 52, 'B'),
(1249, 'Which car goes first? ', 'assets/20230715080908038_432615_243.PNG', 0, 'A', 'B', 'C', '1', 52, 'A'),
(1250, 'Which is the correct driving procedure when turning to the right?', NULL, 0, 'Check mirror, show your intention, slow down and select suitable gear', 'Check mirror, select suitable gear, slow down, show intention and brake', 'Check mirror, show intention, brake, slow down and select suitable gear', '3', 53, 'Check mirror, show intention, brake, slow down and select suitable gear'),
(1251, 'Which car goes last? ', 'assets/20230715081015164_441171_244.PNG', 0, 'A', 'B', 'C', '2', 52, 'B'),
(1252, 'Which car has the right of way? ', 'assets/20230715081051979_911535_245.PNG', 0, 'A', 'B', 'C', '2', 52, 'B'),
(1253, 'This sign below means', 'assets/20230813100649711_888765_bb17.PNG', 0, 'Give right of way to cars from right', 'Give right of way to cars from your left', 'Stop and give right of way to oncoming traffic', '1', 52, 'Give right of way to cars from right'),
(1254, 'What are the colours of reflectors at the rear of a vehicle? ', NULL, 0, 'Blue. ', ' White ', 'Red', '3', 53, 'Red'),
(1255, 'Which car has the right of way? ', 'assets/20230715081309009_46698_247.PNG', 0, 'C', 'A', 'B', '3', 52, 'B'),
(1256, 'Which car goes last? ', 'assets/20230715081349914_618263_248.PNG', 0, 'A', 'B', 'C', '2', 52, 'B'),
(1257, 'Which car goes second? ', 'assets/20230715081428049_173197_249.PNG', 0, 'B', 'A', 'C', '2', 52, 'A'),
(1258, 'Which car has the right of way? ', 'assets/20230715081505184_233645_250.PNG', 0, 'A', 'B', 'C', '2', 52, 'B'),
(1259, 'Which car has the right of way? ', 'assets/20230715081803801_55381_251.PNG', 0, 'A', 'B', 'BOTH', '1', 54, 'A'),
(1260, 'Which car goes last? ', 'assets/20230715081845473_95820_252.PNG', 0, 'A', 'C', 'B', '2', 54, 'C'),
(1261, 'WHATS THE COLOR OR PRIVATE PLATES FOR VEHICLES IN HARARE', 'assets/20230813103235037_954277_BB37.jpeg', 0, 'BLACK WITH YELLOW BACKGROUND', 'BLACK WITH WHITE BACKGROUND', 'YELLOW', '1', 54, 'BLACK WITH YELLOW BACKGROUND'),
(1262, 'Which car has the right of way?', 'assets/20230715082109838_816046_254.PNG', 0, 'A', 'C', 'B', '2', 54, 'C'),
(1263, 'Which car must stop? ', 'assets/20230715082143648_378247_255.PNG', 0, 'NONE', 'A', 'B', '2', 54, 'A'),
(1264, 'Which car goes second? ', 'assets/20230715082219502_883294_256.PNG', 0, 'C', 'B', 'A', '1', 54, 'C'),
(1265, 'THIS MEANS', 'assets/20230813103343557_900028_bb12.PNG', 0, 'ROAD NARROWS TO LEFT', 'ROAD NARROWS TO THE CENTRE', 'ROAD NARROWS TO THE RIGHT', '2', 54, 'ROAD NARROWS TO THE CENTRE'),
(1266, 'Which car goes first? ', 'assets/20230715082340503_16190_258.PNG', 0, 'EITHER A OR B', 'A', 'B', '3', 54, 'B'),
(1267, 'THIS SIGN MEANS WHAT', 'assets/20230813103519853_894232_bb22.jpg', 0, 'RAIL LEVEL CROSSING AHEAD', 'RAIL WAY LINE CLOSED', 'TRAFFIC FOR TRAINS', '1', 54, 'RAIL LEVEL CROSSING AHEAD'),
(1268, 'Which car goes first ', 'assets/20230715082502949_418975_260.PNG', 0, 'A', 'B', 'C', '2', 54, 'B'),
(1269, 'Which car must give right of way?', 'assets/20230715082534244_661923_261.PNG', 0, 'A', 'B', 'BOTH', '2', 54, 'B'),
(1270, 'Which car must give right of way?', 'assets/20230715082612404_396816_262.PNG', 0, 'ALL', 'B', 'A', '3', 54, 'A'),
(1271, 'Which car has the right of way?', 'assets/20230715082701133_646726_263.PNG', 0, 'A', 'C', 'B', '3', 54, 'B'),
(1272, 'Which car has the right of way?', 'assets/20230715082724789_401093_264.PNG', 0, 'C', 'A', 'B', '1', 54, 'C'),
(1273, 'Which car goes last?', 'assets/20230715082819243_139059_265.PNG', 0, 'A', 'C', 'B', '2', 54, 'C'),
(1274, 'Which car is breaking the law?', 'assets/20230715082913267_172466_266.PNG', 0, 'NONE', 'A', 'B', '3', 54, 'B'),
(1275, 'Which car goes first? ', 'assets/20230715083047852_114095_267.PNG', 0, 'EITHER THE TWO', 'A', 'B', '3', 54, 'B'),
(1276, 'Which car must give right of way?', 'assets/20230715083124148_559524_268.PNG', 0, 'ALL', 'B', 'A', '3', 54, 'A'),
(1277, 'Which are the documents required for one to drive? ', NULL, 0, 'Licence, registration book and insurance', ' Licence, insurance and clearance certificate ', ' Licence or learners licence', '3', 53, ' Licence or learners licence'),
(1278, 'Which car goes second? ', 'assets/20230715083208259_970818_269.PNG', 0, 'C', 'B', 'A', '2', 54, 'B'),
(1279, 'A certificate of competence is valid for? ', NULL, 0, '1 year', '1⁄2 Year', ' 11⁄2 year', '1', 53, '1 year'),
(1280, 'Which car goes first? ', 'assets/20230715083356466_930958_270.PNG', 0, 'B', 'C', 'A', '3', 54, 'A'),
(1281, 'Which car must stop? ', 'assets/20230715083546226_566443_271.PNG', 0, 'NONE', 'A', 'B', '2', 54, 'A'),
(1282, 'When do you indicate at a roundabout?  ', NULL, 0, 'When entering the roundabout', 'When you are in the roundabout ', 'When going out of the roundabout ', '3', 53, 'When going out of the roundabout '),
(1283, 'Which car has the right of way?', 'assets/20230715083656472_503679_272.PNG', 0, 'C', 'A', 'B', '3', 54, 'B'),
(1284, 'Which car goes second? ', 'assets/20230715083745000_681701_273.PNG', 0, 'C', 'A', 'B', '3', 54, 'B'),
(1285, 'Which car must stop? ', 'assets/20230715083818840_314335_274.PNG', 0, 'BOTH', 'A', 'B', '3', 54, 'B'),
(1286, 'When parked at a lay-by you..  ', NULL, 0, 'Put the head lights on', ' Put the brakes on', ' Put off the headlights and put on the park lights', '3', 53, ' Put off the headlights and put on the park lights'),
(1287, 'Which car goes second? ', 'assets/20230715083849792_969452_275.PNG', 0, 'C', 'A', 'B', '1', 54, 'C'),
(1288, '. When are you allowed to overtake?', NULL, 0, ' When the broken white line is on the right of the solid line ', 'When the broken white line is on the left of the solid line', 'When entering a sharp comer', '2', 53, 'When the broken white line is on the left of the solid line'),
(1289, '. Which of the following is the correct change down procedure?', NULL, 0, 'Depress clutch, engage the required gear, release accelerator, release clutch and accelerate', 'Release accelerator, depress clutch, engage required gear, release clutch and accelerator and accelerate as required ', 'None of the above', '2', 53, 'Release accelerator, depress clutch, engage required gear, release clutch and accelerator and accelerate as required '),
(1290, 'When driving at 90km/h you leave a gap of... ', NULL, 0, '4 cars ', '8 Cars', '6 cars', '3', 53, '6 cars'),
(1291, 'When a heavy vehicle has broken down it is shown by... ', NULL, 0, 'Red reflective triangle placed 30m-50m rear ', 'Red reflective triangle placed 30m rear and front', ' Red reflective triangle placed 50m rear and front', '1', 53, 'Red reflective triangle placed 30m-50m rear '),
(1292, 'When going straight at an uncontrolled intersection         ', NULL, 0, 'Turn to the left  ', 'Do not turn', 'Turn right', '2', 53, 'Do not turn'),
(1293, 'Which pedal is on the right? ', NULL, 0, 'Clutch', 'Brake', 'Accelerator', '3', 53, 'Accelerator'),
(1294, 'Which foot do you use to depress the brake pedal ', NULL, 0, ' Left ', ' Left and right', 'Right ', '3', 53, 'Right '),
(1295, 'Which car goes first? ', 'assets/20230715085427265_538443_276.PNG', 0, 'B', 'C', 'A', '1', 55, 'B'),
(1296, 'What is the purpose of the accelerator?', NULL, 0, 'To disengage drive noise ', ' To disengage', 'To increase speed', '3', 53, 'To increase speed'),
(1297, 'Which car goes first? ', 'assets/20230715085531338_75694_277.PNG', 0, 'EITHER OF THE TWO', 'A', 'B', '3', 55, 'B'),
(1298, 'Which car must stop ', 'assets/20230715085608817_899282_278.PNG', 0, 'BOTH', 'A', 'B', '3', 55, 'B'),
(1299, 'Which car must stop ', 'assets/20230715085641113_854810_279.PNG', 0, 'NONE', 'A', 'B', '2', 55, 'A'),
(1300, 'What colour of reflectors are put on the side of the vehicle ', NULL, 0, ' White', ' Red ', 'Yellow', '3', 53, 'Yellow'),
(1301, 'Which car goes second? ', 'assets/20230715085729217_808297_280.PNG', 0, 'C', 'B', 'A', '1', 55, 'C'),
(1302, 'Which car goes lastly? ', 'assets/20230715085802048_412075_281.PNG', 0, 'B', 'C', 'A', '3', 55, 'A');
INSERT INTO `questions` (`id`, `question_text`, `img_insert`, `option_image`, `option_a`, `option_b`, `option_c`, `correct_option`, `exam_id`, `answer`) VALUES
(1303, 'Which colors are on a chevron pattern? ', NULL, 0, 'Red, green and yellow', 'Red, White and yellow', 'Red and yellow', '3', 53, 'Red and yellow'),
(1304, 'Which car goes first? ', 'assets/20230715085844703_445448_282.PNG', 0, 'EITHER A OR B', 'A', 'B', '3', 55, 'B'),
(1305, 'Which car must give the right of way?', 'assets/20230715085922921_539921_283.PNG', 0, 'BOTH', 'A', 'B', '2', 55, 'A'),
(1306, '. In which class of motor vehicles do we find a Valesolex? ', NULL, 0, 'Class 5', 'Class 3 ', ' Class 4', '2', 53, 'Class 3 '),
(1307, 'Which car goes last? ', 'assets/20230715090016815_638926_284.PNG', 0, 'C', 'A', 'B', '3', 55, 'B'),
(1308, 'Which car goes first? ', 'assets/20230715090138494_843124_285.PNG', 0, 'THE CONTROLLED CAR', 'A', 'B', '2', 55, 'A'),
(1309, 'Before you turn you should ', NULL, 0, 'Check both sides', ' Signal ', 'Accelerate ', '2', 53, ' Signal '),
(1310, 'Which car goes last? ', 'assets/20230715090223279_634571_286.PNG', 0, 'A', 'B', 'C', '2', 55, 'B'),
(1311, 'Which car is breaking the law?', 'assets/20230715090311189_441543_287.PNG', 0, 'NONE', 'A', 'B', '3', 55, 'B'),
(1312, '. You need extra caution when', NULL, 0, 'Overtaking', ' Turning', 'Reversing', '3', 53, 'Reversing'),
(1313, 'Which car goes last? ', 'assets/20230715090359029_671193_288.PNG', 0, 'A', 'C', 'B', '2', 55, 'C'),
(1314, 'A triangle is an insignia of which class', NULL, 0, 'Informative', ' Danger waming ', 'Regulatory', '2', 53, ' Danger waming '),
(1315, 'Which car has the right of way?', 'assets/20230715090434974_9078_289.PNG', 0, 'C', 'A', 'B', '2', 55, 'A'),
(1316, 'Which car has the right of way?', 'assets/20230715090510805_262520_290.PNG', 0, 'A', 'C', 'B', '3', 55, 'B'),
(1317, 'Which car goes first? ', 'assets/20230715090553637_73258_291.PNG', 0, 'EITHER OF THE TWO', 'A', 'B', '3', 55, 'B'),
(1318, 'Which pedal is placed between the two other pedals ', NULL, 0, 'Clutch ', ' Accelerator', 'Brake', '3', 53, 'Brake'),
(1319, 'Which car must stop ', 'assets/20230715090707732_470620_292.PNG', 0, 'BOTH', 'A', 'B', '3', 55, 'B'),
(1320, ' What is not the correct sequence of robot light ', 'assets/20230813075552708_611129_bb10.png', 0, 'Red, Amber, Green', 'Red, Green, Amber', 'Green, Amber, Red', '1', 53, 'Red, Amber, Green'),
(1321, 'Which car goes first? ', 'assets/20230715090801555_606023_293.PNG', 0, 'B', 'A', 'EITHER B OR A', '2', 55, 'A'),
(1322, 'Which car must give right of way ', 'assets/20230715090836868_808257_294.PNG', 0, 'B', 'A', 'NONE', '2', 55, 'A'),
(1323, 'Which car goes second? ', 'assets/20230715090937292_263368_295.PNG', 0, 'C', 'B', 'A', '2', 55, 'B'),
(1324, 'What is the rule of Zimbabwean roads? ', NULL, 0, ' To follow the imposed speed limit ', 'To keep to the left and to give right of way to traffic approaching from the right ', 'To drive below 60km/hr in urban areas', '2', 53, 'To keep to the left and to give right of way to traffic approaching from the right '),
(1325, 'Which car goes second? ', 'assets/20230715091028228_546006_296.PNG', 0, 'B', 'A', 'C', '3', 55, 'C'),
(1326, 'Which car goes first? ', 'assets/20230715091207474_643829_297.PNG', 0, 'EITHER OF THE TWO', 'A', 'B', '3', 55, 'B'),
(1327, 'Which car must give right of way? ', 'assets/20230715091244386_929175_298.PNG', 0, 'ALL', 'B', 'A', '3', 55, 'A'),
(1328, 'Which car goes first? ', 'assets/20230715091315138_531009_299.PNG', 0, 'B', 'C', 'A', '3', 55, 'A'),
(1329, 'Which car goes second? ', 'assets/20230715091344826_588778_300.PNG', 0, 'C', 'B', 'A', '2', 55, 'B'),
(1330, 'When involved in a serious accident I should report the case to the police within a period of  ', NULL, 0, '48 hours', '24 minutes', '24 hours', '3', 53, '24 hours'),
(1331, 'What do you use to park your car?  ', NULL, 0, ' Footbrakes', ' Hooter ', ' Handbrake', '3', 53, ' Handbrake'),
(1332, 'What is the incorrect sequence of a robot?', NULL, 0, 'Amber, Red, Green ', 'Red, Amber, Green ', 'Green, Amber , Red', '2', 56, 'Red, Amber, Green '),
(1333, 'I may park my vehicle not closer to the corner than. ', NULL, 0, '6.5m', '8m ', '7.5m', '3', 56, '7.5m'),
(1334, 'A continuous white line the centre of the road may? ', NULL, 0, 'Be crossed if the road ahead is clear.', 'Not be crossed for the purpose of overtaking', 'Be crossed only in highways.', '2', 56, 'Not be crossed for the purpose of overtaking'),
(1335, 'THIS SIGN WARNS OF AT ', 'assets/20230813194701146_644251_bb46.png', 0, 'A SHARP CURVE AHEAD ', 'DOUBLE CURVE AHEAD ', ' THAT ROAD NARROWS TO YOUR LEFT', '1', 57, 'A SHARP CURVE AHEAD '),
(1336, 'WHERE DO WE FIND A GRID? ', NULL, 0, 'A IN BIG COMPANIES', 'IN FARMS ', ' IN BIG TOWNS', '2', 57, 'IN FARMS '),
(1337, 'AT A STEEP DESCENT WHAT DO YOU DO? ', NULL, 0, 'A CHANGE DOWN TO A SUITABIX GEAR ', 'PUT ON HANDBRAKES ', 'DO NOT OVERTAKE', '1', 57, 'A CHANGE DOWN TO A SUITABIX GEAR '),
(1338, 'AT PEDESTRIAN CROSSING PLACE ', NULL, 0, 'YOU GIVE WAY TO TRAFFIC ON YOUR RIGHT ', 'GIVE WAY TO CYCLIST ', ' GIVE WAY TO PEDESTRIANS', '3', 57, ' GIVE WAY TO PEDESTRIANS'),
(1339, 'Direction arrows used in conjunction with prohibition lines on the road surface. ', NULL, 0, 'Are for information purposes only.', 'Relate to taxi drivers only. ', 'Have a regulatory effect', '3', 56, 'Have a regulatory effect'),
(1340, 'This sign indicates that I may   ', 'assets/20230808052316124_975529_aa40.png', 0, 'Make a three point turn.', 'Not make a U-turn', 'Turn right', '2', 56, 'Not make a U-turn'),
(1341, 'WHERE DO FIND A PHYSICAL BARRIER?', NULL, 0, ' A. ON HIGHWAYS', ' B. IN BIG FIRMS OR BORDERS ', 'C. IN CITY CENTERS', '2', 57, ' B. IN BIG FIRMS OR BORDERS '),
(1342, 'WHAT HAPPENS IF YOU DISOBEY A DANGER WARNING SIGN? ', NULL, 0, 'A. YOU MAY INVOLVED IN AN ACCIDENT ', 'B. YOU MAY ARRESTED AND SENT TO JAIL ', 'C. YOU MAY DAMAGE YOUR CAR', '1', 57, 'A. YOU MAY INVOLVED IN AN ACCIDENT '),
(1343, 'IN RURAL AREAS WHERE TRAFFIC IS NOT CONTROLLED', NULL, 0, ' A GIVE WAY TO TRAFFIC FROM YOUR RIGHT ', ' B. GIVE WAY TO TRAFFIC WHICH ENTERS THE JUNCTION BEFORE YOU', ' C. GIVE WAY TO TRAFFIC FROM YOUR LEFT', '2', 57, ' B. GIVE WAY TO TRAFFIC WHICH ENTERS THE JUNCTION BEFORE YOU'),
(1344, 'What must you do before you change direction ? ', NULL, 0, 'SEE IF THE ROAD IS CLEAR AND DO ALL PROCEDURES', 'ADD SOME FUEL', 'CHECK ROAD ON YOUR LEFT', '1', 56, 'SEE IF THE ROAD IS CLEAR AND DO ALL PROCEDURES'),
(1345, 'WHEN DRIVING A HEAVY VEHICLE WHAT DO YOU DO AT A RAILROAD LEVEL CROSSING  ', NULL, 0, 'A. SLOW DOWN IF THERE IS NO TRAIN YOU CAN PROCEED ', 'B. TAP YOUR HORN', ' C. STOP AND CHECK IF IT IS SAFE THEN YOU CAN PROCEED', '3', 57, ' C. STOP AND CHECK IF IT IS SAFE THEN YOU CAN PROCEED'),
(1346, ' WHEN APPROACHING A TRAFFIC CIRCLE YOU GIVE WAY TO ', NULL, 0, 'TRAFFIC FROM THE LEFT ', ' BUSES ONLY', 'TRAFFIC ALREADY IN THE CIRCLE', '3', 56, 'TRAFFIC ALREADY IN THE CIRCLE'),
(1347, 'WHEN YOU SEE AN ANIMAL CROSSING SIGN ', NULL, 0, 'A. CHANGE TO  A SUITABLE GEAR  ', 'B. REDUCE SPEED AND BE ALERT ', 'C. STOP AND CHECK FOR ANIMALS', '2', 57, 'B. REDUCE SPEED AND BE ALERT '),
(1348, 'WHEN YOU SEE WARNING OF A STOP SIGN OR A GIVE WAY SIGN ', NULL, 0, 'A. SLOW DOWN AND EXPECT TO STOP OR GIVE WAY TO CROSSING TRAFFIC ', 'B. REDUCE SPEED AND BE ALERT ', 'C. GIVE WAY TO PEDESTRIAN CROSSING', '1', 57, 'A. SLOW DOWN AND EXPECT TO STOP OR GIVE WAY TO CROSSING TRAFFIC '),
(1349, 'WHAT SIGN IS PUT WHEN A HEAVY VEHICLE IS STATIONERY? ', NULL, 0, 'A. A DANGER WARNING SIGN', ' B. A STOP SIGN', ' C. A RED REFLECTIVE TRIANGLE', '3', 57, ' C. A RED REFLECTIVE TRIANGLE'),
(1350, 'A DETOUR SIGN WARNS ', 'assets/20230813194915027_987167_bb47.jpg', 0, ' YOU MUST SLOW DOWN TO FOLLOW DETOUR ', ' THE FOAD IS CLOSED ', 'THAT THERE IS A SLEEPER ROAD AHEAD', '1', 57, ' YOU MUST SLOW DOWN TO FOLLOW DETOUR '),
(1351, 'YOU DIP YOUR LIGHTS AT NIGHT ', NULL, 0, 'WHEN FOLLOWING BEHIND ANOTHER VEHICLE', ' WHEN TRAVELLING IN FRONT OF ANOTHER VEHICLE ', 'WHEN APPROACHING A PEDESTRIAN CROSSING', '1', 56, 'WHEN FOLLOWING BEHIND ANOTHER VEHICLE'),
(1352, 'A TWO-WAY TRAFFIC WARNS THAT ', NULL, 0, 'A. THE ROAD IS BEING USED BY TRAFFIC GOING THE SAME DIRECTION  ', 'B.THE ROAD IS BEING USED BY TRAFFIC FROM OPPOSITE DIRECTIONS  ', 'C. GIVE WAY TO CROSSING TRAFFIC', '2', 57, 'B.THE ROAD IS BEING USED BY TRAFFIC FROM OPPOSITE DIRECTIONS  '),
(1353, 'YOU MAY CROSS OR STRADDLE THE BROKEN YELLOW LINE ', NULL, 0, ' WHEN OVERTAKING SLOW MOVING VEHICLE', 'WHEN OVERTAKING TRAFFIC TURNING TO THE LEFT', 'WHEN OVERTAKING TRAFFIC TURNING TO THE RIGHT', '3', 56, 'WHEN OVERTAKING TRAFFIC TURNING TO THE RIGHT'),
(1354, 'NEVER OVERTAKE ', NULL, 0, 'A. AT NIGHT', ' B. WHEN IT IS RAINING ', 'C. WHEN PASSING A NARROW BRIDGE', '3', 57, 'C. WHEN PASSING A NARROW BRIDGE'),
(1355, 'WHEN TRAVELLING AT 30 KM/HR BEHIND ANOTHER VEHICLE WHICH YOU DO NOT WANT TO OVERTAKE YOU LEAVE A GAP OF', NULL, 0, '5 CARS', ' 6 CARS ', '2 CARS', '3', 56, '2 CARS'),
(1356, 'A DE-RESTRICTION SIGN MEANS ', NULL, 0, 'A. PREVIOUSLY IMPOSED SPEED LIMIT IS CANCELLED ', 'B. OVERTAKING IS PROHIBITED ', 'C. ROAD IS CLOSED', '1', 57, 'A. PREVIOUSLY IMPOSED SPEED LIMIT IS CANCELLED '),
(1357, 'WHAT IS ZIMBABWE KNOWN AS', NULL, 0, ' A. ANIMAL COUNTRY ', 'B. FOOD COUNTRY ', 'C. INDEPENDENT COUNTRY', '1', 57, ' A. ANIMAL COUNTRY '),
(1358, 'WHAT MUST YOU DO WHEN YOUR CAR FAILED TO MOVE UNDER ITS OWN POWER', NULL, 0, 'MOVE IT TO WHICHEVER SIDE OF THE ROAD', 'MOVE IT TO SUCH A POSITION THAT IT WILL NOT ABSTRACT OTHER TRAFFIC ', 'PUT THE RED TRIANGLE SIGN AT THE BACK ONLY', '2', 56, 'MOVE IT TO SUCH A POSITION THAT IT WILL NOT ABSTRACT OTHER TRAFFIC '),
(1359, 'A GRAVEL ROAD SIGN MEANS ', NULL, 0, 'A. ROAD WORKS AHEAD', ' B. END OF A TARRED ROAD', ' C. FOLLOW DETOUR', '2', 57, ' B. END OF A TARRED ROAD'),
(1360, 'VEHICLE CHECK AHEAD SIGN MEANS SLOW DOWN BECAUSE OF ', NULL, 0, 'A. MOTOR MECHANIC AHEAD ', 'B. VEHICLE INSPECTION OR POLICE AHEAD ', 'C. INSTRUCTOR AHEAD', '2', 57, 'B. VEHICLE INSPECTION OR POLICE AHEAD '),
(1361, 'WHEN THE ROAD NARROWS CENTRAL AHEAD ', NULL, 0, 'A. KEEP LEFT ', 'B. KEEP TO YOUR LANE ', 'C. KEEP TO CENTER LANE', '3', 57, 'C. KEEP TO CENTER LANE'),
(1362, 'WHAT MUST YOU DO IF YOU LEAVE A MOTOR VEHICLE UNATTENDED?', NULL, 0, 'PUT INDICATORS', ' SWITCH ON LIGHTS ', ' SWITCH OFF ENGINE AND PUT ON HANDBRAKE OR PARKING BRAKE', '3', 56, ' SWITCH OFF ENGINE AND PUT ON HANDBRAKE OR PARKING BRAKE'),
(1363, 'A SLIPPERY ROAD SIGN MEANS ', NULL, 0, 'A.  A TWO WAY TRAFFIC ', 'B. DO NOT DRIVE AT NIGHT ', 'C. THE ROAD IS WET', '3', 57, 'C. THE ROAD IS WET'),
(1364, 'WHAT IS THE RULE OF THE ROAD IN ZIMBABWE? ', NULL, 0, 'A .NEVER TURN LEFT ', 'B. KEEP LEFT AND GIVE THE RIGHT OF WAY TO TRAFFIC COMING FROM THE ROAD ON YOUR RIGHT INCLUDING CYCLISTS NEVER TURN RIGHT IN FACE OF ONCOMING TRAFFIC ', 'C. NEVER STOP ON A GREEN LIGHT', '2', 57, 'B. KEEP LEFT AND GIVE THE RIGHT OF WAY TO TRAFFIC COMING FROM THE ROAD ON YOUR RIGHT INCLUDING CYCLISTS NEVER TURN RIGHT IN FACE OF ONCOMING TRAFFIC '),
(1365, 'IN ZIMBABWE WHICH AGE IS ALLOWED TO DRIVE A MOTOR VEHICLE', NULL, 0, '16 AND ABOVE', '18 AND ABOVE ', '20 AND ABOVE', '1', 56, '16 AND ABOVE'),
(1366, 'BEFORE YOU DRIVE A MOTOR VEHICLE YOU MUST HAVE', NULL, 0, 'REGISTRATION BOOK INSURANCE AND VEHICLE LICENSE', ' ENOUGH MONEY AND PETROL', 'LEARNER\'S OR DRIVER\'S LICENSE', '3', 56, 'LEARNER\'S OR DRIVER\'S LICENSE'),
(1367, 'WHAT IS THE DIFFERENT BETWEEN A DANGER WARNING SIGN AND A REGULATORY SIGN?  ', NULL, 0, 'A. A DANGER WARNING SIGN HAS A CIRCLE', '  B. A REGULATORY SIGN IS FOUND IN TOWN  ', 'C. A DANGER WARNING SIGN WARNS OF DANGER AND A REGULATORY SIGN HAS THE FACE OF LAW', '3', 57, 'C. A DANGER WARNING SIGN WARNS OF DANGER AND A REGULATORY SIGN HAS THE FACE OF LAW'),
(1368, 'AT A PEDESTRIAN CROSSING OR A ZEBRA VARIETY ', NULL, 0, ' INCREASE SPEED', 'CONSIDER THE RIGHT OF WAY TO THE PEDESTRIAN ', 'USE YOUR HOOTER', '2', 56, 'CONSIDER THE RIGHT OF WAY TO THE PEDESTRIAN '),
(1369, 'ON WHICH SIDE MUST YOU OVERTAKE? ', NULL, 0, 'A ON THE LEFT ', 'B. ON A STEEP ASCENT', ' C. ON THE RIGHT', '3', 57, ' C. ON THE RIGHT'),
(1370, 'WHEN MEETING A VEHICLE DISPLAYING AN \"L\" PLATE ', NULL, 0, 'YOU USE YOUR HOOTER', 'EXERCISE CAUTION', ' FLASH YOUR LIGHTS', '2', 56, 'EXERCISE CAUTION'),
(1371, 'WHAT MUST YOU DO WHEN FILLING YOUR CAR WITH FUEL?', NULL, 0, ' A. MAKE SURE THAT THERE IS NO ONE IN THE CAR ', 'B. MAKE SURE THE CAR HAS ENOUGH PRESSURE ', 'C. SWITCH OF ENGINE SEE THAT THERE IS NO NAKED FLAME NEAR THE VEHICLE', '3', 57, 'C. SWITCH OF ENGINE SEE THAT THERE IS NO NAKED FLAME NEAR THE VEHICLE'),
(1372, 'WHEN CAN YOU GO THROUGH A RED ROBOT', NULL, 0, ' WHEN YOU ARE GOING STRAIGHT', 'WHEN THE ROAD IS CLEAR ', 'WHEN THERE IS GREEN ARROW POINTING TO YOUR DIRECTION', '3', 56, 'WHEN THERE IS GREEN ARROW POINTING TO YOUR DIRECTION'),
(1373, 'This sign usual find  where', 'assets/20230808052520545_167875_aa9.PNG', 0, 'When there is an accident ahead', 'Danger', 'Danger of variable nature', '3', 56, 'Danger of variable nature'),
(1374, 'WHO GOES FIRST?', 'assets/20230715101354785_671655_25.PNG', 0, 'A', 'B', 'C', '1', 56, 'A'),
(1375, 'WHO IS BREAKING THE LAW', 'assets/20230715101448625_991197_24.PNG', 0, 'A', 'B', 'C', '2', 56, 'B'),
(1376, 'WHAT IS THE MOST IMPORTANT THING IN A BUS?', NULL, 0, 'WHEEL SPANNER ', 'PASSENGER ', 'AN AXE', '2', 56, 'PASSENGER '),
(1377, 'WHO IS BREAKING THE LAW?', 'assets/20230715101723760_608368_23.PNG', 0, 'A', 'B', 'C', '2', 56, 'B'),
(1378, ' How many trailers should a heavy vehicle draw ? ', NULL, 0, 'NOT MORE THAN 3', 'NOT MORE THAN 2 ', 'JUST ONE TRAILER IS ENOUGH ', '1', 56, 'NOT MORE THAN 3'),
(1379, '. AT STOP SIGN  ', NULL, 0, 'GIVEWAY TO TRAFFIC FROM THE RIGHT ', 'STOP UNTIL THE ROAD IS CLEAR ON BOTH SIDES', 'GIVEWAY TO TRAFFIC FROM YOUR LEFT', '2', 56, 'STOP UNTIL THE ROAD IS CLEAR ON BOTH SIDES'),
(1380, ' A CONTINUOUS WHITE LINE WITH A BROKEN LINE ON YOUR SIDE MEANS ', NULL, 0, 'YOU MAY OVERTAKE', 'YOU MAY NOT OVERTAKE', 'OVERTAKING IS PROHIBITED', '1', 56, 'YOU MAY OVERTAKE'),
(1381, 'What should always be kept clean on your vehicle? ', NULL, 0, 'Lights – Reflectors – Windows – Mirrors – Registration plate.', ' Windows – Mirrors – Registration plate. ', 'Lights – Reflectors – Windows – Mirrors.', '1', 6, 'Lights – Reflectors – Windows – Mirrors – Registration plate.'),
(1382, 'WHEN SHOULD A HORN BE BLOWN? ', NULL, 0, 'A. FOR FRIENDS IN THE STREET ', 'B. WHEN IT IS NECESSARY FOR SAFETY OF THE PUBLIC ONLY ', 'C. FOR PEDESTRIAN CROSSING', '2', 58, 'B. WHEN IT IS NECESSARY FOR SAFETY OF THE PUBLIC ONLY '),
(1383, 'HOW FAR FROM CORNER MUST YOU PARK YOUR CART ', NULL, 0, 'A. WHEN IT IS SAFE ', 'B. WITHIN A DISTANCE OF 7.5 METRES ', 'C. WITHIN A DISTANCE OF 5.7 METRES', '2', 58, 'B. WITHIN A DISTANCE OF 7.5 METRES '),
(1384, 'WHEN IS IT FORBIDDEN TO OVERTAKE?  ', NULL, 0, 'A. WHEN THE ROAD AHEAD IS OCCUPIED ', ' B. WHEN THE CAR IN FRONT IS TURNING LEFT ', ' C. WHEN FOLLOWING BEHIND TWO CARS', '1', 58, 'A. WHEN THE ROAD AHEAD IS OCCUPIED '),
(1385, 'WHAT DO YOU USE FOR PARKING YOUR CAR? ', NULL, 0, 'A. FOOTBRAKE ', 'B. HANDBRAKE ', 'C. HOOTER', '2', 58, 'B. HANDBRAKE '),
(1386, 'Which Car goes last', 'assets/20230814040143293_135875_BB21.PNG', 0, 'CAR B AND CAR A', 'CAR A', 'CAR C', '3', 58, 'CAR C'),
(1387, 'WHEN TURNING FROM ONE ROAD TO ANOTHER TO THE LEFT.WHICH POSITION IN THE ROAD MUST YOU TAKE? ', NULL, 0, 'A. THE EXTREME LEFT OF THE ROAD ', 'B. AT THE CENTER OF THE ROAD ', 'C. TO THE RIGHT SIDE OF THE ROAD', '1', 58, 'A. THE EXTREME LEFT OF THE ROAD '),
(1388, 'WHAT MUST YOU DO BEFORE YOU CHANGE DIRECTION? ', NULL, 0, 'A. SEE THAT THE ROAD IS CLEAR ', 'B. ADD SOME MORE FUEL', ' C. CHECK THE ROAD ON YOUR LEFT', '1', 58, 'A. SEE THAT THE ROAD IS CLEAR '),
(1389, 'WHEN APPROACHING A TRAFFIC CIRCLE, YOU GIVE WAY TO', NULL, 0, ' A .TRAFFIC FROM YOUR LEFT ', 'B. BUSES ONLY ', 'C. TRAFFIC ALREADY IN THE CIRCLE', '3', 58, 'C. TRAFFIC ALREADY IN THE CIRCLE'),
(1390, 'YOU DIP YOUR LIGHTS AT NIGHT ', NULL, 0, 'A. WHEN FOLLOWING OR MEETING ANOTHER VEHICLE ', 'B. WHEN TRAVELLING IN FRONT OF ANOTHER VEHICLE ', 'C. WHEN APPROACHING A PEDESTRIAN CROSSING', '1', 58, 'A. WHEN FOLLOWING OR MEETING ANOTHER VEHICLE '),
(1391, 'YOU CAN CROSS OR STRADDLE THE BROKEN YELLOW LINE ', NULL, 0, 'A. WHEN OVERTAKING SLOW MOVING VEHICLE ', 'B. WHEN OVERTAKING TRAFFIC TURNING TO THE LEFT ', 'C. WHEN OVERTAKING TRAFFIC TURNING TO THE RIGHT', '3', 58, 'C. WHEN OVERTAKING TRAFFIC TURNING TO THE RIGHT'),
(1392, 'WHEN TRAVELLING AT 75 KM/HR BEHIND ANOTHER VEHICLE WHICH YOU DO NOT WANT TO OVERTAKE YOU LEAVE A GAP OF', NULL, 0, ' A. 5 CARS ', 'B. 6 CARS ', 'C. 4 CARS', '1', 58, ' A. 5 CARS '),
(1393, 'HOW MANY PASSENGERS MAY BE CARRIED ON A MOTOR CIRCLE? ', NULL, 0, 'A. TWO PASSENGERS', ' B. ONE PASSENGER  ', 'C. NO PASSENGER', '2', 58, ' B. ONE PASSENGER  '),
(1394, 'WHAT MUST YOU DO WHEN YOUR MOTOR VEHICLE FAIL TO MOVE UNDER ITS OWN POWER', NULL, 0, ' A. MOVE IT TO WHICHEVER SIDE OF THE ROAD ', ' B. MOVE IT TO SUCH A POSITION THAT IT WILL NOT OBSTRUCT OTHER TRAFFIC ', 'C. PUT A RED RECTANGLE SIGN AT THE BACK ONLY', '2', 58, ' B. MOVE IT TO SUCH A POSITION THAT IT WILL NOT OBSTRUCT OTHER TRAFFIC '),
(1395, 'WHAT MUST YOU DO IF YOU LEAVE A MOTOR VEHICLE UNATTENDED? ', NULL, 0, 'A. PUT INDICATORS ON ', 'B. SWITCH LIGHTS ON ', 'C. SWITCH OFF THE ENGINE AND PUT ON HAND OR PARKING BRAKE', '3', 58, 'C. SWITCH OFF THE ENGINE AND PUT ON HAND OR PARKING BRAKE'),
(1396, 'IN ZIMBABWE WHICH AGE IS ALLOWED TO DRIVE A MOTOR VEHICLE? ', NULL, 0, 'A 16 AND ABOVE ', 'B. 18 AND ABOVE ', 'C. 20 AND ABOVE', '1', 58, 'A 16 AND ABOVE '),
(1397, 'SOLID WHITE LINE WITH A BROKEN LINE ON YOUR SIDE MEAN', NULL, 0, ' A. YOU MAY OVERTAKE ', 'B. YOU MAY NOT OVERTAKE ', 'C. OVERTAKING IS PROHIBITED', '1', 58, ' A. YOU MAY OVERTAKE '),
(1398, 'DIRECTION SIGNS ARE ', NULL, 0, 'A. DANGER WARNING SIGNS ', 'B. REGULATIONS SIGNS ', 'C. INFORMATIVE SIGNS', '3', 58, 'C. INFORMATIVE SIGNS'),
(1399, 'WHAT MUST YOU DO IF YOU ARE OVER POWERED BY DRUGS', NULL, 0, ' A. REDUCE SPEED ', 'B. TRAVEL BELLOW 40 KM/HR ', 'C. STAY COMPLETELY OFF THE ROAD', '3', 58, 'C. STAY COMPLETELY OFF THE ROAD'),
(1400, 'WHERE ARE YOU FORBIDDEN TO OVERTAKE? ', NULL, 0, 'A. IN URBAN AREAS ', 'B. IN RURAL AREAS ', 'C. WHEN APPROACHING A CORNER', '3', 58, 'C. WHEN APPROACHING A CORNER'),
(1401, 'THE CORRECT SEQUENCE OF THE LIGHTS SHOWN BY A ROBOT ', NULL, 0, 'A. RED, AMBER.GREEN ', 'B. GREEN, AMBER, RED ', 'C. RED, AMBER, GREEN', '2', 58, 'B. GREEN, AMBER, RED '),
(1402, 'WHEN CAN YOU GO THROUGH A RED ROBOT? ', NULL, 0, ' A WHEN YOU ARE GOING STRAIGHT AHEAD  ', 'B. WHEN THE ROAD IS CLEAR ', 'C. WHEN THERE IS A GREEN ARROW POINTING TO YOUR DIRECTION', '3', 58, 'C. WHEN THERE IS A GREEN ARROW POINTING TO YOUR DIRECTION'),
(1403, 'AT WHAT SPEED DO YOU DRIVE WHEN YOU SEE THE SIGN WRITTEN 80 IN A CIRCLE AND AT THE BOTTOM GENERAL LIMIT 60 ', NULL, 0, 'A. 60KM/HR ', 'B. 80KM/HR IN THE MAIN ROAD AND 60KM/HR IN OTHER ROADS ', 'C. BETWEEN 80KM/HR AND 60KM/HR', '2', 58, 'B. 80KM/HR IN THE MAIN ROAD AND 60KM/HR IN OTHER ROADS '),
(1404, 'BEFORE YOU DRIVE A MOTOR VEHICLE YOU MUST HAVE ', NULL, 0, 'A. REGISTRATION BOOK, INSURANCE AND VEHICLE LICENSE ', 'B. ENOUGH MONEY AND PETROL ', 'C. LEANER\'S OR DRIVERS LICENSE', '3', 58, 'C. LEANER\'S OR DRIVERS LICENSE'),
(1405, 'AT A PEDESTRIAN CROSSING OF A ZEBRA VARIETY ', NULL, 0, 'A. INCREASE SPEED ', 'B. CONSIDER THE RIGHT OF WAY TO THE PEDESTRIAN ', 'C. USE YOUR HOOTER', '2', 58, 'B. CONSIDER THE RIGHT OF WAY TO THE PEDESTRIAN '),
(1406, 'WHEN MEETING A VEHICLE DISPLAYING AN \"L\" PLATE ', NULL, 0, 'A. YOU USE YOUR HOOTER ', 'B. EXERCISE CAUTION ', 'C. FLASH YOUR LIGHTS', '2', 58, 'B. EXERCISE CAUTION '),
(1407, '1.	WHEN CAN YOU GO THROUGH A RED ROBOT?  ', NULL, 0, 'A. WHEN YOU ARE GOING STRAIGHT AHEAD ', 'B. WHEN THE ROAD IS CLEAR', ' C. WHEN THERE IS A GREEN ARROW POINTING TO YOUR DIRECTION', '3', 59, ' C. WHEN THERE IS A GREEN ARROW POINTING TO YOUR DIRECTION'),
(1408, 'WHAT IS THE MOST IMPORTANT THING IN A BUS ', NULL, 0, 'A. WHEEL SPANNER', ' B. PASSENGER ', 'C. AN AXE', '2', 59, ' B. PASSENGER '),
(1409, 'HOW MANY TRAILERS SHOULD A HEAVY VEHICLE DRAW? ', NULL, 0, 'A. NOT MORE THAN 3 ', 'B. NOT MORE THAN 2 ', 'C. ONE TRAILER', '1', 59, 'A. NOT MORE THAN 3 '),
(1410, 'WHEN MEETING AN ANIMAL DRAWN VEHICLE ON WHICH SIDE OF THE ROAD DO YOU DRIVE?  ', NULL, 0, 'A. ON THE LEFT SIDE ', 'B. ON THE RIGHT SIDE ', 'C. EXCISE CAUTION AND DRIVE ON WHICHEVER SIDE IS SAFE', '3', 59, 'C. EXCISE CAUTION AND DRIVE ON WHICHEVER SIDE IS SAFE'),
(1411, 'ROAD MARKINGS WITH TRANSVERSE LINES ON THE ROAD HAVE A...... ', NULL, 0, 'A. REGULATORY EFFECT ', 'B. INFORMATIVE ', 'C. DANGER WARNING', '1', 59, 'A. REGULATORY EFFECT '),
(1412, 'A DETOUR SIGN WARNS?', NULL, 0, ' A. YOU MUST SLOW DOWN TO FOLLOW A DETOUR ', 'B. THE ROAD IS CLOSED ', 'C. THAT THERE IS SLIPPERY ROAD AHEAD ', '1', 59, ' A. YOU MUST SLOW DOWN TO FOLLOW A DETOUR '),
(1413, 'NEVER OVERTAKE ', NULL, 0, 'A. AT NIGHT', ' B. WHEN IT IS RAINING ', 'C. WHEN PASSING A NARROW BRIDGE', '3', 59, 'C. WHEN PASSING A NARROW BRIDGE'),
(1414, 'A DE-RESTRICTION SIGN MEANS', NULL, 0, ' A. PREVIOUS IMPOSED SPEED LIMIT HAS BEEN CANCELLED', ' B. OVERTAKING IS PROHIBITED', ' C. ROAD IS CLOSED', '1', 59, ' A. PREVIOUS IMPOSED SPEED LIMIT HAS BEEN CANCELLED'),
(1415, 'WHAT IS ZIMBABWE KNOWN AS? ', NULL, 0, 'A. ANIMAL COUNTRY', ' B. FOOD COUNTRY ', 'C. INDEPENDENT COUNTRY', '1', 59, 'A. ANIMAL COUNTRY'),
(1416, 'A GRAVEL ROAD SIGN MEANS ', NULL, 0, ' A. ROAD WORKS AHEAD ', 'B. END OF A TARRED ROAD ', 'C. INDEPENDENT COUNTRY', '2', 59, 'B. END OF A TARRED ROAD '),
(1417, 'VEHICLE CHECK AHEAD SIGN MEANS SLOW DOWN BECAUSE OF ', NULL, 0, 'A. KEEP MECHANIC AHEAD', ' B. VEHICLE INSPECTOR OR POLICE AHEAD ', 'C. INSTRUCTOR AHEAD', '2', 59, ' B. VEHICLE INSPECTOR OR POLICE AHEAD '),
(1418, 'WHEN THE ROAD NARROWS CENTRAL AHEAD', NULL, 0, ' A. KEEP LEFT ', 'B. KEEP TO YOUR LANE ', 'C. KEEP TO CENTRE LANE', '3', 59, 'C. KEEP TO CENTRE LANE'),
(1419, 'A SLIPPERY ROAD SIGN MEANS ', NULL, 0, 'A. A TWO WAY TRAFFIC ', 'B. DO NOT DRIVE AT NIGHT ', 'C. THE ROAD IS WET', '3', 59, 'C. THE ROAD IS WET'),
(1420, 'WHAT IS THE RULE OF THE ROAD IN ZIMBABWE?', NULL, 0, ' A. NEVER TURN LEFT ', 'B. KEEP LEFT AND GIVE RIGHT OF WAY TO TRAFFIC COMING FROM THE ROAD ON YOUR RIGHT INCLUDING CYCLIST. NEVER .TURN RIGHT IN FRONT OF AN ONCOMING TRAFFIC ', 'C. NEVER STOP ON A GREEN LIGHT', '2', 59, 'B. KEEP LEFT AND GIVE RIGHT OF WAY TO TRAFFIC COMING FROM THE ROAD ON YOUR RIGHT INCLUDING CYCLIST. NEVER .TURN RIGHT IN FRONT OF AN ONCOMING TRAFFIC '),
(1421, 'WHAT IS THE DIFFERENCE BETWEEN A DANGER WARNING SIGN AND REGULATORY SIGN?', NULL, 0, ' A. A DANGER WARNING SIGN HAS A CIRCLE   ', 'B. A REGULATORY SIGN IS FOUND IN TOWN ', 'C. A DANGER WARNING SIGN WARNS OF DANGER AND A REGULATORY SIGN HAS THE FORCE OF LAW', '3', 59, 'C. A DANGER WARNING SIGN WARNS OF DANGER AND A REGULATORY SIGN HAS THE FORCE OF LAW'),
(1422, 'ON WHICH SIDE YOU MUST OVERTAKE? ', NULL, 0, 'A. ON THE LEFT SIDE', ' B. ON THE STEEP ASCENT ', 'C. ON THE RIGHT', '3', 59, 'C. ON THE RIGHT'),
(1423, 'WHAT MUST YOU DO WHEN FILLING YOUR CAR WITH FUEL? ', NULL, 0, 'A. MAKE SURE THERE IS NO ONE IN THE CAR ', 'B. MAKE SURE THE CAR HAS ENOUGH PRESSURE ', 'C. SWITCH OFF THE ENGINE, SEE THAT THERE IS NO NAKED FLAME NEAR THE VEHICLE', '3', 59, 'C. SWITCH OFF THE ENGINE, SEE THAT THERE IS NO NAKED FLAME NEAR THE VEHICLE'),
(1424, 'WHEN SHOULD A HORN BE BLOWN?', NULL, 0, ' A. FOR FRIENDS IN STREET ', 'B. WHEN IT IS NECESSARY FOR THE SAFETY OF THE PUBLIC ', 'C. FOR THE PEDESTRIAN CROSSING', '2', 59, 'B. WHEN IT IS NECESSARY FOR THE SAFETY OF THE PUBLIC '),
(1425, 'HOW FAR FROM A CORNER MUST YOU PARK YOUR CAR?', NULL, 0, ' A. WHEN IT IS SAFE ', 'B. WITHIN A DISTANCE OF 7,5 METRES ', ' C. WITHIN A DISTANCE OF 5,7 METRES', '2', 59, 'B. WITHIN A DISTANCE OF 7,5 METRES '),
(1426, 'WHEN IT IS FORBIDDEN TO OVERTAKE? ', NULL, 0, 'A. WHEN THE ROAD AHEAD IS OCCUPIED?', '  B. WHEN THE CAR IN FRONT IS TURNING LEFT? ', 'C. WHEN FOLLOWING BEHIND TWO CARS', '1', 59, 'A. WHEN THE ROAD AHEAD IS OCCUPIED?'),
(1427, 'WHAT DO YOU USE FOR PARKING YOUR CAR?', NULL, 0, ' A. FOOTBRAKE', ' B. HANDBRAKE ', 'C. HOOTER', '2', 59, ' B. HANDBRAKE '),
(1428, 'WHAT MUST YOU DO IF YOU ARE INVOLVED IN AN ACCIDENT? ', NULL, 0, 'A. RUN AND REPORT TO THE POLICE ', 'B. ASK SOMEONE TO CALL THE POLICE ', 'C. STOP, FIND OUT IF THE PERSON IS INJURED, RENDER FIRST AID, IF KILLED PROTECT THE CORPSE', '3', 59, 'C. STOP, FIND OUT IF THE PERSON IS INJURED, RENDER FIRST AID, IF KILLED PROTECT THE CORPSE'),
(1429, 'WHEN TURNING FROM ONE ROAD TO ANOTHER TO THE LEFT WHICH POSITION OF THE ROAD MUST YOU TAKE? ', NULL, 0, 'A. THE EXTREME LEFT OF THE ROAD', ' B. AT THE CENTRE OF THE ROAD ', 'C. TO THE RIGHT SIDE OF THE ROAD', '1', 59, 'A. THE EXTREME LEFT OF THE ROAD'),
(1430, 'A HEAVY VEHICLE IS ONE EXCEEDING ', NULL, 0, 'A. 5000 NET MASS ', 'B. 2300 NET MASS ', 'C. 3200 NET MASS', '1', 60, 'A. 5000 NET MASS '),
(1431, 'UNDER WHICH CLASS OF TRAFFIC SIGNALS DOES A GIVE WAY SIGN FALLS? ', NULL, 0, 'A. DANGER WARNING SIGNS ', 'B. REGULATORY SIGNS ', 'C. INFORMATIVE SIGNS', '2', 60, 'B. REGULATORY SIGNS '),
(1432, 'WHEN DO YOU CROSS OR STRADDLE A DOTTED YELLOW LINE? ', NULL, 0, 'A. WHEN TURNING RIGHT ', 'B. WHEN OVERTAKING VEHICLES TURNING TO THE RIGHT ', 'C. WHEN TURNING LEFT', '2', 60, 'B. WHEN OVERTAKING VEHICLES TURNING TO THE RIGHT '),
(1433, 'THIS SIGN SHOWS ', 'assets/20230814114537858_537642_BB35.png', 0, 'WIDTH RESTRICTION ', 'HEIGHT RESTRICTION ', 'WEIGHT RESTRICTION', '3', 60, 'WEIGHT RESTRICTION'),
(1434, 'WHICH CAR HAS THE RIGHT OF WAY  ?', 'assets/20230717074940741_601236_2.PNG', 0, 'CAR A', 'CAR B', 'CAR C', '1', 60, 'CAR A'),
(1435, 'WHICH CAR GOES LAST?', 'assets/20230717075153053_619895_3.PNG', 0, 'C', 'B', 'A', '3', 60, 'A'),
(1436, 'WHICH CAR GOES FIRST?', 'assets/20230717075300428_210816_4.PNG', 0, 'B', 'A', 'C', '2', 60, 'A'),
(1437, 'WHAT IS THE BREAKING DISTANCE WHEN TRAVELLING AT 40 KM/HR? ', NULL, 0, 'A. 8.3M ', 'B. 12.4 M ', 'C. 27.7 M', '2', 60, 'B. 12.4 M '),
(1438, 'WHEN THERE IS A VEHICLE DISPLAYING AN \"L\" PLATE APPROACHING ', NULL, 0, 'A. SOUND YOUR HOOTER TO WARN THE LEARNER DRIVER ', 'B. EXERCISE EXTREME CAUTION ', 'C. OVERTAKE THE LEARNER DRIVER', '2', 60, 'B. EXERCISE EXTREME CAUTION '),
(1439, 'HOW LONG WOULD A LEANER\'S LICENCE VALID? ', NULL, 0, 'A. 6 MONTHS ', 'B. 12 MONTHS ', 'C. TWO YEARS', '2', 60, 'B. 12 MONTHS '),
(1440, 'HOW MANY CLASSES OF TRAFFIC SIGNS AND SIGNALS ARE THERE IN ZIMBABWE? ', NULL, 0, 'A. 3 ', 'B. 4 ', 'C. 5', '3', 60, 'C. 5'),
(1441, 'IF THE ENGINE CAPACITY OF A MOTOR CIRCLE IS MORE THAN 3502 CM. WHAT MUST BE FITTED?', NULL, 0, ' A .CRASH HELMET ', 'B. CRASH BARS ', 'C. PROPER PILLION SEAT AND FOOT REST', '2', 60, 'B. CRASH BARS '),
(1442, 'WHEN DO YOU DIP YOUR HEAD LIGHTS  ', NULL, 0, 'A. IN A PROPER LIT STREET ', 'B. WHEN DRIVING IN URBAN AREAS  ', 'C. AT NIGHT ONLY', '1', 60, 'A. IN A PROPER LIT STREET '),
(1443, 'IF YOU STOP WHILST THE FRONT WHEELS OF YOUR CAR ARE ALREADY ON THE PEDESTRIAN CROSSING PLACE ', NULL, 0, 'A. REVERSE ', 'B. PROCEED WITH YOUR JOURNEY ', 'C. STAY WHERE YOU ARE', '3', 60, 'C. STAY WHERE YOU ARE'),
(1444, 'THIS SIGN SHOWS ', 'assets/20230814114811622_103130_bb30.png', 0, ' PUBLIC PLACE ', 'PARKING AREA ', ' POLICE AHEAD', '2', 60, 'PARKING AREA '),
(1445, 'WHAT COLOR IS A ONE WAY SIGN ', NULL, 0, 'A. BLUE ', 'B. GREEN ', ' C. BLACK', '2', 60, 'B. GREEN '),
(1446, 'UNDER WHAT CIRCUMSTANCES MAY YOU PROCEED AGAINST A RED ROBOT? ', NULL, 0, 'WHEN THE GREEN ARROW IS ILLUMINATED ', 'WHEN IT IS LATE AT NIGHT ', 'WHEN THE GREEN ARROW IS ILLUMINATED TO MY DIRECTION', '3', 60, 'WHEN THE GREEN ARROW IS ILLUMINATED TO MY DIRECTION'),
(1447, 'YOU MAY CROSS A SOLID WHITE LINE WITH A DOTTED WHITE LINE ', NULL, 0, 'A. WHEN IT IS SAFE TO DO SO ', 'B. WHEN THE SOLID LINE IS ON YOUR SIDE ', 'C. WHEN THE DOTTED LINE IS YOUR SIDE', '3', 60, 'C. WHEN THE DOTTED LINE IS YOUR SIDE'),
(1448, 'WHAT MUST BE PLACED BEHIND THE MUDGUARD OF A BICYCLE ', NULL, 0, 'A. A DANGER WARNING SIGN  ', 'B. ARED REFLECTIVE SIGN ', 'C. ARED TRIANGLE SIGN', '2', 60, 'B. ARED REFLECTIVE SIGN '),
(1449, 'WHEN INVOLVED IN A ROAD ACCIDENT ', NULL, 0, ' A. TAKE THE INJURED TO THE HOSPITAL  ', 'B. REPORT TO THE POLICE AS SOON AS POSSIBLE IN ANY CASE WITHIN 24 HOURS ', ' C. CALL AN AMBULANCE', '2', 60, 'B. REPORT TO THE POLICE AS SOON AS POSSIBLE IN ANY CASE WITHIN 24 HOURS '),
(1450, 'YOU ARE PROHIBITED FROM OVERTAKING  ', NULL, 0, 'A. WHEN PASSING A POST OFFICE ', 'B. WITHIN AN INTERSECTION ', 'C. WHEN PULLING A TRAILER', '2', 60, 'B. WITHIN AN INTERSECTION '),
(1451, 'AT THIS SIGN ', 'assets/20230814115237421_336778_bb28.gif', 0, ' RIGHT TURN PROHIBITED ', 'ABOUT TURN PROHIBITED ', 'LEFT TURN IS PROHIBITED', '2', 60, 'ABOUT TURN PROHIBITED '),
(1452, 'WHEN APPROACHING THIS SIGN ', 'assets/20230814115614430_917817_BB48.png', 0, ' MOUNTAINOUS PLACES AHEAD  ', 'SEA WAVES IN THE ROAD AHEAD ', ' SPEED HUMPS AHEAD', '3', 60, ' SPEED HUMPS AHEAD'),
(1453, 'WHEN FILLING YOUR VEHICLE WITH PETROL  ', NULL, 0, 'A. SWITCH OFF THE ENGINE AND AVOID NAKED FLAMES ', 'B. SWITCH OFF YOUR WIPER ', 'C. YOU MAY SMOKE INSIDE YOUR VEHICLE', '1', 60, 'A. SWITCH OFF THE ENGINE AND AVOID NAKED FLAMES '),
(1454, 'A FLASHING AMBER LIGHT WITH A RED RECTANGULAR SIGN MEANS', NULL, 0, ' A. DANGEROUS AND HAPHAZARD PLACE ', 'B. EMPHASIZE THE EXISTENCE OF A DANGER WARNING SIGN ', 'C. THE ROBOT IS NOT WORKING', '2', 60, 'B. EMPHASIZE THE EXISTENCE OF A DANGER WARNING SIGN '),
(1455, 'WHAT MUST BE PLACED BEHIND A BROKEN DOWN VEHICLE?', NULL, 0, 'A RECTANGLE SIGN', 'DRIVER WAVING TO OTHER ROAD USERS ', 'A RED TRIANGLE SIGN', '3', 61, 'A RED TRIANGLE SIGN'),
(1456, 'WHAT DOCUMENTATION IS REQUIRED BEFORE A MOTOR CAN BE USED ON PUBLIC?', NULL, 0, ' NATIONAL IDENTITY CARD. REGISTRATION BOOK AND VEHICLE LICENCE ', 'REPAIR CARD, INSURANCE AND DRIVER\'S LICENSE ', 'VEHICLE LICENCE, REGISTRATION BOOK AND INSURANCE', '3', 61, 'VEHICLE LICENCE, REGISTRATION BOOK AND INSURANCE'),
(1457, 'UNDER WHAT CIRCUMSTANCES MAY YOU GO AGAINST RED ROBOT? ', NULL, 0, 'A . WHEN THERE IS POLICEMAN WAVING YOU TO GO', ' B. WHEN YOU ARE UNDER INFLUENCED OF ALCOHOL ', 'C. WHEN YOU ARE LATE FOR MEETING', '1', 61, 'A . WHEN THERE IS POLICEMAN WAVING YOU TO GO'),
(1458, 'WHAT DO YOU DO WHEN THE LIGHTS OF YOUR ONCOMING TRAFFIC ARE ON BRIGHT BEAM? ', NULL, 0, 'A. PULL DOWN THE SUN VISOR', ' B. CAST YOUR EYES SLIGHTLY TO THE LEFT', ' C. FLASH YOUR LIGHTS AS WELL', '2', 61, ' B. CAST YOUR EYES SLIGHTLY TO THE LEFT'),
(1459, 'WHICH IS THE SECOND CAR TO GO?', 'assets/20230717081524484_51059_8.PNG', 0, 'C', 'B', 'A', '1', 61, 'C'),
(1460, 'WHICH VEHICLE HAS THE RIGHT OF WAY', 'assets/20230717081704266_67541_9.PNG', 0, 'B', 'A', 'C', '2', 61, 'A'),
(1461, 'FOR CYCLIST NOT TO INTERFERE WITH OTHER ROAD USERS. HOW SHOULD THEY RIDE THEIR CYCLES ', NULL, 0, 'A. IN A SINGLE FILE', ' B. IN TWO TO THE ABREAST ', 'C. FAR AWAY FROM THE DRIVE WAY', '1', 61, 'A. IN A SINGLE FILE'),
(1462, 'WHAT DOES THIS SIGN MEANS? ', 'assets/20230717081920209_335419_10.PNG', 0, 'A. A ROAD INTERSECTION AHEAD ', 'B. A GIVE WAY SIGN AHEAD ', 'C. A WARNING OF STOP OR GIVE WAY SIGN AHEAD', '3', 61, 'C. A WARNING OF STOP OR GIVE WAY SIGN AHEAD'),
(1463, 'WHAT DO YOU DO WHEN THERE IS POLICE, AMBULANCE OR FIRE ENGINE SOUNDING ITS WARNING DEVICE ', NULL, 0, 'A. STOP IMMEDIATELY INSIDE THE ROAD ', 'B. DRIVE AS FAST AS YOU CAN TO AVOID STOPPING ', 'C. PULL OFF THE ROAD AND STOP UNTIL THEY PASS', '3', 61, 'C. PULL OFF THE ROAD AND STOP UNTIL THEY PASS'),
(1464, 'WHICH CAR GOES FIRST?', 'assets/20230814123217934_79501_BB11.jpeg', 0, 'car   A', 'car   B', 'car  C', '2', 61, 'car   B'),
(1465, 'WHAT DO YOU GIVE WAY TO WHEN TURNING LEFT OR RIGHT AT A ROBOT CONTROLLED INTERSECTION ', NULL, 0, 'A. PEDESTRIANS ', 'B. ONCOMING TRAFFIC ', 'C. TRAFFIC FROM THE RIGHT', '1', 61, 'A. PEDESTRIANS '),
(1466, 'Danger sign like means what', 'assets/20230814121807581_80568_bb14.png', 0, 'variable nature ', 'variable zone ', 'variable danger ahead', '3', 61, 'variable danger ahead'),
(1467, 'WHAT IS YOUR REACTION DISTANCE WHEN TRAVELLING AT 60KM/HT ', NULL, 0, 'A. 12.4M ', 'B. 8.3M ', 'C. 18M', '2', 61, 'B. 8.3M '),
(1468, 'WHEN DO YOU DIP YOUR HEAD LIGHTS? ', NULL, 0, 'A .WHEN THERE IS A HEAVY VEHICLE BEHIND YOU ', 'B. WHEN FOLLOWING BEHIND ANOTHER VEHICLE ', 'C. IN A STREET WITHOUT LIGHTS', '2', 61, 'B. WHEN FOLLOWING BEHIND ANOTHER VEHICLE '),
(1469, 'WHAT DOES THIS SIGN MEANS?', 'assets/20230717082618486_675487_13.PNG', 0, ' A. REGULATORY SIGN', ' B. ROAD CLOSED ', 'C. PREVIOUSLY IMPOSED SPEED LIMIT CANCELLED', '3', 61, 'C. PREVIOUSLY IMPOSED SPEED LIMIT CANCELLED'),
(1470, 'WHAT ARE TRANSVERSE LINES? ', NULL, 0, 'A. LINES PARALLEL TO THE DRIVE WAY ', 'B. STOP LINES ', 'C. DOTTED LINE', '2', 61, 'B. STOP LINES '),
(1471, 'IF YOU RUN A DOG ', NULL, 0, 'A. REPORT TO THE POLICE AS SOON AS POSSIBLE WITHIN 24HOURS ', 'B. PROCEED WITH YOUR JOURNEY ', 'C. TRY TO FIND THE OWNER', '3', 61, 'C. TRY TO FIND THE OWNER'),
(1472, 'WHAT DO YOU DO WHEN APPROACHING A STOP SIGN?', NULL, 0, ' A. STOP AND PROCEED IF THE ROAD IS CLEAR FROM BOTH SIDES ', 'B. Proceed if road is clear from both sides ', 'c. GIVEWAY TO TRAFFIC FROM RIGHT', '1', 61, ' A. STOP AND PROCEED IF THE ROAD IS CLEAR FROM BOTH SIDES '),
(1473, 'WHEN APPROACHING THIS SIGN  ', 'assets/20230717082945885_580806_14.PNG', 0, 'A. THE SPEED ON THIS SECTION OF THE ROAD IS 80 ', 'B. TRAVEL BETWEEN 60 AND 80 KM/HR ', 'C. THE SPEED LIMIT IS 80KM/HR WIDE TARRED ROADS AND 60KM/HR OTHER ROADS', '3', 61, 'C. THE SPEED LIMIT IS 80KM/HR WIDE TARRED ROADS AND 60KM/HR OTHER ROADS'),
(1474, 'WHAT MUST YOU WEAR BEFORE RIDDING ON A MOTOR CYCLE? ', NULL, 0, 'A. WARM LEATHER JACKET ', 'B. CRASH HELMET ', 'C. PROPER PILLION SEAT AND FOOT RESTS FITTED', '2', 61, 'B. CRASH HELMET '),
(1475, 'IN RURAL AREAS WHERE TRAFFIC IS NOT CONTROLLED TO WHICH TRAFFIC DO YOU GIVE WAY ', NULL, 0, 'A. THOSE FROM THE MAIN ROAD', ' B. ONCOMING TRAFFIC ', 'C. TRAFFIC APPROACHING FROM THE RIGHT', '1', 61, 'A. THOSE FROM THE MAIN ROAD'),
(1476, 'WHEN IS OVERTAKING FORBIDDEN ', NULL, 0, 'A. IN A ROAD WITH FOUR LANES', ' B. AHEAD OF CORNER ', 'C. WHEN THERE IS A DOTTED YELLOW LINE', '2', 61, ' B. AHEAD OF CORNER '),
(1477, 'HEAVY VEHICLES PULLING TRAILERS SHOULD BE FITTED WITH ', NULL, 0, 'A. FULL LICENSE DRIVE ', 'B. NEW TYRES ', 'C. SAFETY CHAINS', '3', 61, 'C. SAFETY CHAINS'),
(1478, 'WHAT IS THE MOST IMPORTANT THING IN A BUS ', NULL, 0, 'A. DRIVER ', 'B. PASSENGER ', 'C. FIRE EXTINGUISHER', '2', 61, 'B. PASSENGER '),
(1479, 'WHEN SHOULD A HORN BE USED ', 'assets/20230814122143359_305237_BB39.jpeg', 0, 'A. IN EMERGENCY AND SAFETY OF THE PUBLIC', ' B. WHEN GREETING WITH FRIENDS', ' C. AT ANY TIME.', '1', 61, 'A. IN EMERGENCY AND SAFETY OF THE PUBLIC'),
(1480, 'WHAT IS THE INSIGNIA OF A DANGER WARNING SIGN? ', NULL, 0, 'A. RECTANGULAR SIGN', ' B. TRIANGULAR SIGN  ', 'C. CIRCLE', '2', 62, ' B. TRIANGULAR SIGN  '),
(1481, 'AT WHAT DISTANCE SHOULD THE TRIANGLE SIGN BE PLACED BEHIND A BROKEN DOWN VEHICLE?', NULL, 0, ' A. 20 TO 30 METRES', ' B. 30 TO 50 METRES ', 'C. 50 TO 80 METRES', '2', 62, ' B. 30 TO 50 METRES '),
(1482, 'WHEN APPROACHING THIS SIGN ', 'assets/20230813101749415_287244_bb27.jpg', 0, 'A. ENGAGE TO LOW GEAR ', 'B. ENGAGE TO NEUTRAL ', 'C. ENGAGE TO A HIGHER GEAR', '1', 62, 'A. ENGAGE TO LOW GEAR '),
(1483, 'WHEN APPROACHING A TRAFFIC CIRCLE ', NULL, 0, 'A. GIVE WAY TO TRAFFIC FROM RIGHT ', 'B. GIVE WAY TO ONCOMING TRAFFIC ', 'C. GIVE WAY TO TRAFFIC ALREADY IN ROUND ABOUT', '3', 62, 'C. GIVE WAY TO TRAFFIC ALREADY IN ROUND ABOUT'),
(1484, 'THIS SIGN MEANS', 'assets/20230813101909159_168916_bb28.gif', 0, 'RIGHT TURN PROHIBITED', 'U-TURN ALLOWED', 'U-TURN NOT ALLOWED', '3', 62, 'U-TURN NOT ALLOWED'),
(1485, 'WHICH CAR GOES FIRST?', 'assets/20230808072104716_562411_aa25.PNG', 0, 'A', 'B', 'C', '3', 62, 'C'),
(1486, 'WHEN APPROACHING A PEDESTRIAN CROSSING PLACE ', NULL, 0, 'A. PROCEED WITH CAUTION ', 'B. HOOT FOR PEDESTRIAN ', 'C. ACCELERATE OVER IT', '1', 62, 'A. PROCEED WITH CAUTION '),
(1487, 'WHAT IS THE OVERALL STOPPING DISTANCE WHEN TRAVELLING AT 40 KM/HR ', NULL, 0, 'A. 5.8 METRES ', 'B. 18 METRES ', 'C. 36 METRES', '2', 62, 'B. 18 METRES '),
(1488, 'YOU DIP YOUR LIGHTS FOR ', NULL, 0, 'A. ONCOMING TRAFFIC ', 'B. TRAFFIC FROM THE RIGHT', ' C. TRAFFIC FROM THE MAIN ROAD', '1', 62, 'A. ONCOMING TRAFFIC '),
(1489, 'WHICH CAR GOES FIRST?', 'assets/20230717090221696_163515_18.PNG', 0, 'A', 'B', 'C', '1', 62, 'A'),
(1490, 'WHICH CAR GOES FIRST?', 'assets/20230717090659950_330839_19.PNG', 0, 'A', 'B', 'C', '3', 62, 'C'),
(1491, 'WHEN THERE IS RED ROBOT WITH A GREEN ARROW POINTING STRAIGHT AHEAD ', NULL, 0, 'A. IMAY PROCEED WHEN GOING STRAIGHT  ', 'B. I MAY FILTER WHEN TURNING RIGHT ', 'C. NOBODY CAN GO AS LONG AS THERE IS A RED LIGHT', '1', 62, 'A. IMAY PROCEED WHEN GOING STRAIGHT  '),
(1492, 'WHEN DO YOU CROSS A DOTTED YELLOW LINE? ', NULL, 0, 'A. WHEN TURNING TO THE RIGHT', ' B. WHEN STOPPING ', 'C. YOU ARE NOT ALLOWED TO CROSS THAT LINE', '2', 62, ' B. WHEN STOPPING '),
(1493, 'WHAT IS THE CORRECT SEQUENCE OF A ROBOT ', NULL, 0, 'A. RED..AMBER.GREEN ', 'B. GREEN, RED, AMBER', ' C. GREEN, AMBER. RED', '3', 62, ' C. GREEN, AMBER. RED'),
(1494, 'APPLICANTS FOR HEAVY VEHICLES SHOULD BE AGED ', NULL, 0, 'A. 16 YEARS AND ABOVE ', 'B. 18 YEARS AND ABOVE ', 'C. 21 YEARS AND ABOVE', '2', 62, 'B. 18 YEARS AND ABOVE '),
(1495, 'WHEN THE ROBOT IS FLASHING AMBER ALL TIME ', NULL, 0, 'A. GIVE WAY TO TRAFFIC FROM THE RIGHT ', 'B. GIVE WAY TO ONCOMING TRAFFIC ', 'C. GIVE WAY TO TRAFFIC FROM BOTH SIDES', '1', 62, 'A. GIVE WAY TO TRAFFIC FROM THE RIGHT '),
(1496, 'BREAKING DISTANCE WHEN TRAVELLING AT 60 KM HR IS ', NULL, 0, 'A. 18 M', ' B. 27.7 M ', 'C. 36 M', '2', 62, ' B. 27.7 M '),
(1497, 'WHICH ONE IS THE USE OF CARRIAGE WAY MARKINGS ', NULL, 0, 'A. TO EMPHASIS THE EXISTENCE OF A REGULATIONS ', 'B. TO WARN DRIVERS OF OTHER TRAFFIC AHEAD ', 'C. NONE OF THE ABOVE', '1', 62, 'A. TO EMPHASIS THE EXISTENCE OF A REGULATIONS '),
(1498, 'HOW MANY PASSENGERS CAN BE CARRIED ON A MOTOR CYCLE', NULL, 0, ' A. 1 ', 'B. 2 ', 'C. 3', '1', 62, ' A. 1 '),
(1499, 'WHAT IS THIS SIGN? ', 'assets/20230717093040146_953954_20.PNG', 0, 'A. DANGER WARNING SIGN ', 'B. REGULATORY SIGN ', 'C. DERESTRICTION SIGN', '3', 62, 'C. DERESTRICTION SIGN'),
(1500, 'BEFORE ONE CAN DRIVE A MOTOR VEHICLE HE\\SHE MUST HAVE ', NULL, 0, 'A. CERTIFICATE OF FITNESS AND METAL IDENTITY CARD ', 'B. LEARNERS LICENSE OR DRIVERS LICENSE  ', 'C. INSURANCE, REGISTRATION BOOK AND VEHICLE LICENSE', '2', 62, 'B. LEARNERS LICENSE OR DRIVERS LICENSE  '),
(1501, 'THIS SIGN SHOWS ', 'assets/20230813102028109_858361_BB36.png', 0, 'A. HEIGHT RESTRICTION ', 'B. WEIGHT RESTRICTION ', 'C. WIDTH RESTRICTION', '3', 62, 'C. WIDTH RESTRICTION'),
(1502, 'WHEN APPROACHING A RAIL CROSSING WITH SIGNALS FLASHING ', NULL, 0, 'A. ACCELERATE FAST BEFORE THE TRAIN ', ' B. SLOW DOWN AND BE PREPARED TO STOP BEFORE THE RAIL LINES ', 'C. SOUND YOUR HOOTER', '2', 62, ' B. SLOW DOWN AND BE PREPARED TO STOP BEFORE THE RAIL LINES '),
(1503, 'APPLICANT FOR CLASS (4) FOUR SHOULD BE AGED ', NULL, 0, 'A. 16 YEARS OR ABOVE ', 'B. 18 YEARS OR ABOVE ', 'C. 21 YEARS OR ABOVE', '1', 62, 'A. 16 YEARS OR ABOVE '),
(1504, 'WHEN APPROACHING A GIVE WAY SIGN  ', NULL, 0, 'A. GIVE WAY TO TRAFFIC FROM THE RIGHT ', ' B. GIVE WAY TO TRAFFIC FROM BOTH SIDES  ', 'C. GIVE WAY TO ONCOMING TRAFFIC', '2', 62, ' B. GIVE WAY TO TRAFFIC FROM BOTH SIDES  '),
(1505, 'WHEN CARRYING A PASSENGER ON A MOTOR CYCLE, I MUST ', NULL, 0, 'A. HAVE A PILLION SEAT AND FOOTRESTS FIRMLY FIXED ', 'B. HAVE MY FUEL TANK FILLED WITH PETROL ', 'C. HAVE MY HEAD LIGHTS FITTED ', '1', 25, 'A. HAVE A PILLION SEAT AND FOOTRESTS FIRMLY FIXED '),
(1506, 'I MUST DIP MY LIGHTS AT NIGHT FOR ', NULL, 0, ' A. ALL TRAFFIC FROM MY RIGHT ', 'B. A POLICE ON NIGHT POINT DUTY  ', 'C. WHEN CROSSING APPROACHING A RAILWAY LINE', '1', 25, ' A. ALL TRAFFIC FROM MY RIGHT '),
(1507, 'IF INVOLVED IN A SERIOUS CAR ACCIDENT ', NULL, 0, 'A. I MUST REPORT TO THE HOSPITAL ', 'B. I MUST REPORT TO THE POLICE WITHIN 24 HRS ', 'C. I MUST REPORT TO THE POLICE AS SOON AS POSSIBLE WITHIN 24 HRS', '3', 25, 'C. I MUST REPORT TO THE POLICE AS SOON AS POSSIBLE WITHIN 24 HRS'),
(1508, 'WHEN TRAVELLING AT 60 KM/HR BEHIND ANOTHER VEHICLE I MUST LEAVE A GAP OF AT LEAST ', NULL, 0, '4 VEHICLES LENGTH', '4 VEHICLES LENGTH BETWEEN MY VEHICLE AND THE ONE IN FRONT OF ME ', 'C. 2 VEHICLES LENGTH BETWEEN MY VEHICLE AND THE ONE IN FRONT OF ME', '2', 25, '4 VEHICLES LENGTH BETWEEN MY VEHICLE AND THE ONE IN FRONT OF ME '),
(1509, 'Which car goes last', 'assets/20230807135353963_58808_aa18.PNG', 0, 'CAR A ', 'CAR B ', 'CAR C', '3', 25, 'CAR C'),
(1510, 'This sign means', 'assets/20230807135800351_65454_aa19.PNG', 0, 'Mind weight on the flyover bridger', 'Weight not to exceed 5000 kgs', 'Height 5 tonnes maximum', '2', 25, 'Weight not to exceed 5000 kgs'),
(1511, 'WHICH CAR MUST FILTER FIRST?', 'assets/20230807141227895_773373_AA1.jpeg', 0, 'CAR A ', 'CARB ', 'CAR C', '3', 25, 'CAR C'),
(1512, 'AN UNBROKEN WHITE LINE ON THE ROAD SURFACE INDICATES THAT: ', NULL, 0, 'A. YOU MAY OVERTAKE IF THE BROKEN LINE IS ON YOUR SIDE ', 'B. YOU MAY OVERTAKE IF THE UNBROKEN LINE IS ON YOUR SIDE ', 'C. YOU MUST KEEP USER LEFT', '3', 25, 'C. YOU MUST KEEP USER LEFT'),
(1513, 'WHEN APPROACHING THIS SIGN ', 'assets/20230807141740912_940521_aa9.PNG', 0, 'l exercise caution for a variable danger', 'it shows danger', 'its not in any class of signs in my country', '1', 25, 'l exercise caution for a variable danger'),
(1514, 'A HEAVY VEHICLE TOWING A TRAILER MUST HAVE', NULL, 0, ' A.	SAFETY CHAIN FITTED TO THE TRAILER  ', 'B. MORE PULLING POWER ', 'C.	AS MANY SPARE WHEELS AS POSSIBLE', '1', 25, ' A.	SAFETY CHAIN FITTED TO THE TRAILER  '),
(1515, 'WHEN MEETING A VEHICLE DISPLAYING \"L\" PLATE ', NULL, 0, 'A. OVERTAKE HIM AS QUICK AS POSSIBLE ', 'B. USE YOUR HOOTER AND TELL HIM TO STAY OF THE ROAD ', 'C. EXERCISE CAUTIONS AND GIVE HIM MORE SPACE', '3', 25, 'C. EXERCISE CAUTIONS AND GIVE HIM MORE SPACE'),
(1516, 'THE CORRECT SEQUENCE LIGHT SHOWN BY A ROBOT IS ', NULL, 0, 'A. AMBER, RED, GREEN', ' B. GREEN, AMBER, RED ', 'C. RED, AMBER, GREEN', '2', 25, ' B. GREEN, AMBER, RED '),
(1517, 'DIRECTION ARROWS USED IN CONJUNCTION WITH PROHIBITION LINES ON THE ROAD SURFACE...... ', NULL, 0, 'A. REACT TO THE DRIVERS OF HEAVY VEHICLES ONLY ', 'B. HAVE A REGULATORY EFFECT ', 'C. ARE FOR INFORMATIVE PURPOSES', '2', 25, 'B. HAVE A REGULATORY EFFECT '),
(1518, 'TO DRIVE A HEAVY VEHICLES, YOU MUST HAVE REACHED THE AGE OF ', NULL, 0, 'A. 21 YEARS ', 'B. 18 YEARS ', 'C. 17 YEARS', '2', 25, 'B. 18 YEARS '),
(1519, 'AT ROBOT INTERSECTION, WHEN IT TURNS AMBER OR RED AND WHEN YOU HAVE STOPPED OVER THE PEDESTRIAN CROSSING LINE, WHAT DO YOU DO? ', NULL, 0, 'A. REVERSE', ' B. CARRY ON ', 'C. STAY WHERE YOU ARE', '3', 25, 'C. STAY WHERE YOU ARE'),
(1520, 'This sign means that', 'assets/20230807142259394_117681_aa20.PNG', 0, 'stop', 'give way', 'stop/ giveway', '3', 25, 'stop/ giveway'),
(1521, 'This sign means', 'assets/20230807142601866_212159_AA6.PNG', 0, 'ATHELATES AHEAD', 'RUNWAY AHEAD ', 'STADIUM AHEAD', '3', 25, 'STADIUM AHEAD'),
(1522, 'THE HOOTER MAY ONLY BE USED ', NULL, 0, 'A. WHEN ANIMALS ARE CROSSING THE ROAD  ', 'B. IN ANY EMERGENCY ', 'C. TO ATTRACT A FRIEND ATTENTION', '2', 25, 'B. IN ANY EMERGENCY '),
(1523, 'YOU DIP YOUR LIGHTS AT NIGHT', NULL, 0, ' WHEN THERE IS A VEHICLE BEHIND YOU ', 'WHEN TRAVELLING BEHIND ANOTHER VEHICLE ', ' WHEN YOU INTEND TO STOP', '2', 25, 'WHEN TRAVELLING BEHIND ANOTHER VEHICLE '),
(1524, 'THE MIINIMUM LEGAL AGE ON APPLICANT CAN LEARN TO DRIVE IS ', NULL, 0, 'A. 16 YEARS ', 'B. 12 YEARS ', 'C. 18 YEARS', '1', 25, 'A. 16 YEARS '),
(1525, 'THIS SIGN REGULATES THAT THE SPEED LIMIT IS  ', 'assets/20230807142932409_198970_AA21.PNG', 0, '80 KM/HR ', '60 KM/HR ', 'YOU CAN TRAVEL BETWEEN 60 AND 80 KM/HR IN THE AREAS AROUND', '3', 25, 'YOU CAN TRAVEL BETWEEN 60 AND 80 KM/HR IN THE AREAS AROUND'),
(1526, 'WHEN TRAVELING AT 40 KM/H. THE SHORTEST STOPPING DISTANCE IS ', NULL, 0, 'A. 10 METRES ', 'B. 12.4 METRES ', 'C. 18 METRES', '3', 25, 'C. 18 METRES'),
(1527, 'WHICH CAR MUST GIVE PRECEDENCE', 'assets/20230807143125625_107236_AA22.PNG', 0, 'A', 'C', 'B', '1', 25, 'A'),
(1528, 'FOR CYCLISTS NOT TO INTERFERE WITH OTHER ROAD USERS, THEY SHOULD RIDE THEIR BICYCLES ', NULL, 0, 'A. 2 TO 3 ABREAST ', 'B.  IN A SINGLE FILE ', 'C. STAY OFF THE ROAD', '2', 25, 'B.  IN A SINGLE FILE '),
(1529, 'A DERISTRICTION SIGN IS ', NULL, 0, 'A  DANGER WARNING SIGN  ', ' AN INFORMATIVE SIGN ', 'A REGULATORY SIGN', '2', 25, ' AN INFORMATIVE SIGN '),
(1530, 'A restrict sign signifies that ', 'assets/20230717124706551_924856_30.PNG', 0, 'Do not cross ', 'Drive with caution ', 'Do not exceed', '3', 63, 'Do not exceed'),
(1531, 'THE SAFETY DEVICE ON A MOTOR CYCLE IS A ', NULL, 0, 'A. HELMET ', 'B. FOOT REST ', 'C. PROPER SEAT', '1', 63, 'A. HELMET '),
(1532, 'In which class is a one way sign? ', NULL, 0, 'Regulatory', 'Informative', 'Carriage markings  ', '2', 63, 'Informative'),
(1533, 'WHAT IS THE MOST IMPORTANT THING IN A BUS  ', NULL, 0, 'A. AN AXE ', 'B. PASSENGERS', ' C. WHEEL SPANNER', '2', 63, 'B. PASSENGERS'),
(1534, 'WHEN YOU RUN OVER A DOG IN RURAL AREAS YOU MUST ', NULL, 0, 'A. REPORT TO THE POLICE', ' B. TRY TO FIND THE OWNER', ' C. TAKE THE ANIMAL TO THE SPCA', '2', 63, ' B. TRY TO FIND THE OWNER'),
(1535, 'What is the purpose of a hooter? ', 'assets/20230813124402103_106034_BB39.jpeg', 0, 'For alerting animals the middle of the road', 'For alerting pedestrian on the middle of the road ', 'For alerting other vehicles', '2', 63, 'For alerting pedestrian on the middle of the road '),
(1536, 'HOW MANY PASSENGERS MUST BE CARRIED ON A MOTOR CYCLE? ', NULL, 0, 'A. 3 ', 'B. 2 ', 'C. 1', '3', 63, 'C. 1'),
(1537, 'ON ENTERING A PEDESTRIAN CROSSING OF A ZEBRA VARIETY ', NULL, 0, 'A. INCREASE VEHICLE ', 'B. CONSIDER THE RIGHT OF WAY TO PEDESTRIAN ', 'C. USE YOUR HOOTER', '2', 63, 'B. CONSIDER THE RIGHT OF WAY TO PEDESTRIAN '),
(1538, 'WHAT DOCUMENT IS REQUIRED BEFORE YOU DRIVE A MOTOR VEHICLE ', NULL, 0, 'A. NEW TIRES AND PETROL', ' B. REGISTRATION BOOK INSURANCE AND VEHICLE LICENSE ', 'C. LEARNERS OR DRIVERS LICENSE', '3', 63, 'C. LEARNERS OR DRIVERS LICENSE'),
(1539, 'HOW FAR FROM A CORNER ARE YOU ALLOWED TO PARK YOUR VEHICLE', NULL, 0, ' A. 5.7 METRES ', 'B. 7.5 METRES ', 'C. 12 METRES', '2', 63, 'B. 7.5 METRES '),
(1540, 'What is the purpose of a handbrake', 'assets/20230717130605150_732867_13.PNG', 0, 'To keep the car stationery in the parking bay', 'To keep the car stationery against a steep gradient B.', 'To keep the car stationery  ', '3', 63, 'To keep the car stationery  '),
(1541, 'When you reach a lay-by sign at night you should? ', 'assets/20230813124057406_964878_BB38.jpg', 0, 'Park on the left', 'Reduce speed', 'Put your hazards', '2', 63, 'Reduce speed'),
(1542, 'AT A ROBOT CONTROLLED INTERSECTION WHEN THE LIGHTS IS GREEN YOU MUST GIVE WAY TO PEDESTRIANS WHEN', NULL, 0, ' A. YOU ARE GOING STRAIGHT ', 'B. YOU ARE TURNING TO THE LEFT OR TO THE RIGHT ', 'C. YOU TURNING LEFT OR RIGHT AND GOING STRAIGHT', '3', 63, 'C. YOU TURNING LEFT OR RIGHT AND GOING STRAIGHT'),
(1543, 'WHAT IS THE CORRECT ROBOT SEQUENCE IN THE FOLLOWING ', NULL, 0, 'A. GREEN, AMBER, RED', ' B. AMBER, GREEN, RED ', 'C. RED AMBER.GREEN', '1', 63, 'A. GREEN, AMBER, RED'),
(1544, 'YOU ARE NOT PERMITTED TO STOP OR PARK YOUR VEHICLE AT A CORNER INTERSECTION LESS THAN ', NULL, 0, 'A. 15 METRES', ' B. 10 METRES ', 'C. 7.5 METRES', '3', 63, 'C. 7.5 METRES'),
(1545, 'WHEN THE RED ROBOT IS FLASHING? ', NULL, 0, 'A. YOU MUST GET ACROSS AS QUICKLY AS POSSIBLE ', 'B. YOU MUST SLOW DOWN AND ACROSS WITH CAUTION ', 'C. YOU MUST STOP AND THEN PROCEED IF IT\'S SAFE TO DO SO', '3', 63, 'C. YOU MUST STOP AND THEN PROCEED IF IT\'S SAFE TO DO SO'),
(1546, 'At a junction you should not? ', 'assets/20230813124620325_730783_BB40.png', 0, 'Turn to the left ', 'Turn to the right', 'Turn right in front of oncoming vehicle traffic', '3', 63, 'Turn right in front of oncoming vehicle traffic'),
(1547, 'On a railway crossing place with open boom gates you should. ', 'assets/20230813124812567_843947_BB41.PNG', 0, 'Stop and park ', 'Signal your intention ', 'Look both sides and proceeds', '3', 63, 'Look both sides and proceeds'),
(1548, 'At pedestrian crossing place what do you do?', 'assets/20230813130625524_149305_BB44.PNG', 0, 'Keep to the extreme left side of the road ', 'Use your hazards', 'Exercise caution and proceed if it is safe to do so', '3', 63, 'Exercise caution and proceed if it is safe to do so'),
(1549, 'When parking a vehicle on the side of the road use 	', 'assets/20230717132053761_694621_36.PNG', 0, '	Lights', 'Park lights', 'Side lights', '2', 63, 'Park lights'),
(1550, 'When do you indicate in a round-about?', 'assets/20230717132200199_36510_37.PNG', 0, 'When slowing down ', 'To caution other drivers', 'When going out', '3', 63, 'When going out'),
(1551, 'What are diverging lines?', 'assets/20230717132400559_314889_38.PNG', 0, 'Transverse lines', 'Lines crossing the road ', 'One which forms two', '3', 63, 'One which forms two'),
(1552, 'What is the use of a clutch 	', 'assets/20230813130844174_232634_BB45.jpeg', 0, 'To reduce speed ', 'To avoid noise when changing gears', 'To disengage gears', '2', 63, 'To avoid noise when changing gears'),
(1553, 'What is the colour of reflector at the front of vehicles? ', 'assets/20230717132558751_892605_40.PNG', 0, 'Red reflectors', 'White reflectors', 'Yellow reflectors', '2', 63, 'White reflectors'),
(1554, 'A restrict sign signifies that ', 'assets/20230717132658726_628546_41.PNG', 0, 'Do not cross', 'Drive with caution', 'Do not exceed', '3', 63, 'Do not exceed'),
(1555, 'IN RURAL AREAS WHERE TRAFFIC IS NOT CONTROLLED', NULL, 0, ' A. GIVE WAY TO TRAFFIC FROM YOUR RIGHT  ', 'B. GIVE WAY TO TRAFFIC WHICH ENTERS THE JUNCTION BEFORE YOU ', 'C. GIVE WAY TO TRAFFIC FROM YOUR LEFT', '2', 39, 'B. GIVE WAY TO TRAFFIC WHICH ENTERS THE JUNCTION BEFORE YOU '),
(1556, 'What is used to indicate that a heavy vehicle has broken down?', NULL, 0, ' The \'L\' Plate ', 'A crash helmets ', ' A red reflective triangular sign', '3', 59, ' A red reflective triangular sign');
INSERT INTO `questions` (`id`, `question_text`, `img_insert`, `option_image`, `option_a`, `option_b`, `option_c`, `correct_option`, `exam_id`, `answer`) VALUES
(1557, 'When meeting other cars on slippery roads ', NULL, 0, 'Increase speed ', 'Reduce speed and exercise caution ', ' Stop with caution', '2', 59, 'Reduce speed and exercise caution '),
(1558, 'Which car goes first', 'assets/20230808210458204_303998_bb5.png', 0, 'CAR C', 'CAR A', 'CAR B', '1', 37, 'CAR C'),
(1559, 'When travelling at 60km/hr behind another vehicle which I do not intend to overtake I will leave a gap of...', NULL, 0, '5 cars  ', '4 cars', ' 3 cars', '2', 57, '4 cars'),
(1560, 'WHAT IS THE OVERALL STOPPING DISTANCE WHEN TRAVELLING AT 40KM/H ', NULL, 0, 'A. 36 M ', 'B.90M', ' C.18M', '3', 64, ' C.18M'),
(1561, 'A CHURCH AHEAD IS IN WHICH SIGN ', NULL, 0, 'A. DANGER WARNING SIGN ', 'B. INFORMATIVE SIGN ', 'C. REGULATORY SIGN', '2', 64, 'B. INFORMATIVE SIGN '),
(1562, 'WHEN DRIVING IN A SLIPPERY ROAD YOU ', NULL, 0, 'A. STOP', ' B. SLOW DOWN ', 'C. REDUCE SPEED AND EXERCISE CAUTIONS', '3', 64, 'C. REDUCE SPEED AND EXERCISE CAUTIONS'),
(1563, 'TRANSVERSE LINES ARE ', NULL, 0, 'A. MANDATORY ', 'B. STOP LINES ', 'C. CENTRE LINES', '2', 64, 'B. STOP LINES '),
(1564, 'WHAT IS THE OVERALL STOPPING DISTANCE WHEN TRAVELLING AT 120KM/H ', NULL, 0, 'A .140M', ' B. 150M ', 'C. 130M', '3', 64, 'C. 130M'),
(1565, 'WHAT IS THE OVERALL STOPPING DISTANCE WHEN TRAVELLING AT 60KM/H ', NULL, 0, 'A. 18M ', 'B. 90M ', 'C. 36M', '3', 64, 'C. 36M'),
(1566, 'YOU DIP YOUR LIGHTS WHEN', NULL, 0, ' A. TRAVELLING BEHIND ANOTHER VEHICLE ', 'B. APPROACHING A GIVE WAY SIGN ', 'C. AT A NARROW BRIDGE', '1', 64, ' A. TRAVELLING BEHIND ANOTHER VEHICLE '),
(1567, 'IN WHICH CLASS IS A LORRY ', NULL, 0, 'A. 5', ' B. 3 ', 'C. 2', '3', 64, 'C. 2'),
(1568, 'WHICH CLASS IS WARNING OF A ROBOT AHEAD SIGN ', NULL, 0, 'A. TRAFFIC LIGHTS ', 'B. DANGER ', 'C. CARRIAGE WAY MARKINGS', '2', 64, 'B. DANGER '),
(1569, 'A DRIVER OF A CATERPILLAR IS IN WHICH CLASS ', NULL, 0, 'A. 2 ', 'B.5 ', 'C.3', '2', 64, 'B.5 '),
(1570, 'BLUE IS COLOUR OF WHICH SIGN ', NULL, 0, 'A. DANGER WARNING', ' B. STOP  ', ' C. LAY-BYE', '3', 64, ' C. LAY-BYE'),
(1571, 'AT WHAT DISTANCE MUST YOU PLACE A RED TRIANGLE BEHIND A BROKEN DOWN VEHICLE ', NULL, 0, 'A. 30-60M ', 'B. 30-50м ', 'C. 30-90', '2', 64, 'B. 30-50м '),
(1572, '. WHAT IS THE LEGAL AGE OF CLASS 1', NULL, 0, ' A. 21 YEARS ', 'B. 24YEARS ', 'C. 25YEARS', '3', 64, 'C. 25YEARS'),
(1573, 'NEVER SHOULD YOU TURN RIGHT ', NULL, 0, 'A. ON GIVE WAY SIGNS ', 'B. INFRONT OF ONCOMING TRAFFIC ', 'C. ON T JUNCTIONS', '2', 64, 'B. INFRONT OF ONCOMING TRAFFIC '),
(1574, 'WHAT IS THE SYMBOL OF DERISTRICTION SIGN ', NULL, 0, 'A. CIRCLE ', 'B. TRIANGLE ', 'C. SQUARE', '1', 64, 'A. CIRCLE '),
(1575, 'AT A GIVE WAY SIGN WHEN I INTEND TO TURN RIGHT I SHALL ', NULL, 0, 'A. GIVE WAY TRAFFIC FROM THE RIGHT ', 'B. GIVE WAY TRAFFIC FROM THE LEFT ', 'C. GIVE WAY TRAFFIC FROM BOTH SIDES', '3', 64, 'C. GIVE WAY TRAFFIC FROM BOTH SIDES'),
(1576, 'WHAT DOES AMBER IMPLY ON A ROBOT ', NULL, 0, 'A. GO ', 'B. STOP ', 'C. PREPARE TO STOP', '3', 64, 'C. PREPARE TO STOP'),
(1577, 'A BROKEN LINE ON MY SIDE AND A CONTINUOUS LINE ON THE RIGHT MEANS ', NULL, 0, 'A. I MAY NOT OVERTAKE ', 'B. I MAY OVERTAKE IF SAFE TO DO SO ', 'C. SPEED AND OVERTAKE', '2', 64, 'B. I MAY OVERTAKE IF SAFE TO DO SO '),
(1578, 'YELLOW REFLECTORS ARE PLACED ', NULL, 0, 'A. BEHIND ', 'B. INFRONT ', 'C. ALONG THE SIDES', '3', 64, 'C. ALONG THE SIDES'),
(1579, 'WHEN SHOULD A HORN BE USED ', NULL, 0, 'A. ON BRIDGE ', 'B. EMERGENCY ', 'C. ON STOP SIGNS', '2', 64, 'B. EMERGENCY '),
(1580, 'WHAT DOCUMENTATION IS REQUIRED BEFORE A MOTOR VEHICLE IS DRIVEN ON THE ROAD ', NULL, 0, 'A. REGISTRATION BOOK,VEHICLE INSURANCE VEHICLE LICENCE ', 'B. REGISTRATION BOOK LICENCE CERTIFICATE OF FITNESS ', 'C. REGISTRATION BOOK INSURANCE.DDC ', '1', 64, 'A. REGISTRATION BOOK,VEHICLE INSURANCE VEHICLE LICENCE '),
(1581, 'A MOTOR CYCLE IS ALLOWED TO CARRY', NULL, 0, ' A. 2 PASSENGERS ', 'B. 1 PASSENGER', ' C. NONE', '2', 64, 'B. 1 PASSENGER'),
(1582, 'IS IT PERMISSIBLE TO CARRY A TEN YEAR OLD CHILD IN A PICKUP WITHOUT CANOPY ', NULL, 0, 'A. YES ', 'B. MAYBE ', 'C. NO', '3', 64, 'C. NO'),
(1583, 'WEIGHT IS USUALLY ASSOCIATED WITH ', NULL, 0, 'A. WEIGH BRIDGES', ' B. HILLS ', 'C. SHARP CURVES', '1', 64, 'A. WEIGH BRIDGES'),
(1584, '. WHICH CLASS IS WARNING OF A PAIL LEVEL CROSSING SIGN ', NULL, 0, 'A. TRAFFIC LIGHTS ', 'B. DANGER WARNING', 'C. INFORMATIVE ', '2', 64, 'B. DANGER WARNING'),
(1585, 'I may park my vehicle not closer to the corner than.', NULL, 0, '6.5m ', '8m', '7.5m', '3', 16, '7.5m'),
(1586, 'A continuous white line the centre of the road may?', NULL, 0, 'Be crossed if the road ahead is clear', 'Not be crossed for the purpose of overtaking', 'Be crossed only in highways.', '2', 16, 'Not be crossed for the purpose of overtaking'),
(1587, 'At a flashing amber robot I would ', NULL, 0, 'Give right of way to traffic coming from the left. ', 'Wait until the road ahead of you is clear', 'Give right of way to traffic coming from your right', '3', 16, 'Give right of way to traffic coming from your right'),
(1588, 'When approaching a give way sign', NULL, 0, 'I am obliged to stop before proceeding', 'I am obliged to give way to traffic approaching the intersection on your right ', 'I may proceed with caution and without stopping if there is no another approaching vehicle.', '3', 16, 'I may proceed with caution and without stopping if there is no another approaching vehicle.'),
(1589, 'When facing a red robot with illuminated straight ahead green arrow, I may? ', NULL, 0, 'Proceed straight ahead', 'Turn right should as I wish', 'Do not proceed  ', '1', 16, 'Proceed straight ahead'),
(1590, 'WHICH CAR IS BREAKING THE LAW', 'assets/20230809200948040_221399_bb16.jpg', 0, 'CAR A', 'CAR B AND A ', 'CAR B', '3', 16, 'CAR B'),
(1591, 'A heavy vehicle may tow not more than?', NULL, 0, '1 Trailer', '2 trailers ', '3 trailers', '3', 16, '3 trailers'),
(1592, 'At a robot controlled intersection when you have stopped over pedestrian crossing line does you?', NULL, 0, 'Decide to carry on', 'Reverse the vehicle', 'Stay where you are', '3', 16, 'Stay where you are'),
(1593, 'The insignia of a danger warning sign is ', NULL, 0, 'Triangle', 'Circle', 'Rectangle', '1', 16, 'Triangle'),
(1594, 'In rural areas where traffic is not controlled I should give precedence to traffic. ', NULL, 0, 'Approaching from the road on the left', 'Approaching from the road on the right', 'Traffic already in the intersection regardless of which side it may comes from.', '3', 16, 'Traffic already in the intersection regardless of which side it may comes from.'),
(1595, 'When travelling at 90km/hr ', NULL, 0, '6 Vehicles', '5 Vehicles', '7 Vehicles', '1', 16, '6 Vehicles'),
(1596, 'I must dim my head lamps when', NULL, 0, 'Approaching a railway level crossing', 'Driving in well-lit area', 'Approaching an urban area', '2', 16, 'Driving in well-lit area'),
(1597, 'When approaching a narrow bridge I must pay attention to ', NULL, 0, 'Height restrictions', 'Length restriction ', 'Width restriction', '3', 16, 'Width restriction'),
(1598, 'If involved in a serious accident I must. ', NULL, 0, 'Report to the police within 24hrs', 'Report to the hospital and call a fire brigade', 'Report to the police within 48hrs', '1', 16, 'Report to the police within 24hrs'),
(1599, 'If involved in a serious accident I must.', NULL, 0, 'Report to the police within 24hrs', 'Report to the hospital and call a fire brigade', 'Report to the police within 48hrs', '1', 11, 'Report to the police within 24hrs'),
(1600, 'When approaching a narrow bridge I must pay attention to', NULL, 0, '	Height restrictions', 'Length restriction', 'Width restriction', '3', 11, 'Width restriction'),
(1601, 'When travelling at 90km/hr .	', NULL, 0, '6 Vehicles', '5 Vehicles ', '7 Vehicles', '1', 11, '6 Vehicles'),
(1602, 'I must dim my head lamps when ', NULL, 0, 'Approaching a railway level crossing', 'Driving in well-lit area ', 'Approaching an urban area.', '2', 11, 'Driving in well-lit area '),
(1603, 'At a flashing amber robot I would ', NULL, 0, 'Give right of way to traffic coming from the left', 'Wait until the road ahead of you is clear', 'Give right of way to traffic coming from your right', '3', 11, 'Give right of way to traffic coming from your right'),
(1604, 'A continuous white line the centre of the road may? ', NULL, 0, 'Be crossed if the road ahead is clear', 'Not be crossed for the purpose of overtaking.', 'Be crossed only in highways.', '2', 11, 'Not be crossed for the purpose of overtaking.'),
(1605, 'The insignia of a danger warning sign is', NULL, 0, 'Triangle', 'Circle ', 'Rectangle', '1', 11, 'Triangle'),
(1606, 'A driver’s medical certificate is valid for how long?', NULL, 0, '24 months', '18 months', '12 months', '3', 11, '12 months'),
(1607, 'What is the colour of reflector at the front of vehicles?  ', NULL, 0, 'Red reflectors', 'White reflectors', 'Yellow reflectors', '2', 11, 'White reflectors');

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `exam_count` int(11) NOT NULL DEFAULT 0,
  `total_score` int(11) NOT NULL DEFAULT 0,
  `average_score` decimal(5,2) DEFAULT 0.00,
  `progress_summary` text DEFAULT NULL,
  `generated_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `specialization`
--

CREATE TABLE `specialization` (
  `id` int(11) NOT NULL,
  `specialization` varchar(255) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `specialization`
--

INSERT INTO `specialization` (`id`, `specialization`, `description`) VALUES
(1, 'Advanced Driving', ''),
(2, 'Commercial License', ''),
(3, 'Beginner Courses', '');

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `address` text DEFAULT NULL,
  `status` varchar(50) DEFAULT 'active',
  `package_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `user_id`, `address`, `status`, `package_id`, `created_at`) VALUES
(1, 2, '4708 Chiedza Karoi', 'inactive', 1, '2025-08-16 22:07:24'),
(4, 51, '4708 Chiedza, Karoi', 'active', 2, '2026-01-10 13:38:18');

-- --------------------------------------------------------

--
-- Table structure for table `student_exams`
--

CREATE TABLE `student_exams` (
  `id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `exam_id` int(11) NOT NULL,
  `score` int(11) DEFAULT 0,
  `completed_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_exams`
--

INSERT INTO `student_exams` (`id`, `student_id`, `exam_id`, `score`, `completed_at`) VALUES
(1, 4, 3, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `system_license`
--

CREATE TABLE `system_license` (
  `id` int(11) NOT NULL,
  `device_id` text NOT NULL,
  `system_license_key` text NOT NULL,
  `business_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','instructor','student','user') NOT NULL DEFAULT 'user',
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expires` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `first_name`, `last_name`, `email`, `phone`, `avatar`, `reset_token`, `reset_expires`, `created_at`, `updated_at`) VALUES
(1, 'admin', '$2y$10$j8KHrniTKtPcVga7/7HHUeFiPsC3vouihT6HFS85W/AhaAjTay6NG', 'admin', 'admin', 'admin', 'admin@gmail.com', NULL, NULL, NULL, NULL, '2026-01-10 09:21:06', '2026-01-10 09:21:06'),
(2, 'student', '$2y$10$mdCKQTJdXgPiTOpPbId1Mu1znniMET5nYfw5vKkc1Ds3PtvvC6roG', 'student', 'student', 'student', 'successchibayamagora@gmail.com', '+263782408596', NULL, NULL, NULL, '2026-01-10 09:21:06', '2026-01-11 00:35:28'),
(3, 'allankayz', '$2y$10$mdCKQTJdXgPiTOpPbId1Mu1znniMET5nYfw5vKkc1Ds3PtvvC6roG', 'instructor', 'Allan', 'Kanyemba', 'allankanyemba@gmail.com', '+263774833890', NULL, NULL, NULL, '2026-01-10 09:21:06', '2026-01-11 00:06:56'),
(51, 'testone', '$2y$10$mmhxXlh7Pjv6pCHXmJ/xS.U8iqL9XLVizo8nQmW6u9P2ZI85WxtJ2', 'student', 'Test', 'Two', 'testone@mail.com', '+263774833890', NULL, NULL, NULL, '2026-01-10 13:38:16', '2026-01-10 19:42:41'),
(52, 'joseph', '$2y$10$BVcCDu51bM8SNPLgy4ZE4OCGL7nOQF6JA1KwQUBb.hpDLnWnG6gUK', 'instructor', 'Joseph', 'Dzimiri', 'josephdzimiri@gmail.com', '+263782408596', NULL, NULL, NULL, '2026-01-10 14:59:17', '2026-01-10 19:41:54');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `id` int(11) NOT NULL,
  `make` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `registration` varchar(50) DEFAULT NULL,
  `type` varchar(50) DEFAULT 'car',
  `status` enum('active','maintenance','retired') DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`id`, `make`, `model`, `year`, `registration`, `type`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, 'Toyota', 'Corolla', 2018, 'ABC-123', 'car', 'active', NULL, '2026-01-10 09:21:06', '2026-01-10 09:21:06'),
(2, 'Isuzu', 'D-Max', 2019, 'TRK-001', 'truck', 'active', NULL, '2026-01-10 09:21:06', '2026-01-10 09:21:06'),
(3, 'Honda', 'CBR', 2020, 'MOT-09', 'motorcycle', 'maintenance', NULL, '2026-01-10 09:21:06', '2026-01-10 09:21:06');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `administrators`
--
ALTER TABLE `administrators`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `license_key_id` (`license_key_id`);

--
-- Indexes for table `certification`
--
ALTER TABLE `certification`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `exams`
--
ALTER TABLE `exams`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `exam_timeframe`
--
ALTER TABLE `exam_timeframe`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `instructors`
--
ALTER TABLE `instructors`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `specialization_id` (`specialization_id`),
  ADD KEY `certification_id` (`certification_id`);

--
-- Indexes for table `lessons`
--
ALTER TABLE `lessons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `instructor_id` (`instructor_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `assigned_vehicle_id` (`assigned_vehicle_id`);

--
-- Indexes for table `license_keys`
--
ALTER TABLE `license_keys`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `conversation_id` (`conversation_id`);

--
-- Indexes for table `packages`
--
ALTER TABLE `packages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `package_id` (`package_id`),
  ADD KEY `fk_payment_instructor` (`instructor_id`),
  ADD KEY `fk_payment_vehicle` (`vehicle_id`);

--
-- Indexes for table `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exam_id` (`exam_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `specialization`
--
ALTER TABLE `specialization`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `package_id` (`package_id`);

--
-- Indexes for table `student_exams`
--
ALTER TABLE `student_exams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `exam_id` (`exam_id`);

--
-- Indexes for table `system_license`
--
ALTER TABLE `system_license`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `administrators`
--
ALTER TABLE `administrators`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `certification`
--
ALTER TABLE `certification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `exams`
--
ALTER TABLE `exams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `exam_timeframe`
--
ALTER TABLE `exam_timeframe`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `instructors`
--
ALTER TABLE `instructors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `lessons`
--
ALTER TABLE `lessons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `license_keys`
--
ALTER TABLE `license_keys`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `packages`
--
ALTER TABLE `packages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1608;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `specialization`
--
ALTER TABLE `specialization`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `student_exams`
--
ALTER TABLE `student_exams`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `system_license`
--
ALTER TABLE `system_license`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `administrators`
--
ALTER TABLE `administrators`
  ADD CONSTRAINT `administrators_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `administrators_ibfk_2` FOREIGN KEY (`license_key_id`) REFERENCES `license_keys` (`id`);

--
-- Constraints for table `instructors`
--
ALTER TABLE `instructors`
  ADD CONSTRAINT `instructors_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `instructors_ibfk_2` FOREIGN KEY (`specialization_id`) REFERENCES `specialization` (`id`),
  ADD CONSTRAINT `instructors_ibfk_3` FOREIGN KEY (`certification_id`) REFERENCES `certification` (`id`);

--
-- Constraints for table `lessons`
--
ALTER TABLE `lessons`
  ADD CONSTRAINT `lessons_ibfk_1` FOREIGN KEY (`instructor_id`) REFERENCES `instructors` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `lessons_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `lessons_ibfk_3` FOREIGN KEY (`assigned_vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_payment_instructor` FOREIGN KEY (`instructor_id`) REFERENCES `instructors` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_payment_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`);

--
-- Constraints for table `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`);

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`);

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `students_ibfk_2` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`);

--
-- Constraints for table `student_exams`
--
ALTER TABLE `student_exams`
  ADD CONSTRAINT `student_exams_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `student_exams_ibfk_2` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
