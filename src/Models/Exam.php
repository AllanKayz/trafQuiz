<?php

namespace TrafQuiz\Models;

use TrafQuiz\Core\Database;
use PDO;

class Exam
{
    public static function getExam()
    {
        $questions_id = [];
        $db = new Database();
        $stmt = $db->getConnection()->prepare('SELECT exam_id FROM questions');
        $stmt->execute();

        if ($stmt) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $questions_id[] = $row['exam_id'];
            }
        } else {
            return json_encode('No Exam In Database');
        }

        //shuffling array with fisher yates
        $length = count($questions_id);
        for ($i = $length - 1; $i > 0; $i--) {
            $j = rand(0, $i);
            list($questions_id[$i], $questions_id[$j]) = array($questions_id[$j], $questions_id[$i]);
        }

        $rand_exam_id = $questions_id[0];

        $stmt = $db->getConnection()->prepare('SELECT id, TRIM(question_text) AS question, TRIM(option_a) AS option_a, TRIM(option_b) AS option_b, TRIM(option_c) AS option_c, TRIM(answer) AS answer, img_insert AS photo FROM questions WHERE exam_id = :random_exam_id LIMIT 25');
        $stmt->bindParam(':random_exam_id', $rand_exam_id);
        $stmt->execute();
        $questions =  $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $questions;
    }

    public static function getExamTime()
    {
        $db = new Database();
        $stmt = $db->getConnection()->prepare('SELECT period FROM exam_timeframe');
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public static function getAllQuestions()
    {
        $db = new Database();
        $stmt = $db->getConnection()->prepare('SELECT id, TRIM(question_text) AS question, TRIM(option_a) AS option_a, TRIM(option_b) AS option_b, TRIM(option_c) AS option_c, TRIM(answer) AS answer, img_insert AS photo FROM questions');
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Create new question
     */
    public static function createQuestion($data)
    {
        $db = new Database();
        $conn = $db->getConnection();

        $sql = "INSERT INTO questions (question_text, option_a, option_b, option_c, answer, img_insert, exam_id) 
                VALUES (:question, :option_a, :option_b, :option_c, :answer, :photo, :exam_id)";

        $stmt = $conn->prepare($sql);
        $result = $stmt->execute([
            ':question' => $data['question'] ?? $data['question_text'] ?? '',
            ':option_a' => $data['options'][0] ?? $data['option_a'] ?? '',
            ':option_b' => $data['options'][1] ?? $data['option_b'] ?? '',
            ':option_c' => $data['options'][2] ?? $data['option_c'] ?? '',
            ':answer' => $data['answer'] ?? $data['options'][$data['correct'] ?? 0] ?? '',
            ':photo' => $data['photo'] ?? $data['image'] ?? $data['img_insert'] ?? null,
            ':exam_id' => $data['exam_id'] ?? 1
        ]);

        if ($result) {
            return $conn->lastInsertId();
        }

        return false;
    }

    /**
     * Update question
     */
    public static function updateQuestion($id, $data)
    {
        $db = new Database();
        $conn = $db->getConnection();

        $updates = [];
        $params = [':id' => $id];

        if (isset($data['question']) || isset($data['question_text'])) {
            $updates[] = "question_text = :question";
            $params[':question'] = $data['question'] ?? $data['question_text'];
        }

        if (isset($data['options']) && is_array($data['options'])) {
            $updates[] = "option_a = :option_a";
            $updates[] = "option_b = :option_b";
            $updates[] = "option_c = :option_c";
            $params[':option_a'] = $data['options'][0] ?? '';
            $params[':option_b'] = $data['options'][1] ?? '';
            $params[':option_c'] = $data['options'][2] ?? '';
        } else {
            if (isset($data['option_a'])) {
                $updates[] = "option_a = :option_a";
                $params[':option_a'] = $data['option_a'];
            }
            if (isset($data['option_b'])) {
                $updates[] = "option_b = :option_b";
                $params[':option_b'] = $data['option_b'];
            }
            if (isset($data['option_c'])) {
                $updates[] = "option_c = :option_c";
                $params[':option_c'] = $data['option_c'];
            }
        }

        if (isset($data['answer'])) {
            $updates[] = "answer = :answer";
            $params[':answer'] = $data['answer'];
        }

        if (isset($data['photo']) || isset($data['image']) || isset($data['img_insert'])) {
            $updates[] = "img_insert = :photo";
            $params[':photo'] = $data['photo'] ?? $data['image'] ?? $data['img_insert'];
        }

        if (empty($updates)) {
            return false;
        }

        $sql = "UPDATE questions SET " . implode(', ', $updates) . " WHERE id = :id";
        $stmt = $conn->prepare($sql);

        return $stmt->execute($params);
    }

    /**
     * Delete question
     */
    public static function deleteQuestion($id)
    {
        $db = new Database();
        $conn = $db->getConnection();

        $sql = "DELETE FROM questions WHERE id = :id";
        $stmt = $conn->prepare($sql);

        return $stmt->execute([':id' => $id]);
    }
}
