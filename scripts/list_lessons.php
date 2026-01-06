<?php
require __DIR__ . '/../vendor/autoload.php';
$items = \TrafQuiz\Models\LessonModel::all();
echo "COUNT:" . count($items) . PHP_EOL;
echo json_encode(array_slice($items, -6), JSON_PRETTY_PRINT) . PHP_EOL;
