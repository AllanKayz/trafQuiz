<?php

namespace TrafQuiz\Models;

use TrafQuiz\Core\Database;
use PDO;

class Dashboard
{
    // Dashboard Statistics
    public static function getDashboardStats($role = 'admin', $userId = null)
    {
        $db = new Database();
        $conn = $db->getConnection();

        if ($role === 'admin') {
            // 1. Total Students
            $stmt = $conn->query("SELECT COUNT(*) as count FROM students");
            $totalStudents = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

            // 2. Active Students
            $stmt = $conn->query("SELECT COUNT(*) as count FROM students WHERE status = 'active'");
            $activeStudents = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

            // 3. Monthly Revenue (Current Month)
            $stmt = $conn->query("SELECT SUM(amount) as revenue FROM payments WHERE status = 'completed' AND MONTH(payment_date) = MONTH(CURRENT_DATE()) AND YEAR(payment_date) = YEAR(CURRENT_DATE())");
            $monthlyRevenue = $stmt->fetch(PDO::FETCH_ASSOC)['revenue'] ?? 0;

            // 4. Exams Today
            $stmt = $conn->query("SELECT COUNT(*) as count FROM exams WHERE DATE(start_time) = CURRENT_DATE()");
            $examsToday = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

            // 5. System Alerts (Maintenance vehicles + Open Issues)
            $stmt = $conn->query("SELECT COUNT(*) as count FROM vehicles WHERE status = 'maintenance'");
            $maintCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

            $stmt = $conn->query("SELECT COUNT(*) as count FROM vehicle_issues WHERE status = 'open'");
            $issueCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
            $alerts = $maintCount + $issueCount;

            return [
                'total_students' => $totalStudents,
                'active_students' => $activeStudents,
                'monthly_revenue' => (float)$monthlyRevenue,
                'exams_today' => $examsToday,
                'system_alerts' => $alerts
            ];
        } else if ($role === 'student' && $userId) {
            // Get studentId
            $stmt = $conn->prepare("SELECT id FROM students WHERE user_id = :uid");
            $stmt->execute([':uid' => $userId]);
            $student = $stmt->fetch(PDO::FETCH_ASSOC);
            $studentId = $student ? $student['id'] : null;

            if (!$studentId) return [];

            // 1. Lessons Attended
            $stmt = $conn->prepare("SELECT COUNT(*) as count FROM lessons WHERE student_id = :sid AND status = 'completed'");
            $stmt->execute([':sid' => $studentId]);
            $lessonsAttended = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

            // 2. Success Rate (Exams passed)
            $stmt = $conn->prepare("SELECT AVG(score) as avg_score, COUNT(*) as exam_count FROM student_exams WHERE student_id = :sid AND score IS NOT NULL");
            $stmt->execute([':sid' => $studentId]);
            $examStats = $stmt->fetch(PDO::FETCH_ASSOC);
            $avgScore = $examStats['avg_score'] ?? 0;
            $examCount = $examStats['exam_count'] ?? 0;

            // 3. Upcoming Lessons
            $stmt = $conn->prepare("SELECT COUNT(*) as count FROM lessons WHERE student_id = :sid AND status = 'scheduled' AND start_time > NOW()");
            $stmt->execute([':sid' => $studentId]);
            $upcomingLessons = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

            return [
                'lessons_attended' => $lessonsAttended,
                'success_rate' => round($avgScore, 1),
                'exams_taken' => $examCount,
                'upcoming_lessons' => $upcomingLessons
            ];
        } else if ($role === 'instructor' && $userId) {
            // Get instructorId
            $stmt = $conn->prepare("SELECT id FROM instructors WHERE user_id = :uid");
            $stmt->execute([':uid' => $userId]);
            $instructor = $stmt->fetch(PDO::FETCH_ASSOC);
            $instructorId = $instructor ? $instructor['id'] : null;

            if (!$instructorId) return [];

            // 1. Assigned Students
            $stmt = $conn->prepare("SELECT COUNT(DISTINCT student_id) as count FROM lessons WHERE instructor_id = :iid");
            $stmt->execute([':iid' => $instructorId]);
            $assignedStudents = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

            // 2. Lessons Today
            $stmt = $conn->prepare("SELECT COUNT(*) as count FROM lessons WHERE instructor_id = :iid AND DATE(start_time) = CURRENT_DATE()");
            $stmt->execute([':iid' => $instructorId]);
            $lessonsToday = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

            // 3. Vehicle Issues (Open issues reported by this instructor or for their assigned vehicles?)
            // For now, let's say issues they reported.
            $stmt = $conn->prepare("SELECT COUNT(*) as count FROM vehicle_issues WHERE instructor_id = :iid AND status IN ('open', 'in_progress')");
            $stmt->execute([':iid' => $instructorId]);
            $openIssues = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

            return [
                'assigned_students' => $assignedStudents,
                'lessons_today' => $lessonsToday,
                'vehicle_issues' => $openIssues,
                'reports_pending' => 0 // Mock for now
            ];
        }

        return [];
    }

