<?php

namespace TrafQuiz\Controllers;

use TrafQuiz\Models\LessonModel;

class LessonsController {
    public function getLessons() {
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

    public function join() {
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

    public function cancel() {
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

    public function update() {
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

    public function add() {
        header('Content-Type: application/json');

        // Minimal auth: token must be provided and contain role 'admin' or 'instructor'
        $token = $_GET['token'] ?? null;
        if (!$token) {
            http_response_code(401);
            echo json_encode(['message' => 'Missing token']);
            return;
        }

        $th = new \TrafQuiz\Core\TokenHandler();
        $payload = $th->validateToken($token);
        if (!$payload || empty($payload['role']) || !in_array($payload['role'], ['admin', 'instructor'])) {
            http_response_code(403);
            echo json_encode(['message' => 'Forbidden: insufficient role']);
            return;
        }

        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        if (!$input || empty($input['title']) || empty($input['startTime'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Missing required fields']);
            return;
        }

        // If instructor role, ensure instructor id comes from token payload if available
        if ($payload['role'] === 'instructor') {
            if (!empty($payload['id'])) {
                $input['instructor'] = ['id' => (int)$payload['id'], 'name' => $payload['name'] ?? null];
            }
        }

        $new = LessonModel::add($input);
        echo json_encode($new);
    }
}
