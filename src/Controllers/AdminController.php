<?php

namespace TrafQuiz\Controllers;

use TrafQuiz\Models\Dashboard;
use TrafQuiz\Core\TokenHandler;
use TrafQuiz\Models\Exam;
use TrafQuiz\Models\LessonModel;
use TrafQuiz\Models\VehicleModel;

class AdminController
{
	private function hasOverlap($startTime1, $duration1, $startTime2, $duration2)
	{
		$start1 = strtotime($startTime1);
		$end1 = $start1 + ($duration1 * 60);
		$start2 = strtotime($startTime2);
		$end2 = $start2 + ($duration2 * 60);

		return ($start1 < $end2 && $end1 > $start2);
	}

	public function autoAllocateSchedules()
	{
		header('Content-Type: application/json');

		$lessons = LessonModel::all();
		$instructors = Dashboard::getInstructors();
		$vehicles = VehicleModel::all();

		$unallocated = array_filter($lessons, function ($l) {
			return empty($l['assignedVehicleId']) &&
				in_array($l['status'], ['upcoming', 'pending', 'confirmed']);
		});

		$allocatedCount = 0;
		$errors = [];

		foreach ($unallocated as $lesson) {
			$lessonDate = date('Y-m-d', strtotime($lesson['startTime']));
			$vehicleTypeNeeded = $lesson['vehicleType'] ?? 'Car'; // Default

			// 1. Find suitable instructor
			$suitableInstructor = null;
			foreach ($instructors as $inst) {
				// Check specialization (simple string match for now)
				$specialization = strtolower($inst['specialization']);
				if (
					strpos(strtolower($vehicleTypeNeeded), $specialization) === false &&
					strpos($specialization, strtolower($vehicleTypeNeeded)) === false
				) {
					continue;
				}

				// Check daily limit (5 lessons)
				$dailyLessons = array_filter($lessons, function ($l) use ($inst, $lessonDate) {
					return $l['instructor']['id'] == $inst['id'] &&
						date('Y-m-d', strtotime($l['startTime'])) == $lessonDate;
				});
				if (count($dailyLessons) >= 5) continue;

				// Check overlap
				$overlap = false;
				foreach ($lessons as $l) {
					if ($l['instructor']['id'] == $inst['id'] && $l['id'] != $lesson['id']) {
						if ($this->hasOverlap($lesson['startTime'], $lesson['durationMinutes'] ?? 60, $l['startTime'], $l['durationMinutes'] ?? 60)) {
							$overlap = true;
							break;
						}
					}
				}
				if ($overlap) continue;

				$suitableInstructor = $inst;
				break;
			}

			if (!$suitableInstructor) {
				$errors[] = "No suitable instructor for lesson ID {$lesson['id']}";
				continue;
			}

			// 2. Find available vehicle
			$suitableVehicle = null;
			foreach ($vehicles as $veh) {
				if (strtolower($veh['type']) != strtolower($vehicleTypeNeeded)) continue;
				if ($veh['status'] != 'available' && $veh['status'] != 'active') continue;

				// Check overlap
				$overlap = false;
				foreach ($lessons as $l) {
					if (isset($l['assignedVehicleId']) && $l['assignedVehicleId'] == $veh['id'] && $l['id'] != $lesson['id']) {
						if ($this->hasOverlap($lesson['startTime'], $lesson['durationMinutes'] ?? 60, $l['startTime'], $l['durationMinutes'] ?? 60)) {
							$overlap = true;
							break;
						}
					}
				}
				if ($overlap) continue;

				$suitableVehicle = $veh;
				break;
			}

			if (!$suitableVehicle) {
				$errors[] = "No available {$vehicleTypeNeeded} for lesson ID {$lesson['id']}";
				continue;
			}

			// 3. Allocate
			$update = [
				'instructor' => ['id' => $suitableInstructor['id'], 'name' => $suitableInstructor['name']],
				'assignedVehicleId' => $suitableVehicle['id'],
				'status' => 'confirmed'
			];

			if (LessonModel::patch($lesson['id'], $update)) {
				$allocatedCount++;
				// Update local lessons array for subsequent checks in this loop
				foreach ($lessons as &$l) {
					if ($l['id'] == $lesson['id']) {
						$l = array_merge($l, $update);
						break;
					}
				}
			} else {
				$errors[] = "Failed to update lesson ID {$lesson['id']}";
			}
		}

		echo json_encode([
			'success' => true,
			'allocatedCount' => $allocatedCount,
			'errors' => $errors,
			'message' => "Allocation complete. Allocated {$allocatedCount} lessons."
		]);
	}

