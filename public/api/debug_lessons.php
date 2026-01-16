<?php
require_once __DIR__ . '/../../vendor/autoload.php';

use TrafQuiz\Models\LessonModel;

error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $lessons = LessonModel::all();
    echo "Success! Found " . count($lessons) . " lessons.\n";
    print_r($lessons);
} catch (\Throwable $t) {
    echo "Error: " . $t->getMessage() . "\n";
    echo "File: " . $t->getFile() . "\n";
    echo "Line: " . $t->getLine() . "\n";
    echo "Trace:\n" . $t->getTraceAsString() . "\n";
}
