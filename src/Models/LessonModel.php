<?php

namespace TrafQuiz\Models;

use TrafQuiz\Core\Database;
use PDO;

class LessonModel
{

    /**
     * Get PDO connection
     */
    private static function getConnection()
    {
        try {
            $db = new Database();
            return $db->getConnection();
        } catch (\Exception $e) {
            return null;
        }
    }

    private static function mapRowToArray($row)
    {
        $instructorName = trim(($row['instructor_first_name'] ?? '') . ' ' . ($row['instructor_last_name'] ?? ''));
        $studentName = trim(($row['student_first_name'] ?? '') . ' ' . ($row['student_last_name'] ?? ''));

        // Derive vehicleType from package_name
        $vehicleType = 'Car'; // Default
        if (!empty($row['package_name'])) {
            $pkg = strtolower($row['package_name']);
            if (strpos($pkg, 'heavy') !== false) $vehicleType = 'Truck';
            elseif (strpos($pkg, 'cycle') !== false) $vehicleType = 'Motorcycle';
            // Add more mappings as needed
        }

        return [
            'id' => (int)$row['id'],
            'title' => $row['title'],
            'subject' => $row['subject'] ?? null,
            'startTime' => (new \DateTime($row['start_time']))->format(DATE_ATOM),
            'endTime' => !empty($row['end_time']) ? (new \DateTime($row['end_time']))->format(DATE_ATOM) : null,
            'durationMinutes' => isset($row['duration_minutes']) ? (int)$row['duration_minutes'] : null,
            'instructor' => [
                'id' => isset($row['instructor_id']) ? (int)$row['instructor_id'] : null,
                'name' => !empty($instructorName) ? $instructorName : null,
                'avatarUrl' => $row['instructor_avatar'] ?? null,
            ],
            'location' => $row['location'] ?? null,
            'onlineLink' => $row['online_link'] ?? null,
            'status' => $row['status'] ?? 'upcoming',
            'studentCount' => isset($row['student_count']) ? (int)$row['student_count'] : 0,
            'capacity' => isset($row['capacity']) ? (int)$row['capacity'] : null,
            'notes' => $row['notes'] ?? null,
            'resources' => !empty($row['resources']) ? json_decode($row['resources'], true) : [],
            'studentId' => isset($row['student_id']) ? (int)$row['student_id'] : null,
            'studentName' => !empty($studentName) ? $studentName : null,
            'type' => $row['type'] ?? 'group',
            'assignedVehicleId' => isset($row['assigned_vehicle_id']) ? (int)$row['assigned_vehicle_id'] : null,
            'vehicleType' => $vehicleType,
            'createdAt' => !empty($row['created_at']) ? (new \DateTime($row['created_at']))->format(DATE_ATOM) : null,
            'updatedAt' => !empty($row['updated_at']) ? (new \DateTime($row['updated_at']))->format(DATE_ATOM) : null,
        ];
    }

    public static function all($range = null)
    {
        $conn = self::getConnection();
        if (!$conn) return [];

        // Updated query to JOIN instructors->users and students->users
        $sql = 'SELECT l.*, 
                       iu.first_name AS instructor_first_name, iu.last_name AS instructor_last_name, iu.avatar AS instructor_avatar,
                       su.first_name AS student_first_name, su.last_name AS student_last_name,
                       p.package AS package_name
                FROM lessons l
                LEFT JOIN instructors i ON l.instructor_id = i.id
                LEFT JOIN users iu ON i.user_id = iu.id
                LEFT JOIN students s ON l.student_id = s.id
                LEFT JOIN users su ON s.user_id = su.id
                LEFT JOIN packages p ON s.package_id = p.id';

        $params = [];

        if ($range) {
            $now = time();
            switch ($range) {
                case 'today':
                    $start = date('Y-m-d 00:00:00');
                    $end = date('Y-m-d 23:59:59');
                    break;
                case '7days':
                    $start = date('Y-m-d H:i:s');
                    $end = date('Y-m-d H:i:s', strtotime('+7 days'));
                    break;
                case 'week':
                    $start = date('Y-m-d 00:00:00', strtotime('monday this week'));
                    $end = date('Y-m-d 23:59:59', strtotime('sunday this week'));
                    break;
                case 'month':
                    $start = date('Y-m-01 00:00:00');
                    $end = date('Y-m-t 23:59:59');
                    break;
                default:
                    $start = null;
                    $end = null;
            }
            if ($start && $end) {
                $sql .= ' WHERE l.start_time BETWEEN :start AND :end';
                $params = [':start' => $start, ':end' => $end];
            }
        }

        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        return array_map([self::class, 'mapRowToArray'], $rows);
    }