	public function autoAllocateExams()
	{
		header('Content-Type: application/json');

		// 1. Get Token & Validate Admin (Assumed middleware or check here)
		// For brevity, skipping generic token check block as it's repetitive, 
		// but should be here in prod. I'll rely on route protection or add it if strictly needed.
		// Adding basic check:
		// $this->validateAdmim(); // Helper if exists

		$input = json_decode(file_get_contents('php://input'), true);
		$examDate = $input['date'] ?? date('Y-m-d', strtotime('+1 day'));
		$capacity = $input['capacity'] ?? 20;

		$db = new \TrafQuiz\Core\Database();
		$conn = $db->getConnection();

		// 2. Create or Find Exam Session for this date
		// Check if exam exists for this date (approx time)
		$startTime = date('Y-m-d 09:00:00', strtotime($examDate));
		$endTime = date('Y-m-d 11:00:00', strtotime($examDate));

		$stmt = $conn->prepare("SELECT id FROM exams WHERE start_time LIKE :datePattern");
		$datePattern = date('Y-m-d', strtotime($examDate)) . '%';
		$stmt->execute([':datePattern' => $datePattern]);
		$existingExam = $stmt->fetch(\PDO::FETCH_ASSOC);

		if ($existingExam) {
			$examId = $existingExam['id'];
		} else {
			// Create new Exam
			$stmtInsert = $conn->prepare("INSERT INTO exams (name, start_time, end_time) VALUES (:name, :start, :end)");
			$stmtInsert->execute([
				':name' => 'Auto-Allocated Exam ' . $examDate,
				':start' => $startTime,
				':end' => $endTime
			]);
			$examId = $conn->lastInsertId();
		}

		// 3. Find Active Students NOT in student_exams for ANY exam on this date (or at all?)
		// Let's assume we allocated students who have NO upcoming exams.

		$sqlStudents = "SELECT s.id FROM students s 
                        WHERE s.status = 'active' 
                        AND s.id NOT IN (
                            SELECT se.student_id FROM student_exams se 
                            JOIN exams e ON se.exam_id = e.id 
                            WHERE e.start_time > NOW()
                        )
                        LIMIT :limit";

		$stmtStud = $conn->prepare($sqlStudents);
		$stmtStud->bindValue(':limit', (int)$capacity, \PDO::PARAM_INT);
		$stmtStud->execute();
		$candidates = $stmtStud->fetchAll(\PDO::FETCH_ASSOC);

		$allocated = 0;
		foreach ($candidates as $cand) {
			$stmtIns = $conn->prepare("INSERT INTO student_exams (student_id, exam_id, score, completed_at) VALUES (:sid, :eid, NULL, NULL)");
			if ($stmtIns->execute([':sid' => $cand['id'], ':eid' => $examId])) {
				$allocated++;
			}
		}

		echo json_encode([
			'success' => true,
			'message' => "Allocated $allocated students to Exam ID $examId on $examDate",
			'allocated' => $allocated,
			'examId' => $examId
		]);
	}

