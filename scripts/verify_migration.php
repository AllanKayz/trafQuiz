<?php

require __DIR__ . '/../vendor/autoload.php';

use TrafQuiz\Models\User;
use TrafQuiz\Models\Dashboard;
use TrafQuiz\Models\VehicleModel;
use TrafQuiz\Models\LessonModel;

// Simple assertion helper
function assert_true($condition, $message)
{
    echo $condition ? "[PASS] $message\n" : "[FAIL] $message\n";
}

try {
    echo "Starting Verification...\n";

    // 1. Create User
    echo "Creating User...\n";
    $userData = [
        'username' => 'testuser_' . time(),
        'password' => 'password123',
        'role' => 'student',
        'firstName' => 'John',
        'lastName' => 'Doe',
        'email' => 'john.doe@example.com',
        'phone' => '1234567890'
    ];
    $user = User::create($userData);
    assert_true($user && $user['username'] === $userData['username'], "User created successfully with ID: " . ($user['id'] ?? 'null'));

    // 2. Create Student linked to User
    if ($user) {
        echo "Creating Student...\n";
        $studentRes = Dashboard::addStudent(
            $userData['firstName'] . ' ' . $userData['lastName'], // Name (legacy param, ignored in new logic mostly but passed)
            $userData['email'],
            $userData['phone'],
            '123 Main St',
            'active',
            $user['id'],
            1 // Package ID
        );
        assert_true($studentRes['success'], "Student added successfully");

        // Verify Student Fetch
        $students = Dashboard::getStudents();
        $found = false;
        $studentId = null;
        foreach ($students as $s) {
            if ($s['email'] === $userData['email']) {
                $found = true;
                $studentId = $s['id'];
                break;
            }
        }
        assert_true($found, "Student found in getStudents() with correct email");
    }

    // 3. Create Instructor User
    echo "Creating Instructor User...\n";
    $instUserData = [
        'username' => 'inst_' . time(),
        'password' => 'password123',
        'role' => 'instructor',
        'firstName' => 'Jane',
        'lastName' => 'Smith',
        'email' => 'jane.smith@example.com',
        'phone' => '0987654321'
    ];
    $instUser = User::create($instUserData);

    // 4. Create Instructor
    if ($instUser) {
        echo "Creating Instructor...\n";
        $instRes = Dashboard::addInstructor(
            $instUser['id'],
            $instUserData['firstName'] . ' ' . $instUserData['lastName'],
            $instUserData['email'],
            $instUserData['phone'],
            'LIC-12345',
            1, // Spec ID
            1, // Cert ID
            5, // Experience
            1 // Availability
        );
        assert_true($instRes['success'], "Instructor added successfully");

        // Verify Instructor Fetch
        $instructors = Dashboard::getInstructors();
        $foundInst = false;
        $instructorId = null;
        foreach ($instructors as $i) {
            if ($i['email'] === $instUserData['email']) {
                $foundInst = true;
                $instructorId = $i['id'];
                break;
            }
        }
        assert_true($foundInst, "Instructor found in getInstructors() with correct email");
    }

    // 5. Create Vehicle
    echo "Creating Vehicle...\n";
    $vehicleData = [
        'make' => 'Toyota',
        'model' => 'Corolla',
        'year' => 2022,
        'registration' => 'REG-' . time(),
        'type' => 'car',
        'status' => 'active'
    ];
    $vehicle = VehicleModel::create($vehicleData);
    assert_true($vehicle && $vehicle['registration'] === $vehicleData['registration'], "Vehicle created successfully");

    // 6. Create Lesson
    if ($studentId && $instructorId && $vehicle) {
        echo "Creating Lesson...\n";
        $lessonData = [
            'title' => 'Test Lesson',
            'startTime' => date('Y-m-d H:i:s', strtotime('+1 day')),
            'instructor' => ['id' => $instructorId],
            'studentId' => $studentId,
            'assignedVehicleId' => $vehicle['id'],
            'status' => 'upcoming'
        ];
        $lesson = LessonModel::add($lessonData);
        assert_true($lesson && $lesson['title'] === 'Test Lesson', "Lesson created successfully");

        // Verify Lesson Joins
        assert_true($lesson['instructor']['name'] === 'Jane Smith', "Lesson has correct instructor name from JOIN");
        assert_true($lesson['studentName'] === 'John Doe', "Lesson has correct student name from JOIN");
    }

    echo "Verification Completed.\n";
} catch (Exception $e) {
    echo "[ERROR] Exception: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString();
}
