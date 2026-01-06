<?php

require '../../vendor/autoload.php';

use TrafQuiz\Core\Router;
use TrafQuiz\Core\Auth;
use TrafQuiz\Controllers\LoginController;
use TrafQuiz\Controllers\ExamController;
use TrafQuiz\Middleware\CorsMiddleware;
use TrafQuiz\Controllers\AdminController;

header("Access-Control-Allow-Origin: *"); //Allows all origins
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"); //Allow specific HTTP methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); //Allow Specific Headers
header("Content-Type: application/json");

$router = new Router;

//API Routes

/*$router->addRoute('GET', '/trafQuiz/public/api/license', function() {
       (new LicenseController())->validateLicense();
});*/

$router->addRoute('POST', '/trafQuiz/public/api/login', function () {
       (new LoginController())->login();
});

$router->addRoute('GET', '/trafQuiz/public/api/exam', function () {
       (new ExamController())->examQuestions();
});

$router->addRoute('GET', '/trafQuiz/public/api/time', function () {
       (new ExamController())->examTime();
});

$router->addRoute('GET', '/trafQuiz/public/api/admin', function () {
       (new AdminController())->getAllData();
});

$router->addRoute('POST', '/trafQuiz/public/api/timeupdate', function () {
       (new AdminController())->updateExamTimeframe();
});

$router->addRoute('GET', '/trafQuiz/public/api/packages', function () {
       (new AdminController())->getPackages();
});

$router->addRoute('GET', '/trafQuiz/public/api/students', function () {
       (new AdminController())->getAllStudents();
});

$router->addRoute('POST', '/trafQuiz/public/api/addstudent', function () {
       (new AdminController())->addStudent();
});

$router->addRoute('POST', '/trafQuiz/public/api/deletestudent', function () {
       (new AdminController())->deleteStudent();
});

$router->addRoute('GET', '/trafQuiz/public/api/questions', function () {
       (new AdminController())->getAllQuestions();
});

$router->addRoute('GET', '/trafQuiz/public/api/instructors', function () {
       (new AdminController())->getInstructors();
});

$router->addRoute('POST', '/trafQuiz/public/api/addinstructor', function () {
       (new AdminController())->addInstructor();
});

$router->addRoute('GET', '/trafQuiz/public/api/certifications', function () {
       (new AdminController())->getCertification();
});

$router->addRoute('POST', '/trafQuiz/public/api/addcertification', function () {
       (new AdminController())->addCertification();
});

$router->addRoute('GET', '/trafQuiz/public/api/specializations', function () {
       (new AdminController())->getSpecialization();
});

$router->addRoute('POST', '/trafQuiz/public/api/addspecialization', function () {
       (new AdminController())->addSpecialization();
});

// Admin utilities: seed and check lessons
$router->addRoute('POST', '/trafQuiz/public/api/admin/seed-lessons', function () {
       (new AdminController())->seedLessons();
});

$router->addRoute('GET', '/trafQuiz/public/api/admin/check-lessons', function () {
       (new AdminController())->checkLessons();
});

// Lessons API
$router->addRoute('GET', '/trafQuiz/public/api/lessons', function () {
       (new \TrafQuiz\Controllers\LessonsController())->getLessons();
});

$router->addRoute('POST', '/trafQuiz/public/api/lessons/join', function () {
       (new \TrafQuiz\Controllers\LessonsController())->join();
});

$router->addRoute('POST', '/trafQuiz/public/api/lessons/cancel', function () {
       (new \TrafQuiz\Controllers\LessonsController())->cancel();
});

$router->addRoute('POST', '/trafQuiz/public/api/lessons/update', function () {
       (new \TrafQuiz\Controllers\LessonsController())->update();
});

$router->addRoute('POST', '/trafQuiz/public/api/lessons/add', function () {
       (new \TrafQuiz\Controllers\LessonsController())->add();
});

// Vehicles API (simple JSON-backed for development)
$router->addRoute('GET', '/trafQuiz/public/api/vehicles', function () {
       (new \TrafQuiz\Controllers\VehiclesController())->getVehicles();
});

$router->addRoute('POST', '/trafQuiz/public/api/vehicles/add', function () {
       (new \TrafQuiz\Controllers\VehiclesController())->add();
});

$router->addRoute('POST', '/trafQuiz/public/api/vehicles/update', function () {
       (new \TrafQuiz\Controllers\VehiclesController())->update();
});

$router->addRoute('POST', '/trafQuiz/public/api/vehicles/delete', function () {
       (new \TrafQuiz\Controllers\VehiclesController())->delete();
});


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
       header("Access-Control-Allow-Origin: *"); // Allows all origins
       header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"); // Allow specific HTTP methods
       header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allow Specific Headers
       http_response_code(204); // No Content
       exit();
}

// Dispatch API Routes
$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);
