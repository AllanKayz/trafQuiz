<?php

namespace TrafQuiz\Models;

use TrafQuiz\Core\Database;

class LessonModel {
    private static $file = __DIR__ . '/../data/lessons.json';

    /**
     * Get PDO connection or null if unavailable
     */
    private static function getConnection() {
        try {
            $db = new Database();
            return $db->getConnection();
        } catch (\Exception $e) {
            return null;
        }
    }

    private static function readData() {
        if (!file_exists(self::$file)) {
            return [];
        }
        $json = file_get_contents(self::$file);
        $data = json_decode($json, true);
        return is_array($data) ? $data : [];
    }

    private static function writeData(array $data) {
        $dir = dirname(self::$file);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        file_put_contents(self::$file, json_encode($data, JSON_PRETTY_PRINT));
    }

    private static function mapRowToArray($row) {
        return [
            'id' => (int)$row['id'],
            'title' => $row['title'],
            'subject' => $row['subject'] ?? null,
            'startTime' => (new \DateTime($row['startTime']))->format(DATE_ATOM),
            'endTime' => !empty($row['endTime']) ? (new \DateTime($row['endTime']))->format(DATE_ATOM) : null,
            'durationMinutes' => isset($row['durationMinutes']) ? (int)$row['durationMinutes'] : null,
            'instructor' => [
                'id' => isset($row['instructor_id']) ? (int)$row['instructor_id'] : null,
                'name' => $row['instructor_name'] ?? null,
                'avatarUrl' => $row['instructor_avatar'] ?? null,
            ],
            'location' => $row['location'] ?? null,
            'onlineLink' => $row['onlineLink'] ?? null,
            'status' => $row['status'] ?? 'upcoming',
            'studentCount' => isset($row['studentCount']) ? (int)$row['studentCount'] : 0,
            'capacity' => isset($row['capacity']) ? (int)$row['capacity'] : null,
            'notes' => $row['notes'] ?? null,
            'resources' => !empty($row['resources']) ? json_decode($row['resources'], true) : [],
            'createdAt' => !empty($row['createdAt']) ? (new \DateTime($row['createdAt']))->format(DATE_ATOM) : null,
            'updatedAt' => !empty($row['updatedAt']) ? (new \DateTime($row['updatedAt']))->format(DATE_ATOM) : null,
        ];
    }

