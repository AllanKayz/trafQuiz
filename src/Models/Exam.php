<?php

namespace TrafQuiz\Models;

use TrafQuiz\Core\Database;
use PDO;

class Exam {
    public static function getExam() {
        $questions_id = [];
        $db = new Database();
        $stmt = $db->getConnection()->prepare('SELECT exam_id FROM questions');
        $stmt->execute();

        if($stmt) {
            while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
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

        $stmt = $db->getConnection()->prepare('SELECT TRIM(question_text) AS question, TRIM(option_a) AS option_a, TRIM(option_b) AS option_b, TRIM(option_c) AS option_c, TRIM(answer) AS answer, img_insert AS photo FROM questions WHERE exam_id = :random_exam_id LIMIT 25');
        $stmt->bindParam(':random_exam_id', $rand_exam_id);
        $stmt->execute();
        $questions =  $stmt->fetchAll(PDO::FETCH_ASSOC);

        return $questions;
    }
	
	public static function getExamTime() {
		$db = new Database();
		$stmt = $db->getConnection()->prepare('SELECT period FROM exam_timeframe');
		$stmt->execute();
		return $stmt->fetch(PDO::FETCH_ASSOC);
	}
}