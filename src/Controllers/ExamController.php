<?php

namespace TrafQuiz\Controllers;

use TrafQuiz\Models\Exam;
use TrafQuiz\Core\TokenHandler;

class ExamController
{
    public function examQuestions()
    {
        // Get userId from request
        $userId = $_GET['userId'] ?? $_REQUEST['userId'] ?? null;

        if (!$userId) {
            // Optional: if strictly required for eligibility check
            // For now, allowing proceed, but eligibility check might fail if userId is needed.
            // Or we could mock it if the user wants "no auth" to mean "everyone can access".
            // Given the prompt "remove all authorization... tokenization", I will just pass null or the ID if provided.
        }

        if ($userId && !Exam::checkEligibility($userId)) {
            http_response_code(403);
            echo json_encode(["message" => "Access Denied. Please complete payment to access exams."]);
            return;
        }

        $exam = Exam::getExam();
        echo json_encode($exam);
    }

    public function examTime()
    {
        $time = Exam::getExamTime();
        echo json_encode($time);
    }
}
