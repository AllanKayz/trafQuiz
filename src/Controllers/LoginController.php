<?php

namespace TrafQuiz\Controllers;

use TrafQuiz\Models\User;
use TrafQuiz\Core\TokenHandler;
use TrafQuiz\Core\Auth;

class LoginController {
    
    public function login() {
        $data = json_decode(file_get_contents("php://input"), true);
		
		if(!$data) {
			file_put_contents('debug.log',"Input Data: " . file_get_contents("php://input") . PHP_EOL, FILE_APPEND);
			echo json_encode(["message" => "No data recieved or invalid JSON"]);
			return;
		}

        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';

        $user = User::findByUsername($username);

        if($user && password_verify($password, $user['password'])) {
            //Generate Token 
            $tokenHandler = new TokenHandler();
            $token = $tokenHandler->generateToken([
                "id" => $user['id'],
                "username" => $user['username'],
                "exp" => time() + 3600 //Token expire in 1 hour
            ]);

            Auth::login($user);
            echo json_encode(["status" =>"200", "message"=>"OK", "token" => $token, "username" => $username, "role" => $user['role']]);
        } else {
            http_response_code(401);
            echo json_encode("Invalid Credentials");
        }
		
    }

    public function logout() {
        Auth::logout();
        header("Location: /trafQuiz/api/login");
    }
}