<?php
require 'vendor/autoload.php';
use TrafQuiz\Models\User;

// First, request a forgot password token
$username = 'admin';
$token = bin2hex(random_bytes(16));
User::setResetToken($username, $token);

echo "Generated token: $token\n";

// Immediately test lookup
$user = User::findByResetToken($token);
echo "User lookup result: ";
var_dump($user);

if ($user) {
    echo "\nSuccess! User found: " . $user['username'] . "\n";
    
    // Now test reset
    $hashedPassword = password_hash('testpassword123', PASSWORD_DEFAULT);
    $result = User::updatePassword($user['id'], $hashedPassword);
    echo "Password update result: " . ($result ? 'SUCCESS' : 'FAILED') . "\n";
} else {
    echo "\nFailed to find user by token\n";
    
    // Debug: check what's in the database
    $db = new TrafQuiz\Core\Database();
    $stmt = $db->getConnection()->query("SELECT NOW() as now, reset_expires, reset_expires > NOW() as is_valid FROM users WHERE username='admin'");
    echo "Debug info: ";
    print_r($stmt->fetch(PDO::FETCH_ASSOC));
}
