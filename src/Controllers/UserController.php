<?php

namespace TrafQuiz\Controllers;

use TrafQuiz\Models\User;

class UserController
{

    /**
     * Update user profile
     * POST /api/updateuser
     */
    public function updateProfile()
    {
        header('Content-Type: application/json');

        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            http_response_code(400);
            echo json_encode(["message" => "No data received or invalid JSON"]);
            return;
        }

        // Get user ID from data or session
        $userId = $data['id'] ?? $data['userId'] ?? null;

        if (!$userId) {
            http_response_code(400);
            echo json_encode(["message" => "User ID is required"]);
            return;
        }

        // Remove id from update data
        unset($data['id']);
        unset($data['userId']);

        // If password provided, hash it
        if (isset($data['password']) && !empty($data['password'])) {
            $data['password'] = password_hash($data['password'], PASSWORD_DEFAULT);
        }

        $result = User::updateUser($userId, $data);

        if ($result) {
            $updatedUser = User::find($userId);
            unset($updatedUser['password']); // Don't send password back

            echo json_encode([
                "status" => 200,
                "message" => "Profile updated successfully",
                "user" => $updatedUser
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Failed to update profile"]);
        }
    }
}
