<?php
require 'vendor/autoload.php';
require_once 'src/Core/Database.php';

try {
    $db = \TrafQuiz\Core\Database::getInstance();
    $stmt = $db->query("DESCRIBE lessons");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($columns as $col) {
        echo $col['Field'] . "\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
