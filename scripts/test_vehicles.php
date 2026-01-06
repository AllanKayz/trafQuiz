<?php
require __DIR__ . '/../vendor/autoload.php';
use TrafQuiz\Models\VehicleModel;

echo "--- VEHICLE MODEL SMOKE TEST ---\n";
// Clean existing data file for reproducible test
$dataFile = __DIR__ . '/../src/data/vehicles.json';
if (file_exists($dataFile)) { unlink($dataFile); echo "Removed existing vehicles.json\n"; }

// Add vehicle
$v = VehicleModel::add(['make' => 'Smoke', 'model' => 'TestCar', 'year' => 2021, 'registration' => 'SMK-001']);
echo "Added: " . json_encode($v) . "\n";

// List vehicles
$list = VehicleModel::all();
echo "List count: " . count($list) . "\n";

// Update
$ok = VehicleModel::update($v['id'], ['notes' => 'Updated by smoke test']);
echo "Update ok: " . ($ok ? 'true' : 'false') . "\n";
$after = VehicleModel::find($v['id']);
echo "After update: " . json_encode($after) . "\n";

// Delete
$del = VehicleModel::delete($v['id']);
echo "Delete ok: " . ($del ? 'true' : 'false') . "\n";
$final = VehicleModel::all();
echo "Final count: " . count($final) . "\n";

echo "--- END ---\n";