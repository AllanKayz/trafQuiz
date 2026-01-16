<?php
require_once __DIR__ . '/../../vendor/autoload.php';

use TrafQuiz\Models\LessonModel;

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Testing LessonModel::add with empty assignedVehicleId...\n";

$payload = [
    'title' => 'Test Lesson Fix ' . bin2hex(random_bytes(4)),
    'startTime' => date('Y-m-d H:i:s', strtotime('+1 day')),
    'assignedVehicleId' => '', // Empty string that was causing the failure
    'instructor' => ['id' => 1] // Valid instructor
];

try {
    $newLesson = LessonModel::add($payload);
    if ($newLesson) {
        echo "SUCCESS: Lesson created with ID: " . $newLesson['id'] . "\n";
        echo "Assigned Vehicle ID in result: " . var_export($newLesson['assignedVehicleId'], true) . "\n";

        if ($newLesson['assignedVehicleId'] === null) {
            echo "PASS: assignedVehicleId is null as expected.\n";
        } else {
            echo "FAIL: assignedVehicleId is not null.\n";
        }
    } else {
        echo "FAIL: LessonModel::add returned false.\n";
    }
} catch (\Throwable $t) {
    echo "FAIL: Caught exception: " . $t->getMessage() . "\n";
}

echo "\nTesting LessonModel::add with invalid (non-numeric) instructor ID...\n";
$payload2 = [
    'title' => 'Test Lesson Fix 2 ' . bin2hex(random_bytes(4)),
    'startTime' => date('Y-m-d H:i:s', strtotime('+2 days')),
    'instructor' => 'invalid-id'
];

try {
    $newLesson2 = LessonModel::add($payload2);
    if ($newLesson2) {
        echo "SUCCESS: Lesson created with ID: " . $newLesson2['id'] . "\n";
        echo "Instructor ID in result: " . var_export($newLesson2['instructor']['id'], true) . "\n";
    }
} catch (\Throwable $t) {
    echo "FAIL: Caught exception: " . $t->getMessage() . "\n";
}
