<?php

require __DIR__ . '/../vendor/autoload.php';
use TrafQuiz\Models\LessonModel;

$count = isset($argv[1]) ? intval($argv[1]) : 2;
$sample = [
    [
        'title' => 'CLI Seed: Traffic Signs',
        'subject' => 'Theory',
        'startTime' => date('c', strtotime('+1 day 09:00')),
        'durationMinutes' => 60,
        'instructor' => ['id' => 201, 'name' => 'CLI Seeder'],
        'location' => 'Room CLI',
        'status' => 'upcoming',
        'studentCount' => 0
    ],
    [
        'title' => 'CLI Seed: Night Driving',
        'subject' => 'Practical',
        'startTime' => date('c', strtotime('+2 days 18:00')),
        'durationMinutes' => 90,
        'instructor' => ['id' => 202, 'name' => 'CLI Seeder'],
        'location' => 'Simulator',
        'status' => 'upcoming',
        'studentCount' => 0
    ]
];

$added = [];
for ($i = 0; $i < max(1, $count); $i++) {
    $base = $sample[$i % count($sample)];
    $item = $base;
    $item['title'] = $base['title'] . ' #' . ($i + 1);
    $item['startTime'] = date('c', strtotime('+' . ($i + 1) . ' days 09:00'));
    $created = LessonModel::add($item);
    $added[] = $created;
}

echo json_encode(['seeded' => count($added), 'items' => $added], JSON_PRETTY_PRINT) . PHP_EOL;