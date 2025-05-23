<?php

namespace TrafQuiz\Models;

use TrafQuiz\Core\Database;
use PDO;

class User {

    public static function findByUsername($username) {
        $db = new Database();
        $stmt = $db->getConnection()->prepare("SELECT * FROM users WHERE username = :username");
        $stmt->bindParam(':username', $username);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}