    public static function find($id)
    {
        $conn = self::getConnection();
        if (!$conn) return null;

        $sql = 'SELECT l.*, 
                       iu.first_name AS instructor_first_name, iu.last_name AS instructor_last_name, iu.avatar AS instructor_avatar,
                       su.first_name AS student_first_name, su.last_name AS student_last_name,
                       p.package AS package_name
                FROM lessons l
                LEFT JOIN instructors i ON l.instructor_id = i.id
                LEFT JOIN users iu ON i.user_id = iu.id
                LEFT JOIN students s ON l.student_id = s.id
                LEFT JOIN users su ON s.user_id = su.id
                LEFT JOIN packages p ON s.package_id = p.id
                WHERE l.id = :id LIMIT 1';

        $stmt = $conn->prepare($sql);
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) return null;
        return self::mapRowToArray($row);
    }

    public static function patch($id, $payload)
    {
        $conn = self::getConnection();
        if (!$conn) return false;

        $allowed = [
            'title',
            'subject',
            'startTime',
            'endTime',
            'durationMinutes',
            'location',
            'onlineLink',
            'status',
            'studentCount',
            'capacity',
            'notes',
            'resources',
            'student_id',
            'type',
            'assigned_vehicle_id'
        ];

        $sets = [];
        $params = [':id' => $id];

        // Map camelCase to snake_case if needed
        $map = [
            'startTime' => 'start_time',
            'endTime' => 'end_time',
            'durationMinutes' => 'duration_minutes',
            'onlineLink' => 'online_link',
            'studentCount' => 'student_count',
            'studentId' => 'student_id',
            'assignedVehicleId' => 'assigned_vehicle_id'
        ];

        foreach ($payload as $k => $v) {
            $dbCol = $map[$k] ?? $k;
            $allowedDB = [
                'title',
                'subject',
                'start_time',
                'end_time',
                'duration_minutes',
                'location',
                'online_link',
                'status',
                'student_count',
                'capacity',
                'notes',
                'resources',
                'student_id',
                'type',
                'assigned_vehicle_id'
            ];

            if (!in_array($dbCol, $allowedDB)) continue;

            $sets[] = "$dbCol = :$k";
            if ($k === 'resources') $params[":$k"] = json_encode($v);
            else $params[":$k"] = $v;
        }
        if (empty($sets)) return false;

        $sql = 'UPDATE lessons SET ' . implode(', ', $sets) . ' WHERE id = :id';
        $stmt = $conn->prepare($sql);
        return $stmt->execute($params);
    }

    public static function cancel($id)
    {
        return self::patch($id, ['status' => 'cancelled']);
    }

    public static function join($id)
    {
        $conn = self::getConnection();
        if (!$conn) return null;

        $conn->beginTransaction();
        try {
            $stmt = $conn->prepare('SELECT online_link, student_count FROM lessons WHERE id = :id FOR UPDATE');
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            if (!$row) {
                $conn->rollBack();
                return null;
            }

            $link = $row['online_link'] ?: ('https://meet.example.com/lesson-' . $id);
            $newCount = ((int)$row['student_count']) + 1;

            $upd = $conn->prepare('UPDATE lessons SET student_count = :sc WHERE id = :id');
            $upd->execute([':sc' => $newCount, ':id' => $id]);
            $conn->commit();
            return ['meetingLink' => $link, 'success' => true];
        } catch (\Exception $e) {
            $conn->rollBack();
            return null;
        }
    }

    public static function add(array $payload)
    {
        $conn = self::getConnection();
        if (!$conn) return false;

        $sql = 'INSERT INTO lessons (
            title, subject, start_time, end_time, duration_minutes, instructor_id, 
            location, online_link, status, 
            student_count, capacity, notes, resources, student_id, 
            type, assigned_vehicle_id
        ) VALUES (
            :title, :subject, :startTime, :endTime, :durationMinutes, :instructor_id,
            :location, :onlineLink, :status,
            :studentCount, :capacity, :notes, :resources, :student_id,
            :type, :assigned_vehicle_id
        )';

        $stmt = $conn->prepare($sql);
        $params = [
            ':title' => $payload['title'],
            ':subject' => $payload['subject'] ?? null,
            ':startTime' => $payload['startTime'],
            ':endTime' => $payload['endTime'] ?? null,
            ':durationMinutes' => $payload['durationMinutes'] ?? null,
            ':instructor_id' => $payload['instructor']['id'] ?? null,
            ':location' => $payload['location'] ?? null,
            ':onlineLink' => $payload['onlineLink'] ?? null,
            ':status' => $payload['status'] ?? 'upcoming',
            ':studentCount' => $payload['studentCount'] ?? 0,
            ':capacity' => $payload['capacity'] ?? null,
            ':notes' => $payload['notes'] ?? null,
            ':resources' => !empty($payload['resources']) ? json_encode($payload['resources']) : null,
            ':student_id' => $payload['studentId'] ?? null,
            ':type' => $payload['type'] ?? 'group',
            ':assigned_vehicle_id' => $payload['assignedVehicleId'] ?? null
        ];

        $stmt->execute($params);
        $id = (int)$conn->lastInsertId();
        return self::find($id);
    }
}
