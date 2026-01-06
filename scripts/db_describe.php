<?php
require __DIR__ . '/../vendor/autoload.php';
use TrafQuiz\Core\Database;
try {
    $db = new Database();
    $pdo = $db->getConnection();
    $stmt = $pdo->query("SHOW COLUMNS FROM lessons");
    $cols = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($cols, JSON_PRETTY_PRINT) . PHP_EOL;
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . PHP_EOL;
}
