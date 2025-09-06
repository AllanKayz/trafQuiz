<?php

namespace TrafQuiz\Controllers;

use TrafQuiz\Models\Dashboard;
use TrafQuiz\Core\TokenHandler;
use TrafQuiz\Models\Exam;

class AdminController
{

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
            echo json_encode(["message" => "Unauthorized Access", "token"=> $token]);
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
}
