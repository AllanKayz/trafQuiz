<?php
require 'vendor/autoload.php';
$db = new TrafQuiz\Core\Database();
$stmt = $db->getConnection()->query("DESCRIBE users");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
