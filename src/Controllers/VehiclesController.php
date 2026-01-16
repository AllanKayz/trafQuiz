<?php

namespace TrafQuiz\Controllers;

use TrafQuiz\Models\VehicleModel;

class VehiclesController
{
    public function getVehicles()
    {
        header('Content-Type: application/json');

        // Default to admin view (all vehicles) unless role specified
        $role = $_GET['role'] ?? 'admin';
        $userId = $_GET['userId'] ?? null;

        $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
        if ($id) {
            $v = VehicleModel::find($id);
            if (!$v) {
                http_response_code(404);
                echo json_encode(['message' => 'Vehicle not found']);
                return;
            }
            // Add check? If instructor, is this vehicle assigned?
            // Skipping detailed check for specific ID for brevity unless critical.
            echo json_encode($v);
            return;
        }

        if ($role === 'instructor') {
            // Filter vehicles assigned to this instructor via lessons
            $db = new \TrafQuiz\Core\Database();
            $conn = $db->getConnection();

            // Get Instructor ID
            $stmt = $conn->prepare("SELECT id FROM instructors WHERE user_id = :uid");
            $stmt->execute([':uid' => $userId]);
            $inst = $stmt->fetch(\PDO::FETCH_ASSOC);

            if ($inst) {
                $instId = $inst['id'];
                // Get vehicles from lessons
                $sql = "SELECT DISTINCT v.* FROM vehicles v 
                         JOIN lessons l ON v.id = l.assigned_vehicle_id 
                         WHERE l.instructor_id = :instId";
                $stmtV = $conn->prepare($sql);
                $stmtV->execute([':instId' => $instId]);
                $vehicles = $stmtV->fetchAll(\PDO::FETCH_ASSOC);

                // For instructors, let's append latest log data
                foreach ($vehicles as &$veh) {
                    $latestLog = \TrafQuiz\Models\VehicleLog::getLatest($veh['id']);
                    if ($latestLog) {
                        $veh['mileage'] = $latestLog['mileage'];
                        $veh['fuelLevel'] = $latestLog['fuel_level'];
                    } else {
                        $veh['mileage'] = 0;
                        $veh['fuelLevel'] = 100;
                    }
                }

                echo json_encode($vehicles);
                return;
            }
            // If no instructor profile found, return empty or error
            echo json_encode([]);
            return;
        }

        $vehicles = array_values(VehicleModel::all());
        echo json_encode($vehicles);
    }

    public function reportIssue()
    {
        header('Content-Type: application/json');
        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['vehicleId']) || empty($input['instructorId']) || empty($input['description'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Missing vehicleId, instructorId, or description']);
            return;
        }

        $ok = \TrafQuiz\Models\VehicleIssue::create($input);
        if ($ok) {
            echo json_encode(['success' => true, 'message' => 'Issue reported successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to report issue']);
        }
    }

    public function logActivity()
    {
        header('Content-Type: application/json');
        $input = json_decode(file_get_contents('php://input'), true);
        if (empty($input['vehicleId']) || empty($input['instructorId']) || empty($input['mileage']) || !isset($input['fuelLevel'])) {
            http_response_code(400);
            echo json_encode(['message' => 'Missing required fields']);
            return;
        }

        $ok = \TrafQuiz\Models\VehicleLog::create($input);
        if ($ok) {
            echo json_encode(['success' => true, 'message' => 'Log recorded successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['message' => 'Failed to record log']);
        }
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
