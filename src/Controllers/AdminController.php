<?php

namespace TrafQuiz\Controllers;

use TrafQuiz\Models\Dashboard;
use TrafQuiz\Core\TokenHandler;

class AdminController {
    public function getAllData() {
        //Get the Authorization header
        //$headers = getallheaders();
        //$authHeader = $headers['Authorization'] ?? null;
		
		$token = $_GET['token'] ?? null;
		
		//Check kana ichisvika Authorisation yacho
		if(!$token) {
			http_response_code(401);
			echo json_encode(["message"=>"Missing Authorisation header"]);
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

    public function updateExamTimeframe() {
        $data = json_decode(file_get_contents("php://input"), true);
		
		if(!$data) {
			file_put_contents('debug.log',"Input Data: " . file_get_contents("php://input") . PHP_EOL, FILE_APPEND);
			echo json_encode(["message" => "No data recieved or invalid JSON"]);
			return;
		}

        $newtime = $data['time'] ?? '';

        $timeUpdated = Dashboard::updateExamTime($newtime);
        echo json_encode($timeUpdated);        
    }

    public function addStudent() {
        $data = json_decode(file_get_contents("php://input"), true);
		
		if(!$data) {
			file_put_contents('debug.log',"Input Data: " . file_get_contents("php://input") . PHP_EOL, FILE_APPEND);
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

    public function updateStudent() {
        $data = json_decode(file_get_contents("php://input"), true);
		
		if(!$data) {
			file_put_contents('debug.log',"Input Data: " . file_get_contents("php://input") . PHP_EOL, FILE_APPEND);
			echo json_encode(["message" => "No data recieved or invalid JSON"]);
			return;
		}

        $username = $data['username'] ?? '';
        $password = password_hash($data['password'] ?? '', PASSWORD_DEFAULT);
        $lastname = $data['lastname'] ?? '';
        $firstname = $data['firstname'] ?? '';
        $email = $data['email'] ?? '';
        $id = $data['id'] ?? '';

        $updateStudent = Dashboard::updateUser($username, $password, $lastname, $firstname, $email, $id);
        echo json_encode($updateStudent);
    }

    public function deleteStudent() {
        $data = json_decode(file_get_contents("php://input"), true);
		
		if(!$data) {
			file_put_contents('debug.log',"Input Data: " . file_get_contents("php://input") . PHP_EOL, FILE_APPEND);
			echo json_encode(["message" => "No data recieved or invalid JSON"]);
			return;
		}

        $id = $data['id'] ?? '';

        $deletedStudent = Dashboard::deleteUser($id);
        echo json_encode($deletedStudent);
    }
}