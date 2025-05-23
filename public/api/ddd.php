<?php

require "vendor/autoload.php";

use TrafQuiz\Core\Router;
use TrafQuiz\Core\Auth;
use TrafQuiz\Controllers\LoginController;
use TrafQuiz\Controllers\AdminController;
use TrafQuiz\Controllers\UserController;
use TrafQuiz\Controllers\ExamController;

session_start();

$router = new Router();

$router->addRoute('POST','/trafQuiz/', function(){
    header("Location: /trafQuiz/public/login.html");
    exit;
});

$router->addRoute('POST','/trafQuiz/login', function(){
    $controller = new LoginController();
    $controller->login($_POST['username'], $_POST['password']);
});

$router->addRoute('/trafQuiz/logout', function() {
    $controller = new LoginController();
    $controller->logout();
});

$router->addRoute('/trafQuiz/exam', function() {
    $controller = new ExamController();
    $controller->examQuestions();
});

$router->addRoute('/trafQuiz/dashboard', function() {
    if(!Auth::check()) {
        header("Location: /trafQuiz/public/login.html");
        exit;
    }

    $user = Auth::user();
    if($user['role'] === 'admin') {
        (new AdminController())->dashboard();
    } else {
        (new UserController())->dashboard();
    }
});

$router->dispatch($_SERVER['REQUEST_URI']);