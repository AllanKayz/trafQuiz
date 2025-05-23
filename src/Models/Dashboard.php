<?php

namespace TrafQuiz\Models;

use TrafQuiz\Core\Database;
use PDO;

class Dashboard {
    
    public static function addUser ($username, $password, $email, $firstname, $lastname) { 
        $role = 'user';
        $db = new Database();
        $sql = 'INSERT INTO users(username, password, email, firstname, lastname, role) VALUES (:username, :password, :email, :firstname, :lastname, :role)';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':firstname', $firstname);
        $stmt->bindParam(':lastname', $lastname);
        $stmt->bindParam(':role', $role);
        $stmt->execute();
        return [
            'success' => $stmt->rowCount() > 0,
            'message' => $stmt->rowCount() > 0 ? 'Add successful' : 'No User Added'
        ];
    }

    public static function deleteUser ($id) { 
        $db = new Database();
        $stmt = $db->getConnection()->prepare('DELETE FROM users WHERE id = :id');
        $stmt->bindParam('id', $id);
        $stmt->execute();
        return [
            'success' => $stmt->rowCount() > 0,
            'message' => $stmt->rowCount() > 0 ? 'Delete successful' : 'Failed to delete'
        ];
    }

    public static function updateUser($username, $password, $lastname, $firstname, $email, $id) {
        $db = new Database();
        $sql = 'UPDATE users SET username = :username, password = :password, email = :email, firstname = :firstname, lastname = :lastname WHERE id = :id';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->bindParam('id', $id);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':firstname', $firstname);
        $stmt->bindParam(':lastname', $lastname);
        $stmt->execute();
        return [
            'success' => $stmt->rowCount() > 0,
            'message' => $stmt->rowCount() > 0 ? 'Update successful' : 'No rows updated'
        ];
    }

    public static function getUsers() {
        $db = new Database();
        $stmt = $db->getConnection()->prepare('SELECT id, username, password, email, firstname, lastname FROM users WHERE role = "user"');
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function updateExamTime($time) {
        $db = new Database();
        $stmt = $db->getConnection()->prepare('UPDATE exam_timeframe SET period = :time WHERE id = 1');
        $stmt->bindParam(':time', $time);
        $stmt->execute();
        return [
            'success' => $stmt->rowCount() > 0,
            'message' => $stmt->rowCount() > 0 ? 'Update successful' : 'No rows updated',
            'new_time' => $time
        ];
    }

    public static function getExamTime() {
        $db = new Database();
        $sql = 'SELECT period FROM exam_timeframe';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}