<?php

namespace TrafQuiz\Models;

use TrafQuiz\Core\Database;
use PDO;

class User
{

    public static function findByUsername($username)
    {
        $db = new Database();
        $stmt = $db->getConnection()->prepare("SELECT * FROM users WHERE username = :username");
        $stmt->bindParam(':username', $username);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function updatePassword($userId, $hashedPassword)
    {
        $db = new Database();
        $stmt = $db->getConnection()->prepare("UPDATE users SET password = :password, reset_token = NULL, reset_expires = NULL WHERE id = :id");
        $stmt->bindParam(':password', $hashedPassword);
        $stmt->bindParam(':id', $userId);
        return $stmt->execute();
    }

    public static function setResetToken($username, $token)
    {
        $db = new Database();
        $stmt = $db->getConnection()->prepare("UPDATE users SET reset_token = :token, reset_expires = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE username = :username");
        $stmt->bindParam(':token', $token);
        $stmt->bindParam(':username', $username);
        return $stmt->execute();
    }

    public static function findByResetToken($token)
    {
        $db = new Database();
        $stmt = $db->getConnection()->prepare("SELECT * FROM users WHERE reset_token = :token AND reset_expires > NOW()");
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Find user by ID
     */
    public static function find($id)
    {
        $db = new Database();
        $stmt = $db->getConnection()->prepare("SELECT * FROM users WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Update user profile
     */
    public static function updateUser($id, $data)
    {
        $db = new Database();
        $conn = $db->getConnection();

        $updates = [];
        $params = [':id' => $id];

        // Map camelCase input to snake_case DB columns
        // Input data likely comes from JSON so it might be camelCase

        if (isset($data['username']) && $data['username'] !== '') {
            $updates[] = "username = :username";
            $params[':username'] = $data['username'];
        }
        if (isset($data['firstName']) && $data['firstName'] !== '') {
            $updates[] = "first_name = :first_name";
            $params[':first_name'] = $data['firstName'];
        }
        if (isset($data['lastName']) && $data['lastName'] !== '') {
            $updates[] = "last_name = :last_name";
            $params[':last_name'] = $data['lastName'];
        }
        if (isset($data['email']) && $data['email'] !== '') {
            $updates[] = "email = :email";
            $params[':email'] = $data['email'];
        }
        if (isset($data['phone']) && $data['phone'] !== '') {
            $updates[] = "phone = :phone";
            $params[':phone'] = $data['phone'];
        }
        if (isset($data['password']) && $data['password'] !== '') {
            $updates[] = "password = :password";
            $params[':password'] = $data['password'];
        }

        if (empty($updates)) {
            return false;
        }

        $sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $conn->prepare($sql);

        return $stmt->execute($params);
    }

    /**
     * Create new user
     */
    public static function create($data)
    {
        $db = new Database();
        $conn = $db->getConnection();

        $sql = "INSERT INTO users (username, password, role, first_name, last_name, email, phone) 
                VALUES (:username, :password, :role, :first_name, :last_name, :email, :phone)";

        $stmt = $conn->prepare($sql);
        $result = $stmt->execute([
            ':username' => $data['username'],
            ':password' => $data['password'],
            ':role' => $data['role'] ?? 'student',
            ':first_name' => $data['firstName'] ?? null,
            ':last_name' => $data['lastName'] ?? null,
            ':email' => $data['email'] ?? null,
            ':phone' => $data['phone'] ?? null
        ]);

        if ($result) {
            return self::find($conn->lastInsertId());
        }

        return false;
    }
}
