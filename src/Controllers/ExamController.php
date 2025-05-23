<?php

namespace TrafQuiz\Controllers;

use TrafQuiz\Models\Exam;
use TrafQuiz\Core\TokenHandler;

class ExamController {
    public function examQuestions() {
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

        /*/Validate the token
        $tokenHandler = new TokenHandler();
        $payload = $tokenHandler->validateToken($token);

        if(!$payload || $payload['exp'] < time()) {
            http_response_code(401);
            echo json_encode(["message" => "Unauthorized Access", "token"=> $token]);
            return;
        }*/

        $exam = Exam::getExam();
        echo json_encode($exam);
    }
	
	public function examTime() {
		$time = Exam::getExamTime();
		echo json_encode($time);
	}
}