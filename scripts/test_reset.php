<?php
$url = 'http://localhost:84/trafQuiz/public/api/forgot-password';
$data = ['username' => 'admin'];
$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
    ],
];
$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);
echo "Forgot Password Response: " . $result . "\n";

$resObj = json_decode($result, true);
$token = $resObj['token'] ?? null;

if ($token) {
    echo "Using token: $token\n";
    $url = 'http://localhost:84/trafQuiz/public/api/reset-password';
    $data = ['token' => $token, 'newPassword' => 'newpassword123'];
    $options['http']['content'] = json_encode($data);
    $context  = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    echo "Reset Password Response: " . $result . "\n";
}
