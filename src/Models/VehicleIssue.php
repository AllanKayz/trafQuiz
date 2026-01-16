<?php
namespace TrafQuiz\Models;

use TrafQuiz\Core\Database;

class VehicleIssue {
    public static function create($data) {
        $db = new Database();
        $conn = $db->getConnection();
        $sql = "INSERT INTO vehicle_issues (vehicle_id, instructor_id, description, severity, status) 
                VALUES (:vid, :iid, :desc, :sev, 'open')";
        $stmt = $conn->prepare($sql);
        return $stmt->execute([
            ':vid' => $data['vehicleId'],
            ':iid' => $data['instructorId'],
            ':desc' => $data['description'],
            ':sev' => $data['severity'] ?? 'low'
        ]);
    }

    public static function getByVehicle($vehicleId) {
        $db = new Database();
        $conn = $db->getConnection();
        $stmt = $conn->prepare("SELECT vi.*, u.first_name, u.last_name 
                               FROM vehicle_issues vi
                               JOIN instructors i ON vi.instructor_id = i.id
                               JOIN users u ON i.user_id = u.id
                               WHERE vi.vehicle_id = :vid
                               ORDER BY vi.created_at DESC");
        $stmt->execute([':vid' => $vehicleId]);
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public static function updateStatus($id, $status) {
        $db = new Database();
        $conn = $db->getConnection();
        $stmt = $conn->prepare("UPDATE vehicle_issues SET status = :status WHERE id = :id");
        return $stmt->execute([':status' => $status, ':id' => $id]);
    }
}