    public static function all($range = null) {
        $conn = self::getConnection();
        if ($conn) {
            $sql = 'SELECT * FROM lessons';
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
                        $start = null; $end = null;
                }
                if ($start && $end) {
                    $sql .= ' WHERE startTime BETWEEN :start AND :end';
                    $params = [':start' => $start, ':end' => $end];
                }
            }

            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll(\PDO::FETCH_ASSOC);
            return array_map([self::class, 'mapRowToArray'], $rows);
        }

        // Fallback to file
        $items = self::readData();
        if (!$range) return $items;

        $now = time();
        switch ($range) {
            case 'today':
                $start = strtotime('today');
                $end = strtotime('tomorrow') - 1;
                break;
            case '7days':
                $start = $now;
                $end = strtotime('+7 days', $now);
                break;
            case 'week':
                $start = strtotime('monday this week');
                $end = strtotime('sunday this week 23:59:59');
                break;
            case 'month':
                $start = strtotime('first day of this month');
                $end = strtotime('last day of this month 23:59:59');
                break;
            default:
                return $items;
        }

        return array_values(array_filter($items, function($l) use ($start, $end) {
            $t = strtotime($l['startTime']);
            return $t >= $start && $t <= $end;
        }));
    }

    public static function find($id) {
        $conn = self::getConnection();
        if ($conn) {
            $stmt = $conn->prepare('SELECT * FROM lessons WHERE id = :id LIMIT 1');
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch(\PDO::FETCH_ASSOC);
            if (!$row) return null;
            return self::mapRowToArray($row);
        }

        $items = self::readData();
        foreach ($items as $it) {
            if ($it['id'] == $id) return $it;
        }
        return null;
    }

    public static function patch($id, $payload) {
        $conn = self::getConnection();
        if ($conn) {
            $allowed = ['title','subject','startTime','endTime','durationMinutes','location','onlineLink','status','studentCount','capacity','notes','resources'];
            $sets = [];
            $params = [':id' => $id];
            foreach ($payload as $k => $v) {
                if (!in_array($k, $allowed)) continue;
                $sets[] = "$k = :$k";
                if ($k === 'resources') $params[":$k"] = json_encode($v);
                else $params[":$k"] = $v;
            }
            if (empty($sets)) return false;
            $params[':updatedAt'] = date('Y-m-d H:i:s');
            $sql = 'UPDATE lessons SET ' . implode(', ', $sets) . ', updatedAt = :updatedAt WHERE id = :id';
            $stmt = $conn->prepare($sql);
            return $stmt->execute($params);
        }

        $items = self::readData();
        $found = false;
        foreach ($items as &$it) {
            if ($it['id'] == $id) {
                $it = array_merge($it, $payload);
                $it['updatedAt'] = date('c');
                $found = true;
                break;
            }
        }
        if ($found) self::writeData($items);
        return $found;
    }

    public static function cancel($id) {
        return self::patch($id, ['status' => 'cancelled']);
    }

    public static function join($id) {
        $conn = self::getConnection();
        if ($conn) {
            // Increment studentCount and return meeting link
            $conn->beginTransaction();
            try {
                $stmt = $conn->prepare('SELECT onlineLink, studentCount FROM lessons WHERE id = :id FOR UPDATE');
                $stmt->execute([':id' => $id]);
                $row = $stmt->fetch(\PDO::FETCH_ASSOC);
                if (!$row) { $conn->rollBack(); return null; }
                $link = $row['onlineLink'] ?: ('https://meet.example.com/lesson-' . $id);
                $newCount = ((int)$row['studentCount']) + 1;
                $upd = $conn->prepare('UPDATE lessons SET studentCount = :sc, updatedAt = :u WHERE id = :id');
                $upd->execute([':sc' => $newCount, ':u' => date('Y-m-d H:i:s'), ':id' => $id]);
                $conn->commit();
                return ['meetingLink' => $link, 'success' => true];
            } catch (\Exception $e) {
                $conn->rollBack();
                return null;
            }
        }

        $lesson = self::find($id);
        if (!$lesson) return null;
        if (!empty($lesson['onlineLink'])) return ['meetingLink' => $lesson['onlineLink'], 'success' => true];
        $link = 'https://meet.example.com/lesson-' . $id;
        // Update local file count
        $items = self::readData();
        foreach ($items as &$it) {
            if ($it['id'] == $id) { $it['studentCount'] = ($it['studentCount'] ?? 0) + 1; break; }
        }
        self::writeData($items);
        return ['meetingLink' => $link, 'success' => true];
    }

    public static function add(array $payload) {
        $conn = self::getConnection();
        if ($conn) {
            $sql = 'INSERT INTO lessons (title, subject, startTime, endTime, durationMinutes, instructor_id, instructor_name, instructor_avatar, location, onlineLink, status, studentCount, capacity, notes, resources, createdAt) VALUES (:title,:subject,:startTime,:endTime,:durationMinutes,:instructor_id,:instructor_name,:instructor_avatar,:location,:onlineLink,:status,:studentCount,:capacity,:notes,:resources,:createdAt)';
            $stmt = $conn->prepare($sql);
            $params = [
                ':title' => $payload['title'],
                ':subject' => $payload['subject'] ?? null,
                ':startTime' => $payload['startTime'],
                ':endTime' => $payload['endTime'] ?? null,
                ':durationMinutes' => $payload['durationMinutes'] ?? null,
                ':instructor_id' => $payload['instructor']['id'] ?? null,
                ':instructor_name' => $payload['instructor']['name'] ?? null,
                ':instructor_avatar' => $payload['instructor']['avatarUrl'] ?? null,
                ':location' => $payload['location'] ?? null,
                ':onlineLink' => $payload['onlineLink'] ?? null,
                ':status' => $payload['status'] ?? 'upcoming',
                ':studentCount' => $payload['studentCount'] ?? 0,
                ':capacity' => $payload['capacity'] ?? null,
                ':notes' => $payload['notes'] ?? null,
                ':resources' => !empty($payload['resources']) ? json_encode($payload['resources']) : null,
                ':createdAt' => date('Y-m-d H:i:s')
            ];
            $stmt->execute($params);
            $id = (int)$conn->lastInsertId();
            return self::find($id);
        }

        $items = self::readData();
        $max = 0;
        foreach ($items as $it) $max = max($max, $it['id']);
        $payload['id'] = $max + 1;
        $payload['createdAt'] = date('c');
        $items[] = $payload;
        self::writeData($items);
        return $payload;
    }
}