    // Manage User Data
    public static function addUser($username, $password, $role, $firstName = null, $lastName = null, $email = null, $phone = null)
    {
        $db = new Database();
        $sql = 'INSERT INTO users(username, password, role, first_name, last_name, email, phone) VALUES (:username, :password, :role, :firstName, :lastName, :email, :phone)';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':role', $role);
        $stmt->bindParam(':firstName', $firstName);
        $stmt->bindParam(':lastName', $lastName);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':phone', $phone);
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

    public static function resetUserPassword($id, $newPassword)
    {
        $db = new Database();
        $hash = password_hash($newPassword, PASSWORD_DEFAULT);
        $stmt = $db->getConnection()->prepare('UPDATE users SET password = :password WHERE id = :id');
        $stmt->bindParam(':password', $hash);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return [
            'success' => $stmt->rowCount() > 0,
            'message' => $stmt->rowCount() > 0 ? 'Password updated successfully' : 'Failed to update password'
        ];
    }

    public static function updateUser($username, $password, $lastname, $firstname, $email, $id)
    {
        $db = new Database();
        // Updated column names to match new schema (first_name, last_name)
        $sql = 'UPDATE users SET username = :username, password = :password, email = :email, first_name = :firstname, last_name = :lastname WHERE id = :id';
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
        $stmt = $db->getConnection()->prepare('SELECT id, username, first_name, last_name, email, role, created_at FROM users');
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
    public static function getStudents($instructorId = null)
    {
        $db = new Database();
        $conn = $db->getConnection();

        $sql = 'SELECT s.id, u.id AS userId, CONCAT(u.first_name, " ", u.last_name) as name, u.email, u.phone, s.address, s.status, s.created_at AS enrollmentDate 
                FROM students s 
                JOIN users u ON s.user_id = u.id';

        if ($instructorId) {
            // Filter by lessons assignment
            // Use DISTINCT to avoid duplicates if multiple lessons exist
            $sql = 'SELECT DISTINCT s.id, u.id AS userId, CONCAT(u.first_name, " ", u.last_name) as name, u.email, u.phone, s.address, s.status, s.created_at AS enrollmentDate 
                    FROM students s 
                    JOIN users u ON s.user_id = u.id
                    JOIN lessons l ON s.id = l.student_id
                    WHERE l.instructor_id = :instId';

            $stmt = $conn->prepare($sql);
            $stmt->execute([':instId' => $instructorId]);
        } else {
            $stmt = $conn->prepare($sql);
            $stmt->execute();
        }

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function addStudent($name, $email, $phone, $address, $status, $userid, $pkgid)
    {
        // NOTE: $name, $email, $phone are passed but we expect $userid to already be created with these details in Users table.
        // However, if the user was just created with username/password, we might need to update the user record here?
        // Or assume the Controller handled calling addUser with all details.
        // In the new schema, students table only holds address, status, package_id.

        // For safety, let's update the user record if name/email/phone are provided effectively ensuring data consistency
        // But for now, let's assume Controller calls addUser with full details.

        $db = new Database();
        $sql = 'INSERT INTO students(user_id, address, status, package_id) VALUES (:userid, :address, :status, :pkgid)';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->bindParam(':userid', $userid);
        $stmt->bindParam(':address', $address);
        $stmt->bindParam(':status', $status);
        $stmt->bindParam(':pkgid', $pkgid);
        $stmt->execute();
        return [
            'success' => $stmt->rowCount() > 0,
            'message' => $stmt->rowCount() > 0 ? 'Add successful' : 'No Student Added'
        ];
    }

    public static function updateStudent($id, $data)
    {
        $db = new Database();
        $conn = $db->getConnection();

        // 1. Get user_id from students table
        $stmt0 = $conn->prepare('SELECT user_id FROM students WHERE id = :id');
        $stmt0->execute([':id' => $id]);
        $row = $stmt0->fetch(PDO::FETCH_ASSOC);
        $userid = $row ? $row['user_id'] : null;

        // 2. Update Users table
        if ($userid) {
            $userUpdates = [];
            $userParams = [':uid' => $userid];

            if (isset($data['firstName'])) {
                $userUpdates[] = "first_name = :fname";
                $userParams[':fname'] = $data['firstName'];
            }
            if (isset($data['lastName'])) {
                $userUpdates[] = "last_name = :lname";
                $userParams[':lname'] = $data['lastName'];
            }
            if (isset($data['name']) && !isset($data['firstName']) && !isset($data['lastName'])) {
                $parts = explode(' ', $data['name'], 2);
                $userUpdates[] = "first_name = :fname";
                $userUpdates[] = "last_name = :lname";
                $userParams[':fname'] = $parts[0] ?? '';
                $userParams[':lname'] = $parts[1] ?? '';
            }
            if (isset($data['email'])) {
                $userUpdates[] = "email = :email";
                $userParams[':email'] = $data['email'];
            }
            if (isset($data['phone'])) {
                $userUpdates[] = "phone = :phone";
                $userParams[':phone'] = $data['phone'];
            }
            if (!empty($data['password'])) {
                $userUpdates[] = "password = :password";
                $userParams[':password'] = password_hash($data['password'], PASSWORD_DEFAULT);
            }

            if (!empty($userUpdates)) {
                $uSql = 'UPDATE users SET ' . implode(', ', $userUpdates) . ' WHERE id = :uid';
                $uStmt = $conn->prepare($uSql);
                $uStmt->execute($userParams);
            }
        }

        // 3. Update Students table
        $studentUpdates = [];
        $studentParams = [':id' => $id];

        if (isset($data['address'])) {
            $studentUpdates[] = "address = :address";
            $studentParams[':address'] = $data['address'];
        }
        if (isset($data['status'])) {
            $studentUpdates[] = "status = :status";
            $studentParams[':status'] = $data['status'];
        }
        if (isset($data['active'])) {
            $studentUpdates[] = "status = :status";
            $studentParams[':status'] = $data['active'] ? 'active' : 'inactive';
        }

        if (!empty($studentUpdates)) {
            $sql = 'UPDATE students SET ' . implode(', ', $studentUpdates) . ' WHERE id = :id';
            $stmt = $conn->prepare($sql);
            $stmt->execute($studentParams);
        }

        return [
            'success' => true,
            'message' => 'Update successful'
        ];
    }

    public static function deleteStudent($id)
    {
        $db = new Database();
        // Since ON DELETE CASCADE is set on foreign key, deleting user would delete student.
        // But here we are deleting student by student ID.
        // We should probably delete the User record too if the business logic implies "Student IS A User".

        // Get user_id first
        $stmt0 = $db->getConnection()->prepare('SELECT user_id FROM students WHERE id = :id');
        $stmt0->execute([':id' => $id]);
        $row = $stmt0->fetch(PDO::FETCH_ASSOC);
        $userid = $row ? $row['user_id'] : null;

        // Delete from students
        $stmt = $db->getConnection()->prepare('DELETE FROM students WHERE id = :id');
        $stmt->bindParam('id', $id);
        $stmt->execute();

        // Optionally delete user? 
        // For now, let's keep the User record unless explicitly told to delete User.
        // But based on "deleteStudent" naming, usually implies removing the student entity.
        // If we only delete from students table, the User remains but is no longer a student.

        return [
            'success' => $stmt->rowCount() > 0,
            'message' => $stmt->rowCount() > 0 ? 'Delete successful' : 'Failed to delete'
        ];
    }

    // Manage Instructor Data
    public static function getInstructors()
    {
        $db = new Database();
        // Join users to get profile data
        $sql = 'SELECT i.id, u.id AS userId, CONCAT(u.first_name, " ", u.last_name) as name, u.email, u.phone, i.license_number, s.specialization, c.certification, i.experience, i.availability, i.created_at, u.username 
                FROM instructors i 
                INNER JOIN specialization s ON i.specialization_id = s.id 
                INNER JOIN certification c ON i.certification_id = c.id 
                INNER JOIN users u ON i.user_id = u.id';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public static function addInstructor($userid, $name, $email, $phone, $license_number, $specialization, $certification, $experience, $availability)
    {
        // Similar to addStudent, we assume the User record ($userid) is already created/updated with name, email, phone.
        $db = new Database();

        // We might need to ensure User has the data if not passed during creation?
        // But let's stick to inserting into instructors table.

        $sql = 'INSERT INTO instructors(user_id, license_number, specialization_id, certification_id, experience, availability) VALUES (:userid, :license_number, :specialization, :certification, :experience, :availability)';
        $stmt = $db->getConnection()->prepare($sql);
        $stmt->bindParam(':userid', $userid, PDO::PARAM_INT);
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
        $conn = $db->getConnection();

        // 1. Get user_id
        $stmt0 = $conn->prepare('SELECT user_id FROM instructors WHERE id = :id');
        $stmt0->execute([':id' => $id]);
        $row = $stmt0->fetch(PDO::FETCH_ASSOC);
        $userid = $row ? $row['user_id'] : null;

        // 2. Update Users table (username/password/name/email/phone)
        if ($userid) {
            $userUpdates = [];
            $userParams = [':uid' => $userid];

            if (isset($data['username'])) {
                $userUpdates[] = "username = :username";
                $userParams[':username'] = $data['username'];
            }
            if (!empty($data['password'])) {
                $userUpdates[] = "password = :password";
                $userParams[':password'] = password_hash($data['password'], PASSWORD_DEFAULT);
            }
            if (isset($data['firstName'])) {
                $userUpdates[] = "first_name = :firstname";
                $userParams[':firstname'] = $data['firstName'];
            }
            if (isset($data['lastName'])) {
                $userUpdates[] = "last_name = :lastname";
                $userParams[':lastname'] = $data['lastName'];
            }
            if (isset($data['name']) && !isset($data['firstName']) && !isset($data['lastName'])) {
                $parts = explode(' ', $data['name'], 2);
                $userUpdates[] = "first_name = :firstname";
                $userUpdates[] = "last_name = :lastname";
                $userParams[':firstname'] = $parts[0] ?? '';
                $userParams[':lastname'] = $parts[1] ?? '';
            }
            if (isset($data['email'])) {
                $userUpdates[] = "email = :email";
                $userParams[':email'] = $data['email'];
            }
            if (isset($data['phone'])) {
                $userUpdates[] = "phone = :phone";
                $userParams[':phone'] = $data['phone'];
            }

            if (!empty($userUpdates)) {
                $uSql = 'UPDATE users SET ' . implode(', ', $userUpdates) . ' WHERE id = :uid';
                $uStmt = $conn->prepare($uSql);
                $uStmt->execute($userParams);
            }
        }

        // 3. Update Instructors table
        $allowedFields = ['license_number', 'specialization', 'certification', 'experience', 'availability', 'available'];
        $mapFields = ['specialization' => 'specialization_id', 'certification' => 'certification_id', 'available' => 'availability']; // Map input to DB column

        $setParts = [];
        $params = [':id' => $id];

        foreach ($allowedFields as $field) {
            if (isset($data[$field])) {
                $dbField = $mapFields[$field] ?? $field;
                $setParts[] = "$dbField = :$dbField";

                if ($field === 'availability' || $field === 'available') {
                    $params[":$dbField"] = $data[$field] ? 1 : 0;
                } else {
                    $params[":$dbField"] = $data[$field];
                }
            }
        }

        if (!empty($setParts)) {
            $sql = 'UPDATE instructors SET ' . implode(', ', $setParts) . ' WHERE id = :id';
            $stmt = $conn->prepare($sql);
            $stmt->execute($params);
        }

        return [
            'success' => true,
            'message' => 'Update successful'
        ];
    }

    public static function deleteInstructor($id)
    {
        $db = new Database();
        // Get user_id first
        $stmt0 = $db->getConnection()->prepare('SELECT user_id FROM instructors WHERE id = :id');
        $stmt0->execute([':id' => $id]);
        $row = $stmt0->fetch(PDO::FETCH_ASSOC);
        $userid = $row ? $row['user_id'] : null;

        $stmt = $db->getConnection()->prepare('DELETE FROM instructors WHERE id = :id');
        $stmt->bindParam('id', $id);
        $stmt->execute();

        // Optionally delete user? For now, no.

        return [
            'success' => $stmt->rowCount() > 0,
            'message' => $stmt->rowCount() > 0 ? 'Delete successful' : 'Failed to delete'
        ];
    }

    // Manage Documentation Data
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
