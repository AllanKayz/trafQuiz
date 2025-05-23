<?php

namespace TrafQuiz\Core;

class Router {
    private $routes = [];

    public function addRoute($method, $path, $callback) {
        $this->routes[strtoupper($method)][$path] = $callback;
    }

    public function dispatch($method, $path) {
        $method = strtoupper($method);
        $path = strtok($path, '?'); //Remove Query Parameters

        if(isset($this->routes[$method][$path])) {
            call_user_func($this->routes[$method][$path]);
        } else {
            http_response_code(404);
            echo json_encode(["message" => "Route Not Found"]);
        }
    }
}