<?php

namespace TrafQuiz\Models;

use TrafQuiz\Core\Database;

class VehicleModel
{
    public static function all()
    {
        $db = new Database();
        $conn = $db->getConnection();

        $sql = "SELECT * FROM vehicles";
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    public static function find($id)
    {
        $db = new Database();
        $conn = $db->getConnection();

        $sql = "SELECT * FROM vehicles WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(\PDO::FETCH_ASSOC);
    }

    /**
     * Create new vehicle
     */
    public static function create($data)
    {
        $db = new Database();
        $conn = $db->getConnection();

        $sql = "INSERT INTO vehicles (make, model, year, registration, type, status, notes) 
                VALUES (:make, :model, :year, :registration, :type, :status, :notes)";

        $stmt = $conn->prepare($sql);
        $result = $stmt->execute([
            ':make' => $data['make'] ?? '',
            ':model' => $data['model'] ?? '',
            ':year' => $data['year'] ?? date('Y'),
            ':registration' => $data['registration'] ?? '',
            ':type' => $data['type'] ?? 'car',
            ':status' => $data['status'] ?? 'active',
            ':notes' => $data['notes'] ?? null
        ]);

        if ($result) {
            return self::find($conn->lastInsertId());
        }

        return false;
    }

    /**
     * Update vehicle
     */
    public static function update($id, $data)
    {
        $db = new Database();
        $conn = $db->getConnection();

        $updates = [];
        $params = [':id' => $id];

        $allowedFields = ['make', 'model', 'year', 'registration', 'type', 'status', 'notes'];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (empty($updates)) {
            return false;
        }

        $sql = "UPDATE vehicles SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $conn->prepare($sql);

        return $stmt->execute($params);
    }

    /**
     * Delete vehicle
     */
    public static function delete($id)
    {
        $db = new Database();
        $conn = $db->getConnection();

        $sql = "DELETE FROM vehicles WHERE id = :id";
        $stmt = $conn->prepare($sql);

        return $stmt->execute([':id' => $id]);
    }

    /**
     * Get vehicles by type
     */
    public static function getByType($type)
    {
        $db = new Database();
        $conn = $db->getConnection();

        $sql = "SELECT * FROM vehicles WHERE type = :type";
        $stmt = $conn->prepare($sql);
        $stmt->execute([':type' => $type]);

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }

    /**
     * Get vehicles by status
     */
    public static function getByStatus($status)
    {
        $db = new Database();
        $conn = $db->getConnection();

        $sql = "SELECT * FROM vehicles WHERE status = :status";
        $stmt = $conn->prepare($sql);
        $stmt->execute([':status' => $status]);

        return $stmt->fetchAll(\PDO::FETCH_ASSOC);
    }
}
