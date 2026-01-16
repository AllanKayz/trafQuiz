<?php
require 'vendor/autoload.php';

// Mock the environment
$_SERVER['REQUEST_METHOD'] = 'POST';
$payload = [
    'title' => 'Test Lesson ' . date('Y-m-d H:i:s'),
    'startTime' => date('Y-m-d H:i:s'),
    'durationMinutes' => 60,
    'instructorId' => 1
];

echo "Testing with payload: " . json_encode($payload) . "\n\n";

try {
    // We need to bypass the die/exit in the controller and index.php if possible,
    // or just test the Model directly.
    require 'src/Models/LessonModel.php';
    require 'src/Core/Database.php';
    require 'src/Core/Config.php';

    // Test Model::add
    echo "Calling LessonModel::add...\n";
    $result = \TrafQuiz\Models\LessonModel::add($payload);
    echo "Result:\n" . json_encode($result, JSON_PRETTY_PRINT) . "\n";
    echo "SUCCESS: Lesson added successfully.\n";
} catch (\Exception $e) {
    echo "CAUGHT EXCEPTION: " . $e->getMessage() . "\n";
    echo "Trace:\n" . $e->getTraceAsString() . "\n";
}
