<?php

namespace TrafQuiz\Controllers;

use TrafQuiz\Models\LessonModel;

class LessonsController
{
    public function getLessons()
    {
        header('Content-Type: application/json');
        $range = $_GET['range'] ?? null;
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
        if ($id) {
            $l = LessonModel::find($id);
            if (!$l) {
                http_response_code(404);
                echo json_encode(['message' => 'Lesson not found']);
                return;
            }
            echo json_encode($l);
            return;
        }

        $items = LessonModel::all($range);
        echo json_encode(array_values($items));
    }

    public function join()
    {
        header('Content-Type: application/json');
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $id = $input['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'Missing id']);
            return;
        }
        $res = LessonModel::join($id);
        if (!$res) {
            http_response_code(404);
            echo json_encode(['message' => 'Lesson not found']);
            return;
        }
        echo json_encode($res);
    }

    public function cancel()
    {
        header('Content-Type: application/json');
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $id = $input['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'Missing id']);
            return;
        }
        $ok = LessonModel::cancel($id);
        if (!$ok) {
            http_response_code(404);
            echo json_encode(['message' => 'Lesson not found']);
            return;
        }
        echo json_encode(['success' => true]);
    }

    public function update()
    {
        header('Content-Type: application/json');
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $id = $input['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'Missing id']);
            return;
        }
        // Remove id from payload
        $payload = $input;
        unset($payload['id']);
        $ok = LessonModel::patch($id, $payload);
        if (!$ok) {
            http_response_code(404);
            echo json_encode(['message' => 'Lesson not found']);
            return;
        }
        echo json_encode(['success' => true]);
    }

    public function add()
    {
        header('Content-Type: application/json');

        // No auth check.
        // Optional context from query params
        $role = $_GET['role'] ?? 'admin';
        $userId = $_GET['userId'] ?? null;
        $userName = $_GET['userName'] ?? null;

        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        if (!$input || empty($input['title']) || empty($input['startTime'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Missing required fields']);
            return;
        }

        // If instructor role simulated, ensure instructor id set from context
        if ($role === 'instructor') {
            if (!empty($userId)) {
                $input['instructor'] = ['id' => (int)$userId, 'name' => $userName];
            }
        }

        $new = LessonModel::add($input);
        echo json_encode($new);
    }
}
