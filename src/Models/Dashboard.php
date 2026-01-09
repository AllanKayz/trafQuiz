<?php

namespace TrafQuiz\Models;

use TrafQuiz\Core\Database;
use PDO;

class Dashboard
{
    // Manage User Data
    public static function addUser($username, $password, $role)
    {
        $db = new Database();
        $sql = 'INSERT INTO users(username, password, role) VALUES (:username, :password, :role)';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':role', $role);
        $stmt->execute();
        return $db->getConnection()->lastInsertId();
    }

    public static function deleteUser($id)
    {
        $db = new Database();
        $stmt = $db->getConnection()->prepare('DELETE FROM users WHERE id = :id');
        $stmt->bindParam('id', $id);
        $stmt->execute();
        return [
            'success' => $stmt->rowCount() > 0,
            'message' => $stmt->rowCount() > 0 ? 'Delete successful' : 'Failed to delete'
        ];
    }

    public static function updateUser($username, $password, $lastname, $firstname, $email, $id)
    {
        $db = new Database();
        $sql = 'UPDATE users SET username = :username, password = :password, email = :email, firstname = :firstname, lastname = :lastname WHERE id = :id';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->bindParam('id', $id);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':firstname', $firstname);
        $stmt->bindParam(':lastname', $lastname);
        $stmt->execute();
        return [
            'success' => $stmt->rowCount() > 0,
            'message' => $stmt->rowCount() > 0 ? 'Update successful' : 'No rows updated'
        ];
    }

    public static function getUsers()
    {
        $db = new Database();
        $stmt = $db->getConnection()->prepare('SELECT id, username, password, email, firstname, lastname FROM users WHERE role = "user"');
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Manage Exam Time
    public static function updateExamTime($time)
    {
        $db = new Database();
        $stmt = $db->getConnection()->prepare('UPDATE exam_timeframe SET period = :time WHERE id = 1');
        $stmt->bindParam(':time', $time);
        $stmt->execute();
        return [
            'success' => $stmt->rowCount() > 0,
            'message' => $stmt->rowCount() > 0 ? 'Update successful' : 'No rows updated',
            'new_time' => $time
        ];
    }

    public static function getExamTime()
    {
        $db = new Database();
        $sql = 'SELECT period FROM exam_timeframe';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Manage Packages Data
    public static function getPackages()
    {
        $db = new Database();
        $sql = 'SELECT id, package, amount, description FROM packages';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function updatePackage($id, $data)
    {
        $db = new Database();

        // Build the SET clause dynamically based on provided data
        $allowedFields = ['package', 'amount', 'description'];
        $setParts = [];
        $params = [':id' => $id];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $setParts[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (empty($setParts)) {
            return [
                'success' => false,
                'message' => 'No valid fields to update'
            ];
        }

        $sql = 'UPDATE packages SET ' . implode(', ', $setParts) . ' WHERE id = :id';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->execute($params);

        return [
            'success' => $stmt->rowCount() > 0,
            'message' => $stmt->rowCount() > 0 ? 'Update successful' : 'No rows updated'
        ];
    }

    // Manage Student Data
    public static function getStudents()
    {
        $db = new Database();
        $sql = 'SELECT id, name, email, phone, address, status, created_at AS enrollmentDate FROM students';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function addStudent($name, $email, $phone, $address, $status, $userid, $pkgid)
    {
        $db = new Database();
        $sql = 'INSERT INTO students(name, email, phone, address, status, userid, pkgid) VALUES (:name, :email, :phone, :address, :status, :userid, :pkgid)';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':address', $address);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':userid', $userid);
        $stmt->bindParam(':pkgid', $pkgid);
        $stmt->execute();
        return [
            'success' => $stmt->rowCount() > 0,
            'message' => $stmt->rowCount() > 0 ? 'Add successful' : 'No Student Added'
        ];
    }

    public static function updateStudent($id, $name, $email, $phone, $address, $status)
    {
        $db = new Database();
        $sql = 'UPDATE students SET name = :name, email = :email, phone_number = :phone, address = :address, status = :status WHERE id = :id';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':address', $address);
        $stmt->bindParam(':status', $status);
        $stmt->execute();
        return [
            'success' => $stmt->rowCount() > 0,
            'message' => $stmt->rowCount() > 0 ? 'Update successful' : 'No rows updated'
        ];
    }

    public static function deleteStudent($id)
    {
        $db = new Database();
        $stmt = $db->getConnection()->prepare('DELETE FROM students WHERE id = :id');
        $stmt->bindParam('id', $id);
        $stmt->execute();
        return [
            'success' => $stmt->rowCount() > 0,
            'message' => $stmt->rowCount() > 0 ? 'Delete successful' : 'Failed to delete'
        ];
    }

    // Manage Instructor Data
    public static function getInstructors()
    {
        $db = new Database();
        $sql = 'SELECT i.id, i.name, i.email, i.phone, i.license_number, s.specialization, c.certification, i.experience, i.availability, i.created_at, u.username FROM instructors i INNER JOIN specialization s ON i.specialization = s.id INNER JOIN certification c ON i.certification = c.id INNER JOIN users u ON i.userid = u.id';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function addInstructor($userid, $name, $email, $phone, $license_number, $specialization, $certification, $experience, $availability)
    {
        $db = new Database();
        $sql = 'INSERT INTO instructors(userid, name, email, phone, license_number, specialization, certification, experience, availability) VALUES (:userid, :name, :email, :phone, :license_number, :specialization, :certification, :experience, :availability)';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->bindParam(':userid', $userid, PDO::PARAM_INT);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':license_number', $license_number);
        $stmt->bindParam(':specialization', $specialization, PDO::PARAM_INT);
        $stmt->bindParam(':certification', $certification, PDO::PARAM_INT);
        $stmt->bindParam(':experience', $experience, PDO::PARAM_INT);
        $stmt->bindParam(':availability', $availability, PDO::PARAM_BOOL);
        $stmt->execute();
        return [
            'success' => $stmt->rowCount() > 0,
            'message' => $stmt->rowCount() > 0 ? 'Added Instructor successfully' : 'Failed to add Instructor'
        ];
    }

    public static function updateInstructor($id, $data)
    {
        $db = new Database();

        $allowedFields = ['name', 'email', 'phone', 'license_number', 'specialization', 'certification', 'experience', 'availability'];
        $setParts = [];
        $params = [':id' => $id];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $setParts[] = "$field = :$field";
                // specific casting or handling if needed, but standard binding usually works for basic types
                // availability is boolean in addInstructor logic
                if ($field === 'availability' && isset($data[$field])) {
                    $params[":$field"] = $data[$field] ? 1 : 0;
                } else {
                    $params[":$field"] = $data[$field];
                }
            }
        }

        if (empty($setParts)) {
            return [
                'success' => false,
                'message' => 'No valid fields to update'
            ];
        }

        $sql = 'UPDATE instructors SET ' . implode(', ', $setParts) . ' WHERE id = :id';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->execute($params);
        return [
            'success' => $stmt->rowCount() > 0,
            'message' => $stmt->rowCount() > 0 ? 'Update successful' : 'No rows updated'
        ];
    }

    public static function deleteInstructor() {}

    // Manage Certification Data
    public static function getCertifications()
    {
        $db = new Database();
        $sql = 'SELECT id, certification, description FROM certification';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function addCertification($certification, $description)
    {
        $db = new Database();
        $sql = 'INSERT INTO certification(certification, description) VALUES (:certification, :description)';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->bindParam(':certification', $certification);
        $stmt->bindParam(':description', $description);
        $stmt->execute();
        return [
            'success' => $stmt->rowCount() > 0,
            'message' => $stmt->rowCount() > 0 ? 'Added certification successfully' : 'Failed to add certification'
        ];
    }

    public static function deleteCertification($id)
    {
        $db = new Database();
        $stmt = $db->getConnection()->prepare('DELETE FROM certification WHERE id = :id');
        $stmt->bindParam('id', $id);
        $stmt->execute();
        return [
            'success' => $stmt->rowCount() > 0,
            'message' => $stmt->rowCount() > 0 ? 'Delete successful' : 'Failed to delete'
        ];
    }

    public static function updateCertification($id, $data)
    {
        $db = new Database();

        $allowedFields = ['certification', 'description'];
        $setParts = [];
        $params = [':id' => $id];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $setParts[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (empty($setParts)) {
            return [
                'success' => false,
                'message' => 'No valid fields to update'
            ];
        }

        $sql = 'UPDATE certification SET ' . implode(', ', $setParts) . ' WHERE id = :id';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->execute($params);
        return [
            'success' => $stmt->rowCount() > 0,
            'message' => $stmt->rowCount() > 0 ? 'Update successful' : 'No rows updated'
        ];
    }

    // Manage Specialization Data
    public static function getSpecializations()
    {
        $db = new Database();
        $sql = 'SELECT id, specialization, description FROM specialization';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function addSpecialization($specialization, $description)
    {
        $db = new Database();
        $sql = 'INSERT INTO specialization(specialization, description) VALUES (:specialization, :description)';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->bindParam(':specialization', $specialization);
        $stmt->bindParam(':description', $description);
        $stmt->execute();
        return [
            'success' => $stmt->rowCount() > 0,
            'message' => $stmt->rowCount() > 0 ? 'Added specialization successfully' : 'Failed to add specialization'
        ];
    }

    public static function deleteSpecialization($id)
    {
        $db = new Database();
        $stmt = $db->getConnection()->prepare('DELETE FROM specialization WHERE id = :id');
        $stmt->bindParam('id', $id);
        $stmt->execute();
        return [
            'success' => $stmt->rowCount() > 0,
            'message' => $stmt->rowCount() > 0 ? 'Delete successful' : 'Failed to delete'
        ];
    }

    public static function updateSpecialization($id, $data)
    {
        $db = new Database();

        $allowedFields = ['specialization', 'description'];
        $setParts = [];
        $params = [':id' => $id];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $setParts[] = "$field = :$field";
                $params[":$field"] = $data[$field];
            }
        }

        if (empty($setParts)) {
            return [
                'success' => false,
                'message' => 'No valid fields to update'
            ];
        }

        $sql = 'UPDATE specialization SET ' . implode(', ', $setParts) . ' WHERE id = :id';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->execute($params);
        return [
            'success' => $stmt->rowCount() > 0,
            'message' => $stmt->rowCount() > 0 ? 'Update successful' : 'No rows updated'
        ];
    }
}
