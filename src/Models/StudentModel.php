<?php

namespace TrafQuiz\Models;

use TrafQuiz\Core\Database;
use PDO;

class StudentModel
{

    /**
     * Get all students
     */
    public static function all()
    {
        $db = new Database();
        $conn = $db->getConnection();

        $sql = "SELECT * FROM students ORDER BY created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Find student by ID
     */
    public static function find($id)
    {
        $db = new Database();
        $conn = $db->getConnection();

        $sql = "SELECT * FROM students WHERE id = :id";
        $stmt = $conn->prepare($sql);
        $stmt->execute([':id' => $id]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Find student by user ID
     */
    public static function findByUserId($userid)
    {
        $db = new Database();
        $conn = $db->getConnection();

        $sql = "SELECT * FROM students WHERE userid = :userid";
        $stmt = $conn->prepare($sql);
        $stmt->execute([':userid' => $userid]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Create new student
     */
    public static function create($data)
    {
        $db = new Database();
        $conn = $db->getConnection();

        $sql = "INSERT INTO students (
            userid, firstName, lastName, email, phone, address, 
            enrollmentDate, packageId, status
        ) VALUES (
            :userid, :firstName, :lastName, :email, :phone, :address,
            :enrollmentDate, :packageId, :status
        )";

        $stmt = $conn->prepare($sql);
        $result = $stmt->execute([
            ':userid' => $data['userid'] ?? null,
            ':firstName' => $data['firstName'] ?? $data['name'] ?? '',
            ':lastName' => $data['lastName'] ?? '',
            ':email' => $data['email'] ?? '',
            ':phone' => $data['phone'] ?? null,
            ':address' => $data['address'] ?? null,
            ':enrollmentDate' => $data['enrollmentDate'] ?? date('Y-m-d'),
            ':packageId' => $data['packageId'] ?? $data['package'] ?? null,
            ':status' => $data['status'] ?? 'active'
        ]);

        if ($result) {
            return self::find($conn->lastInsertId());
        }

        return false;
    }

    /**
     * Update student
     */
    public static function update($id, $data)
    {
        $db = new Database();
        $conn = $db->getConnection();

        $updates = [];
        $params = [':id' => $id];

        $allowedFields = [
            'firstName',
            'lastName',
            'email',
            'phone',
            'address',
            'enrollmentDate',
            'packageId',
            'status'
        ];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        // Handle legacy 'name' field - split into firstName/lastName
        if (isset($data['name']) && !isset($data['firstName'])) {
            $nameParts = explode(' ', $data['name'], 2);
            $updates[] = "firstName = :firstName";
            $updates[] = "lastName = :lastName";
            $params[':firstName'] = $nameParts[0] ?? '';
            $params[':lastName'] = $nameParts[1] ?? '';
        }

        // Handle legacy 'package' field
        if (isset($data['package']) && !isset($data['packageId'])) {
            $updates[] = "packageId = :packageId";
            $params[':packageId'] = $data['package'];
        }

        if (empty($updates)) {
            return false;
        }

        $sql = "UPDATE students SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $conn->prepare($sql);

        return $stmt->execute($params);
    }

    /**
     * Delete student
     */
    public static function delete($id)
    {
        $db = new Database();
        $conn = $db->getConnection();

        $sql = "DELETE FROM students WHERE id = :id";
        $stmt = $conn->prepare($sql);

        return $stmt->execute([':id' => $id]);
    }

    /**
     * Get students by status
     */
    public static function getByStatus($status)
    {
        $db = new Database();
        $conn = $db->getConnection();

        $sql = "SELECT * FROM students WHERE status = :status ORDER BY created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->execute([':status' => $status]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get students by package
     */
    public static function getByPackage($packageId)
    {
        $db = new Database();
        $conn = $db->getConnection();

        $sql = "SELECT * FROM students WHERE packageId = :packageId ORDER BY created_at DESC";
        $stmt = $conn->prepare($sql);
        $stmt->execute([':packageId' => $packageId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get students assigned to an instructor (via lessons)
     */
    public static function getByInstructor($instructorId)
    {
        $db = new Database();
        $conn = $db->getConnection();

        $sql = "SELECT DISTINCT s.* FROM students s 
                JOIN lessons l ON s.id = l.student_id 
                WHERE l.instructor_id = :iid 
                ORDER BY s.firstName ASC";
        $stmt = $conn->prepare($sql);
        $stmt->execute([':iid' => $instructorId]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
