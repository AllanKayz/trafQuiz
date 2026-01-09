use TrafQuiz\Models\Dashboard;
use TrafQuiz\Core\TokenHandler;
use TrafQuiz\Models\Exam;
use TrafQuiz\Models\LessonModel;
use TrafQuiz\Models\VehicleModel;

class AdminController
{
private function hasOverlap($startTime1, $duration1, $startTime2, $duration2) {
$start1 = strtotime($startTime1);
$end1 = $start1 + ($duration1 * 60);
$start2 = strtotime($startTime2);
$end2 = $start2 + ($duration2 * 60);

return ($start1 < $end2 && $end1> $start2);
	}

	public function autoAllocateSchedules() {
	header('Content-Type: application/json');

	$lessons = LessonModel::all();
	$instructors = Dashboard::getInstructors();
	$vehicles = VehicleModel::all();

	$unallocated = array_filter($lessons, function($l) {
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
	if (strpos(strtolower($vehicleTypeNeeded), $specialization) === false &&
	strpos($specialization, strtolower($vehicleTypeNeeded)) === false) {
	continue;
	}

	// Check daily limit (5 lessons)
	$dailyLessons = array_filter($lessons, function($l) use ($inst, $lessonDate) {
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

	private function tokenValidation($tkn)
	{
	$token = $_GET[$tkn] ?? null;

	if (!$token) {
	http_response_code(401);
	echo json_encode(["message" => "Missing Authorisation header"]);
	return;
	}
	}

	private function getPostedData()
	{
	$data = json_decode(file_get_contents("php://input"), true);

	if (!$data) {
	file_put_contents('debug.log', "Input Data: " . file_get_contents("php://input") . PHP_EOL, FILE_APPEND);
	echo json_encode(["message" => "No data recieved or invalid JSON"]);
	return;
	}
	}

	public function getAllData()
	{
	//Get the Authorization header
	//$headers = getallheaders();
	//$authHeader = $headers['Authorization'] ?? null;

	$token = $_GET['token'] ?? null;

	//Check kana ichisvika Authorisation yacho
	if (!$token) {
	http_response_code(401);
	echo json_encode(["message" => "Missing Authorisation header"]);
	return;
	}

	//Extract the token from the Authorization header
	//$token = str_replace('Bearer ', '', $authHeader);

	//Validate the token
	/*$tokenHandler = new TokenHandler();
	$payload = $tokenHandler->validateToken($token);

	if(!$payload || $payload['exp'] < time()) {
		http_response_code(401);
		echo json_encode(["message"=> "Unauthorized Access", "token"=> $token]);
		return;
		} */

		$usersList = Dashboard::getUsers();
		$examTimeframe = Dashboard::getExamTime();

		$dashboardData = [
		'userlist' => $usersList,
		'examtimeframe' => $examTimeframe
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

		$addstudent = Dashboard::addUser($username, $password, $email, $firstname, $lastname);
		echo json_encode($addstudent);
		}

		public function updateStudent()
		{
		$data = json_decode(file_get_contents("php://input"), true);

		if (!$data) {
		file_put_contents('debug.log', "Input Data: " . file_get_contents("php://input") . PHP_EOL, FILE_APPEND);
		echo json_encode(["message" => "No data recieved or invalid JSON"]);
		return;
		}

		$status = $data['status'] ?? '';
		$address = $data['address'] ?? '';
		$phone = $data['phone'] ?? '';
		$name = $data['name'] ?? '';
		$email = $data['email'] ?? '';
		$id = $data['id'] ?? '';

		$updateStudent = Dashboard::updateStudent($id, $name, $email, $phone, $address, $status);
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
		$students = Dashboard::getStudents();

		$studentsArray = array_map(function ($item) {
		return [
		'id' => $item['id'],
		'firstName' => explode(' ', $item['name'])[0],
		'lastName' => explode(' ', $item['name'])[1],
		'email' => $item['email'],
		'phone' => $item['phone'],
		'address' => $item['address'],
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

		$userid = Dashboard::addUser($username, $password, $role);
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
		return [
		'id' => $instructor['id'],
		'username' => $instructor['username'],
		'firstName' => explode(' ', $instructor['name'])[0],
		'lastName' => explode(' ', $instructor['name'])[1],
		'email' => $instructor['email'],
		'phone' => $instructor['phone'],
		'license' => $instructor['license_number'],
		'specialization' => $instructor['specialization'],
		'certification' => $instructor['certification'],
		'experience' => $instructor['experience'],
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

		$userid = Dashboard::addUser($username, $password, $role);
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
			$base=$sample[$i % count($sample)];
			$item=$base;
			$item['title']=$base['title'] . ' #' . ($i + 1);
			$item['startTime']=date('c', strtotime('+' . ($i + 1) . ' days 09:00' ));
			$toAdd[]=$item;
			}
			}

			foreach ($toAdd as $it) {
			$created=LessonModel::add($it);
			$added[]=$created;
			}

			echo json_encode(['seeded'=> count($added), 'items' => $added]);
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
			$method->setAccessible(true);
			$conn = $method->invoke(null);
			$hasDb = $conn !== null;
			} catch (\Exception $e) {
			$hasDb = false;
			}

			echo json_encode(['count' => $count, 'db' => $hasDb]);
			}
			}