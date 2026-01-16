<?php
require __DIR__ . '/vendor/autoload.php';
use TrafQuiz\Core\Database;

try {
    $db = new Database();
    $pdo = $db->getConnection();
    $stmt = $pdo->query("DESCRIBE lessons");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($columns, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
