<?php
require 'vendor/autoload.php';
$db = new TrafQuiz\Core\Database();
try {
    $db->getConnection()->exec("ALTER TABLE users ADD COLUMN reset_token VARCHAR(255) NULL, ADD COLUMN reset_expires DATETIME NULL");
    echo "Columns added successfully.\n";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
