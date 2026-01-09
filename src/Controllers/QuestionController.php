<?php

namespace TrafQuiz\Controllers;

use TrafQuiz\Models\Exam;

class QuestionController
{

    /**
     * Get all questions
     * GET /api/questions
     */
    public function getAllQuestions()
    {
        header('Content-Type: application/json');

        $questions = Exam::getAllQuestions();
        echo json_encode($questions);
    }

    /**
     * Create new question
     * POST /api/questions
     */
    public function create()
    {
        header('Content-Type: application/json');

        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            http_response_code(400);
            echo json_encode(["message" => "No data received or invalid JSON"]);
            return;
        }

        // Validate required fields
        if (empty($data['question']) || empty($data['options'])) {
            http_response_code(400);
            echo json_encode(["message" => "Question text and options are required"]);
            return;
        }

        $result = Exam::createQuestion($data);

        if ($result) {
            http_response_code(201);
            echo json_encode([
                "status" => 201,
                "message" => "Question created successfully",
                "question" => $result
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Failed to create question"]);
        }
    }

    /**
     * Update question
     * PUT /api/questions
     */
    public function update()
    {
        header('Content-Type: application/json');

        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data || empty($data['id'])) {
            http_response_code(400);
            echo json_encode(["message" => "Question ID is required"]);
            return;
        }

        $id = $data['id'];
        unset($data['id']);

        $result = Exam::updateQuestion($id, $data);

        if ($result) {
            echo json_encode([
                "status" => 200,
                "message" => "Question updated successfully"
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Failed to update question"]);
        }
    }

    /**
     * Delete question
     * DELETE /api/questions
     */
    public function delete()
    {
        header('Content-Type: application/json');

        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['id'] ?? $_GET['id'] ?? null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(["message" => "Question ID is required"]);
            return;
        }

        $result = Exam::deleteQuestion($id);

        if ($result) {
            echo json_encode([
                "status" => 200,
                "message" => "Question deleted successfully"
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Failed to delete question"]);
        }
    }
}
