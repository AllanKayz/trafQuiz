<?php
require_once __DIR__ . '/../../vendor/autoload.php';

use TrafQuiz\Models\VehicleModel;

error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    $vehicles = VehicleModel::all();
    echo "Total vehicles: " . count($vehicles) . "\n";
    print_r($vehicles);
} catch (\Throwable $t) {
    echo "Error: " . $t->getMessage() . "\n";
}
