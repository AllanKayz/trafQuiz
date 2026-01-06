<?php

require __DIR__ . '/../vendor/autoload.php';
use TrafQuiz\Core\Database;

try {
    $db = new Database();
    $pdo = $db->getConnection();

    $sql = file_get_contents(__DIR__ . '/../src/migrations/001_create_lessons_table.sql');
    $pdo->exec($sql);

    echo "Migration succeeded: lessons table created or exists already.\n";
} catch (\Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}
