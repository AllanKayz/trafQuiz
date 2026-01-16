<?php

namespace TrafQuiz\Models;

use TrafQuiz\Core\Database;

class VehicleLog
{
    public static function create($data)
    {
        $db = new Database();
        $conn = $db->getConnection();
        $sql = "INSERT INTO vehicle_logs (vehicle_id, instructor_id, mileage, fuel_level, notes) 
                VALUES (:vid, :iid, :mileage, :fuel, :notes)";
        $stmt = $conn->prepare($sql);
        return $stmt->execute([
            ':vid' => $data['vehicleId'],
            ':iid' => $data['instructorId'],
            ':mileage' => $data['mileage'],
            ':fuel' => $data['fuelLevel'],
            ':notes' => $data['notes'] ?? null
        ]);
    }

    public static function getLatest($vehicleId)
    {
        $db = new Database();
        $conn = $db->getConnection();
        $stmt = $conn->prepare("SELECT * FROM vehicle_logs WHERE vehicle_id = :vid ORDER BY created_at DESC LIMIT 1");
        $stmt->execute([':vid' => $vehicleId]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }
}
