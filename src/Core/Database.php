<?php

namespace TrafQuiz\Core;

use PDO;

class Database {
    private $connection;

    public function __construct() {
        $config = parse_ini_file(__DIR__ . '/config.ini', true);

        if(!$config || !isset($config['database'])) {
            throw new \Exception("Database configuration file is missing or invalid.");
        }

        $dbConfig = $config['database'];
        $this->connect($dbConfig['host'], $dbConfig['username'], $dbConfig['password'], $dbConfig['dbname']);
    }

    private function connect($host, $username, $password, $dbname) {
        try {
            $this->connection = new \PDO("mysql:host=$host;dbname=$dbname", $username, $password);
            $this->connection->setAttribute(\PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION);
        } catch (\PDOException $e) {
            throw new \Exception("Database connection failed: " . $e->getMessage());
        }
        //return new PDO('mysql:host=localhost;dbname=traffiquiz_system', 'root', '');
    }

    public function getConnection() { 
        return $this->connection;
    }
}