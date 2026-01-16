<?php
$output = "VERIFICATION LOG - " . date('Y-m-d H:i:s') . "\n";
require 'vendor/autoload.php';

$payload = [
    'title' => 'Test Lesson Logged',
    'startTime' => date('Y-m-d H:i:s'),
    'durationMinutes' => 45,
    'instructorId' => 1
];

$output .= "Payload: " . json_encode($payload) . "\n";

try {
    require_once 'src/Models/LessonModel.php';
    require_once 'src/Core/Database.php';

    $output .= "Calling LessonModel::add...\n";
    $result = \TrafQuiz\Models\LessonModel::add($payload);
    $output .= "Result: " . json_encode($result) . "\n";
    $output .= "SUCCESS\n";
} catch (\Exception $e) {
    $output .= "ERROR: " . $e->getMessage() . "\n";
}

file_put_contents('verification_result.log', $output);
echo "Done\n";
