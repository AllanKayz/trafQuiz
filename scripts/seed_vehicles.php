<?php
require __DIR__ . '/../vendor/autoload.php';

use TrafQuiz\Models\VehicleModel;

$sample = [
    ['make' => 'Toyota', 'model' => 'Corolla', 'year' => 2018, 'registration' => 'ABC-123', 'type' => 'car', 'status' => 'active'],
    ['make' => 'Isuzu', 'model' => 'D-Max', 'year' => 2019, 'registration' => 'TRK-001', 'type' => 'truck', 'status' => 'active'],
    ['make' => 'Honda', 'model' => 'CBR', 'year' => 2020, 'registration' => 'MOT-09', 'type' => 'motorcycle', 'status' => 'maintenance']
];

$added = [];
foreach ($sample as $s) {
    $added[] = VehicleModel::create($s);
}

echo "Seeded: " . count($added) . " vehicles\n";
