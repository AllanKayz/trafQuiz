<?php

namespace TrafQuiz\Controllers;

class UserController {
    public function dashboard() {
        header("Location: /trafQuiz/exam");
        exit;
    }
}