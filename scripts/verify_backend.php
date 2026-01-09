<?php

$base = "http://localhost:8080/trafQuiz/public/api/index.php";

function test($name, $method, $url, $data = null) {
    echo "Testing $name ($method $url)...\n";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    if ($data) {
        $json = json_encode($data);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $json);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    }
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    echo "Code: $code\n";
    echo "Response: $resp\n\n";
    return json_decode($resp, true);
}

// 1. Test Lessons
test("Get Lessons", "GET", "$base/lessons?range=today");

// 2. Test Payments
test("Process Payment", "POST", "$base/payments/process", [
    'studentId' => 1,
    'amount' => 50.00,
    'packageId' => 2,
    'method' => 'card'
]);

// 3. Test Messaging
$convRes = test("Start Conversation", "POST", "$base/messages/send", [
    'participantIds' => [1, 2],
    'senderId' => 1,
    'senderName' => 'Test Student',
    'text' => 'Hello Instructor!',
    'title' => 'Initial Chat'
]);

if (isset($convRes['conversationId'])) {
    $cid = $convRes['conversationId'];
    test("Get Conversations", "GET", "$base/conversations?userId=1");
    test("Get Messages", "GET", "$base/messages?conversationId=$cid");
}

// 4. Test Auto-Allocation
test("Auto Allocate", "POST", "$base/admin/auto-allocate");
