<?php
require 'vendor/autoload.php';
$db = new TrafQuiz\Core\Database();
$stmt = $db->getConnection()->query('SELECT username, reset_token, reset_expires FROM users WHERE username="admin"');
print_r($stmt->fetch(PDO::FETCH_ASSOC));
