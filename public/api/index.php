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
$router->addRoute('GET', '/trafQuiz/public/api/license', function() {
       (new LicenseController())->validateLicense();
});
$router->addRoute('POST', '/trafQuiz/public/api/login', function() {
       (new LoginController())->login();
});

$router->addRoute('GET', '/trafQuiz/public/api/exam', function() {
       (new ExamController())->examQuestions();
});

$router->addRoute('GET', '/trafQuiz/public/api/time', function() {
       (new ExamController())->examTime();
});

$router->addRoute('GET', '/trafQuiz/public/api/admin', function() {
       (new AdminController())->getAllData();
});

$router->addRoute('POST', '/trafQuiz/public/api/timeupdate', function() {
       (new AdminController())->updateExamTimeframe();
});

$router->addRoute('POST', '/trafQuiz/public/api/addstudent', function() {
       (new AdminController())->addStudent();
});

$router->addRoute('POST', '/trafQuiz/public/api/deletestudent', function() {
       (new AdminController())->deleteStudent();
});


if($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
	header("Access-Control-Allow-Origin: *"); //Allows all origins
	header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"); //Allow specific HTTP methods
	header("Access-Control-Allow-Headers: Content-Type, Authorization"); //Allow Specific Headers
	http_response_code(204); //No Content
    exit();
}

// Dispatch API Routes
$router->dispatch($_SERVER['REQUEST_METHOD'], $_SERVER['REQUEST_URI']);

