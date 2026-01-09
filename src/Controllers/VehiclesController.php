<?php

namespace TrafQuiz\Controllers;

use TrafQuiz\Models\VehicleModel;

class VehiclesController
{
    public function getVehicles()
    {
        header('Content-Type: application/json');
        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
        if ($id) {
            $v = VehicleModel::find($id);
            if (!$v) {
                http_response_code(404);
                echo json_encode(['message' => 'Vehicle not found']);
                return;
            }
            echo json_encode($v);
            return;
        }
        echo json_encode(array_values(VehicleModel::all()));
    }

    public function add()
    {
        header('Content-Type: application/json');
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        if (empty($input['make']) || empty($input['model'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Missing required fields (make, model)']);
            return;
        }
        $created = VehicleModel::create($input);
        if (!$created) {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to create vehicle']);
            return;
        }
        echo json_encode($created);
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
        unset($input['id']);
        $ok = VehicleModel::update($id, $input);
        if (!$ok) {
            http_response_code(404);
            echo json_encode(['message' => 'Vehicle not found']);
            return;
        }
        echo json_encode(['success' => true]);
    }

    public function delete()
    {
        header('Content-Type: application/json');
        $input = json_decode(file_get_contents('php://input'), true) ?: $_POST;
        $id = $input['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['message' => 'Missing id']);
            return;
        }
        $ok = VehicleModel::delete($id);
        if (!$ok) {
            http_response_code(404);
            echo json_encode(['message' => 'Vehicle not found']);
            return;
        }
        echo json_encode(['success' => true]);
    }
}