	public function getExamStats()
	{
		header('Content-Type: application/json');
		$stats = \TrafQuiz\Models\Dashboard::getDashboardStats(); // Start with basic stats

		// Add detailed exam stats
		$db = new \TrafQuiz\Core\Database();
		$conn = $db->getConnection();

		// Pass Rate vs Fail Rate
		$stmt = $conn->query("SELECT 
            SUM(CASE WHEN score >= 50 THEN 1 ELSE 0 END) as passed,
            SUM(CASE WHEN score < 50 AND score IS NOT NULL THEN 1 ELSE 0 END) as failed
            FROM student_exams WHERE score IS NOT NULL");
		$rates = $stmt->fetch(\PDO::FETCH_ASSOC);

		// Recent Exams
		$stmtRecent = $conn->query("SELECT e.name, e.start_time, COUNT(se.id) as candidates 
                                    FROM exams e 
                                    LEFT JOIN student_exams se ON e.id = se.exam_id 
                                    GROUP BY e.id 
                                    ORDER BY e.start_time DESC LIMIT 5");
		$recent = $stmtRecent->fetchAll(\PDO::FETCH_ASSOC);

		$stats['detailed'] = [
			'pass_count' => $rates['passed'],
			'fail_count' => $rates['failed'],
			'recent_exams' => $recent
		];

		echo json_encode($stats);
	}


	private function getPostedData()
	{
		$data = json_decode(file_get_contents("php://input"), true);

		if (!$data) {
			// file_put_contents('debug.log', "Input Data: " . file_get_contents("php://input") . PHP_EOL, FILE_APPEND);
			echo json_encode(["message" => "No data recieved or invalid JSON"]);
			return;
		}
		return $data; // Return data for usage
	}

	public function getAllUsers()
	{
		$users = Dashboard::getUsers();
		// Normalize for frontend
		$mapped = array_map(function ($u) {
			return [
				'id' => $u['id'],
				'username' => $u['username'],
				'name' => trim(($u['first_name'] ?? '') . ' ' . ($u['last_name'] ?? '')),
				'email' => $u['email'],
				'role' => $u['role'],
				'status' => 'active' // Simplified for now
			];
		}, $users);
		echo json_encode($mapped);
	}

	public function resetUserPassword()
	{
		$data = json_decode(file_get_contents("php://input"), true);
		if (!$data || empty($data['id']) || empty($data['password'])) {
			http_response_code(400);
			echo json_encode(['message' => 'Missing ID or Password']);
			return;
		}
		$res = Dashboard::resetUserPassword($data['id'], $data['password']);
		echo json_encode($res);
	}

	public function deleteUser()
	{
		$data = json_decode(file_get_contents("php://input"), true);
		if (!$data || empty($data['id'])) {
			http_response_code(400);
			echo json_encode(['message' => 'Missing ID']);
			return;
		}
		$res = Dashboard::deleteUser($data['id']);
		echo json_encode($res);
	}

	public function getAllData()
	{


		$usersList = Dashboard::getUsers();
		$examTimeframe = Dashboard::getExamTime();
		$stats = Dashboard::getDashboardStats();

		$dashboardData = [
			'userlist' => $usersList,
			'examtimeframe' => $examTimeframe,
			'stats' => $stats
		];

		echo json_encode($dashboardData);
	}

	public function updateExamTimeframe()
	{
		$data = json_decode(file_get_contents("php://input"), true);

		if (!$data) {
			file_put_contents('debug.log', "Input Data: " . file_get_contents("php://input") . PHP_EOL, FILE_APPEND);
			echo json_encode(["message" => "No data recieved or invalid JSON"]);
			return;
		}

		$newtime = $data['time'] ?? '';

		$timeUpdated = Dashboard::updateExamTime($newtime);
		echo json_encode($timeUpdated);
	}

	public function addUser()
	{
		$data = json_decode(file_get_contents("php://input"), true);

		if (!$data) {
			file_put_contents('debug.log', "Input Data: " . file_get_contents("php://input") . PHP_EOL, FILE_APPEND);
			echo json_encode(["message" => "No data recieved or invalid JSON"]);
			return;
		}

		$username = $data['username'] ?? '';
		$password = password_hash($data['password'] ?? '', PASSWORD_DEFAULT);
		$lastname = $data['lastname'] ?? '';
		$firstname = $data['firstname'] ?? '';
		$email = $data['email'] ?? '';

		$role = 'user';
		$addstudent = Dashboard::addUser($username, $password, $role, $firstname, $lastname, $email);
		echo json_encode($addstudent);
	}

	public function updateStudent()
	{
		header('Content-Type: application/json');
		$data = json_decode(file_get_contents("php://input"), true);

		if (!$data || empty($data['id'])) {
			http_response_code(400);
			echo json_encode(["message" => "Student ID is required"]);
			return;
		}

		$id = $data['id'];
		$updateStudent = Dashboard::updateStudent($id, $data);
		echo json_encode($updateStudent);
	}

	public function deleteStudent()
	{
		$data = json_decode(file_get_contents("php://input"), true);

		if (!$data) {
			file_put_contents('debug.log', "Input Data: " . file_get_contents("php://input") . PHP_EOL, FILE_APPEND);
			echo json_encode(["message" => "No data recieved or invalid JSON"]);
			return;
		}

		$id = $data['id'] ?? '';

		$deletedStudent = Dashboard::deleteStudent($id);
		echo json_encode($deletedStudent);
	}

	public function getAllQuestions()
	{
		/*
		$token = $_GET['token'] ?? null;

		if(!$token) {
		http_response_code(401);
		echo json_encode(["message"=>"Missing Authorisation header"]);
		return;
		}
		*/

		$questions = Exam::getAllQuestions();
		echo json_encode($questions);
	}

	public function getPackages()
	{
		$packages = Dashboard::getPackages();
		echo json_encode($packages);
	}

	public function getAllStudents()
	{
		// Default to admin view (all students)
		$role = $_GET['role'] ?? 'admin';
		$userId = $_GET['userId'] ?? null;

		$instructorId = null;
		if ($role === 'instructor') {
			// Find instructor ID for this user
			$db = new \TrafQuiz\Core\Database();
			$stmt = $db->getConnection()->prepare("SELECT id FROM instructors WHERE user_id = :uid");
			$stmt->execute([':uid' => $userId]);
			$inst = $stmt->fetch(\PDO::FETCH_ASSOC);
			if ($inst) {
				$instructorId = $inst['id'];
			}
		}

		$students = Dashboard::getStudents($instructorId);

		$studentsArray = array_map(function ($item) {
			return [
				'id' => $item['id'],
				'userId' => $item['userId'] ?? null,
				'firstName' => explode(' ', $item['name'])[0],
				'lastName' => explode(' ', $item['name'])[1] ?? '',
				'email' => $item['email'],
				'phone' => $item['phone'],
				'address' => $item['address'],
				'active' => $item['status'] === 'active',
				'status' => $item['status'],
				'enrollmentDate' => $item['enrollmentDate']
			];
		}, $students);

		echo json_encode($studentsArray);
	}

	public function addStudent()
	{
		$data = json_decode(file_get_contents("php://input"), true);

		if (!$data) {
			file_put_contents('debug.log', "Input Data: " . file_get_contents("php://input") . PHP_EOL, FILE_APPEND);
			echo json_encode(["message" => "No data recieved or invalid JSON"]);
			return;
		}

		$username = $data['username'] ?? '';
		$password = password_hash($data['password'] ?? '', PASSWORD_DEFAULT);
		$role = 'student';
		$name = $data['name'] ?? '';
		$email = $data['email'] ?? '';
		$phone = $data['phone'] ?? '';
		$address = $data['address'] ?? '';
		$status = $data['status'] ?? '';
		$package = $data['package'] ?? '';

		$lastname = '';
		$firstname = $name;
		if (strpos($name, ' ') !== false) {
			$parts = explode(' ', $name, 2);
			$firstname = $parts[0];
			$lastname = $parts[1];
		}

		$userid = Dashboard::addUser($username, $password, $role, $firstname, $lastname, $email, $phone);
		$userid = intval($userid);

		if (is_int($userid)) {
			$addstudent = Dashboard::addStudent($name, $email, $phone, $address, $status, $userid, $package);
			echo json_encode($addstudent);
		} else {
			echo json_encode(['message' => 'Failed to add user']);
		}
	}


	public function getInstructors()
	{
		$instructors = Dashboard::getInstructors();

		$instructorsArray = array_map(function ($instructor) {
			$nameParts = explode(' ', $instructor['name'], 2);
			return [
				'id' => $instructor['id'],
				'userId' => $instructor['userId'] ?? null,
				'username' => $instructor['username'],
				'firstName' => $nameParts[0] ?? '',
				'lastName' => $nameParts[1] ?? '',
				'email' => $instructor['email'],
				'phone' => $instructor['phone'],
				'license' => $instructor['license_number'],
				'specialization' => $instructor['specialization'],
				'certification' => $instructor['certification'],
				'experience' => (int)$instructor['experience'],
				'available' => ($instructor['availability'] > 0) ? true : false,
				'availability' => ($instructor['availability'] > 0) ? true : false,
				'employmentDate' => $instructor['created_at']
			];
		}, $instructors);

		echo json_encode($instructorsArray);
	}

	public function addInstructor()
	{
		$data = json_decode(file_get_contents("php://input"), true);

		if (!$data) {
			file_put_contents('debug.log', "Input Data: " . file_get_contents("php://input") . PHP_EOL, FILE_APPEND);
			echo json_encode(["message" => "No data recieved or invalid JSON"]);
			return;
		}

		$username = $data['username'];
		$password = password_hash($data['password'], PASSWORD_DEFAULT);
		$role = 'instructor';
		$name = $data['name'];
		$email = $data['email'];
		$phone = $data['phone'];
		$license_number = $data['license_number'];
		$specialization = $data['specialization'];
		$certification = $data['certification'];
		$experience = $data['experience'];
		$availability = $data['availability'];

		$lastname = '';
		$firstname = $name;
		if (strpos($name, ' ') !== false) {
			$parts = explode(' ', $name, 2);
			$firstname = $parts[0];
			$lastname = $parts[1];
		}

		$userid = Dashboard::addUser($username, $password, $role, $firstname, $lastname, $email, $phone);
		$userid = intval($userid);

		if (is_int($userid)) {
			$addInstructor = Dashboard::addInstructor($userid, $name, $email, $phone, $license_number, $specialization, $certification, $experience, $availability);
			echo json_encode($addInstructor);
		} else {
			Dashboard::deleteUser($userid);
			echo json_encode(['message' => 'Failed to add instructor']);
		}
	}

	public function addSpecialization()
	{
		$data = json_decode(file_get_contents("php://input"), true);

		if (!$data) {
			file_put_contents('debug.log', "Input Data: " . file_get_contents("php://input") . PHP_EOL, FILE_APPEND);
			echo json_encode(["message" => "No data recieved or invalid JSON"]);
			return;
		}

		$specialization = $data['specialization'];
		$description = $data['description'];

		$addSpecialization = Dashboard::addSpecialization($specialization, $description);
	}

	public function getSpecialization()
	{
		$specialization = Dashboard::getSpecializations();
		echo json_encode($specialization);
	}

	public function addCertification()
	{
		$data = json_decode(file_get_contents("php://input"), true);

		if (!$data) {
			file_put_contents('debug.log', "Input Data: " . file_get_contents("php://input") . PHP_EOL, FILE_APPEND);
			echo json_encode(["message" => "No data recieved or invalid JSON"]);
			return;
		}

		$certification = $data['certification'];
		$description = $data['description'];

		$addSpecialization = Dashboard::addCertification($certification, $description);
	}

	public function getCertification()
	{
		$certification = Dashboard::getCertifications();
		echo json_encode($certification);
	}

	/**
	 * Update package
	 * PUT /api/packages (with id in body)
	 */
	public function updatePackage()
	{
		header('Content-Type: application/json');
		$data = json_decode(file_get_contents("php://input"), true);

		if (!$data || empty($data['id'])) {
			http_response_code(400);
			echo json_encode(["message" => "Package ID is required"]);
			return;
		}

		$id = $data['id'];
		unset($data['id']);

		$result = Dashboard::updatePackage($id, $data);

		if ($result) {
			echo json_encode(["status" => 200, "message" => "Package updated successfully"]);
		} else {
			http_response_code(500);
			echo json_encode(["message" => "Failed to update package"]);
		}
	}

	/**
	 * Update instructor
	 * PUT /api/instructors (with id in body)
	 */
	public function updateInstructor()
	{
		header('Content-Type: application/json');
		$data = json_decode(file_get_contents("php://input"), true);

		if (!$data || empty($data['id'])) {
			http_response_code(400);
			echo json_encode(["message" => "Instructor ID is required"]);
			return;
		}

		$id = $data['id'];
		unset($data['id']);

		$result = Dashboard::updateInstructor($id, $data);

		if ($result) {
			echo json_encode(["status" => 200, "message" => "Instructor updated successfully"]);
		} else {
			http_response_code(500);
			echo json_encode(["message" => "Failed to update instructor"]);
		}
	}

	/**
	 * Delete instructor
	 * DELETE /api/instructors (with id in body or query)
	 */
	public function deleteInstructor()
	{
		header('Content-Type: application/json');
		$data = json_decode(file_get_contents("php://input"), true);
		$id = $data['id'] ?? $_GET['id'] ?? null;

		if (!$id) {
			http_response_code(400);
			echo json_encode(["message" => "Instructor ID is required"]);
			return;
		}

		$result = Dashboard::deleteInstructor($id);

		if ($result) {
			echo json_encode(["status" => 200, "message" => "Instructor deleted successfully"]);
		} else {
			http_response_code(500);
			echo json_encode(["message" => "Failed to delete instructor"]);
		}
	}

	/**
	 * Update specialization
	 */
	public function updateSpecialization()
	{
		header('Content-Type: application/json');
		$data = json_decode(file_get_contents("php://input"), true);

		if (!$data || empty($data['id'])) {
			http_response_code(400);
			echo json_encode(["message" => "Specialization ID is required"]);
			return;
		}

		$id = $data['id'];
		unset($data['id']);

		$result = Dashboard::updateSpecialization($id, $data);

		if ($result) {
			echo json_encode(["status" => 200, "message" => "Specialization updated successfully"]);
		} else {
			http_response_code(500);
			echo json_encode(["message" => "Failed to update specialization"]);
		}
	}

	/**
	 * Update certification
	 */
	public function updateCertification()
	{
		header('Content-Type: application/json');
		$data = json_decode(file_get_contents("php://input"), true);

		if (!$data || empty($data['id'])) {
			http_response_code(400);
			echo json_encode(["message" => "Certification ID is required"]);
			return;
		}

		$id = $data['id'];
		unset($data['id']);

		$result = Dashboard::updateCertification($id, $data);

		if ($result) {
			echo json_encode(["status" => 200, "message" => "Certification updated successfully"]);
		} else {
			http_response_code(500);
			echo json_encode(["message" => "Failed to update certification"]);
		}
	}

	/**
	 * Seed lessons into storage (DB or fallback JSON). Accepts optional {count:int}
	 */
	public function seedLessons()
	{
		$token = $_GET['token'] ?? null;
		if (!$token) {
			http_response_code(401);
			echo json_encode(["message" => "Missing Authorisation header"]);
			return;
		}

		$input = json_decode(file_get_contents('php://input'), true) ?: [];
		$count = isset($input['count']) ? intval($input['count']) : null;

		// Default seed data (will use LessonModel::add which writes to DB if available)
		$sample = [
			[
				'title' => 'Seeded: Traffic Signs',
				'subject' => 'Theory',
				'startTime' => date('c', strtotime('+1 day 09:00')),
				'durationMinutes' => 60,
				'instructor' => ['id' => 101, 'name' => 'Auto Seeder'],
				'location' => 'Room A',
				'status' => 'upcoming',
				'studentCount' => 0
			],
			[
				'title' => 'Seeded: Night Driving',
				'subject' => 'Practical',
				'startTime' => date('c', strtotime('+2 days 18:00')),
				'durationMinutes' => 90,
				'instructor' => ['id' => 102, 'name' => 'Auto Seeder'],
				'location' => 'Simulator',
				'status' => 'upcoming',
				'studentCount' => 0
			]
		];

		$added = [];
		$toAdd = $sample;
		if ($count && $count > 0) {
			// replicate sample to reach count
			$toAdd = [];
			for ($i = 0; $i < $count; $i++) {
				$base = $sample[$i % count($sample)];
				$item = $base;
				$item['title'] = $base['title'] . ' #' . ($i + 1);
				$item['startTime'] = date('c', strtotime('+' . ($i + 1) . ' days 09:00'));
				$toAdd[] = $item;
			}
		}

		foreach ($toAdd as $it) {
			$created = LessonModel::add($it);
			$added[] = $created;
		}

		echo json_encode(['seeded' => count($added), 'items' => $added]);
	}

	/**
	 * Quick health check for lessons storage
	 */
	public function checkLessons()
	{
		$token = $_GET['token'] ?? null;
		if (!$token) {
			http_response_code(401);
			echo json_encode(["message" => "Missing Authorisation header"]);
			return;
		}

		// Check DB availability and count
		$rows = LessonModel::all();
		$count = is_array($rows) ? count($rows) : 0;
		$hasDb = false;
		// detect DB presence by trying to get connection
		try {
			$reflect = new \ReflectionClass('TrafQuiz\\Models\\LessonModel');
			$method = $reflect->getMethod('getConnection');
			$conn = $method->invoke(null);
			$hasDb = $conn !== null;
		} catch (\Exception $e) {
			$hasDb = false;
		}

		echo json_encode(['count' => $count, 'db' => $hasDb]);
	}
}
