
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Students - index on package_id and status for filtering
    await queryInterface.addIndex('students', ['package_id']);
    await queryInterface.addIndex('students', ['status']);

    // 2. Instructors - index on specialization, certification, and status
    await queryInterface.addIndex('instructors', ['specialization_id']);
    await queryInterface.addIndex('instructors', ['certification_id']);
    await queryInterface.addIndex('instructors', ['status']);

    // 3. Payments - additional indexes for dashboard and financial filtering
    await queryInterface.addIndex('payments', ['package_id']);
    await queryInterface.addIndex('payments', ['type']);
    await queryInterface.addIndex('payments', ['payment_date']);

    // 4. Vehicle Issues - optimize filtering by vehicle or instructor
    await queryInterface.addIndex('vehicle_issues', ['vehicle_id']);
    await queryInterface.addIndex('vehicle_issues', ['instructor_id']);
    await queryInterface.addIndex('vehicle_issues', ['status']);

    // 5. Vehicle Logs - optimize filtering by vehicle or instructor
    await queryInterface.addIndex('vehicle_logs', ['vehicle_id']);
    await queryInterface.addIndex('vehicle_logs', ['instructor_id']);

    // 6. Reports - optimize filtering by student
    await queryInterface.addIndex('reports', ['student_id']);

    // 7. Student Exams & History - optimize frequent joins and lookups
    await queryInterface.addIndex('student_exams', ['student_id']);
    await queryInterface.addIndex('student_exams', ['exam_id']);
    await queryInterface.addIndex('student_exams', ['score']);
    await queryInterface.addIndex('student_exam_history', ['student_id']);
    await queryInterface.addIndex('student_exam_history', ['exam_id']);

    // 8. Exam Timeframe - optimize lookup by exam
    await queryInterface.addIndex('exam_timeframe', ['exam_id']);

    // 9. Questions - index on answer for countReviewed optimization
    await queryInterface.addIndex('questions', ['answer']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('students', ['package_id']);
    await queryInterface.removeIndex('students', ['status']);
    await queryInterface.removeIndex('instructors', ['specialization_id']);
    await queryInterface.removeIndex('instructors', ['certification_id']);
    await queryInterface.removeIndex('instructors', ['status']);
    await queryInterface.removeIndex('payments', ['package_id']);
    await queryInterface.removeIndex('payments', ['type']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('vehicle_issues', ['vehicle_id']);
    await queryInterface.removeIndex('vehicle_issues', ['instructor_id']);
    await queryInterface.removeIndex('vehicle_issues', ['status']);
    await queryInterface.removeIndex('vehicle_logs', ['vehicle_id']);
    await queryInterface.removeIndex('vehicle_logs', ['instructor_id']);
    await queryInterface.removeIndex('reports', ['student_id']);
    await queryInterface.removeIndex('student_exams', ['student_id']);
    await queryInterface.removeIndex('student_exams', ['exam_id']);
    await queryInterface.removeIndex('student_exams', ['score']);
    await queryInterface.removeIndex('student_exam_history', ['student_id']);
    await queryInterface.removeIndex('student_exam_history', ['exam_id']);
    await queryInterface.removeIndex('exam_timeframe', ['exam_id']);
    await queryInterface.removeIndex('questions', ['answer']);
  }
};
