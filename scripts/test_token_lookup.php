<?php
require 'vendor/autoload.php';
use TrafQuiz\Models\User;

$token = 'e53f36a3b866527c7e6aa8bf2b74156a';
$user = User::findByResetToken($token);
echo "User found: ";
var_dump($user);

// Also check current time vs expires
$db = new TrafQuiz\Core\Database();
$stmt = $db->getConnection()->query('SELECT NOW() as current_time, reset_expires FROM users WHERE reset_token="' . $token . '"');
echo "\nTime check: ";
print_r($stmt->fetch(PDO::FETCH_ASSOC));
