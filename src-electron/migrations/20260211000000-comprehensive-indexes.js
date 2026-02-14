
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - index on payment_date for faster reporting/filtering
    await queryInterface.addIndex('payments', ['payment_date']);

    // 2. Lessons - index on status for filtering (upcoming, completed, etc.)
    await queryInterface.addIndex('lessons', ['status']);

    // 3. Students & Instructors - created_at for default sorting (newest first)
    await queryInterface.addIndex('students', ['created_at']);
    await queryInterface.addIndex('instructors', ['created_at']);

    // 4. Instructors - specialization and certification foreign keys
    await queryInterface.addIndex('instructors', ['specialization_id']);
    await queryInterface.addIndex('instructors', ['certification_id']);

    // 5. Student Exams - frequently queried for progress/reports
    await queryInterface.addIndex('student_exams', ['student_id']);
    await queryInterface.addIndex('student_exams', ['exam_id']);
    await queryInterface.addIndex('student_exams', ['completed_at']);

    // 6. Vehicle Issues & Logs - foreign keys
    await queryInterface.addIndex('vehicle_issues', ['vehicle_id']);
    await queryInterface.addIndex('vehicle_issues', ['instructor_id']);
    await queryInterface.addIndex('vehicle_logs', ['vehicle_id']);
    await queryInterface.addIndex('vehicle_logs', ['instructor_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('lessons', ['status']);
    await queryInterface.removeIndex('students', ['created_at']);
    await queryInterface.removeIndex('instructors', ['created_at']);
    await queryInterface.removeIndex('instructors', ['specialization_id']);
    await queryInterface.removeIndex('instructors', ['certification_id']);
    await queryInterface.removeIndex('student_exams', ['student_id']);
    await queryInterface.removeIndex('student_exams', ['exam_id']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('vehicle_issues', ['vehicle_id']);
    await queryInterface.removeIndex('vehicle_issues', ['instructor_id']);
    await queryInterface.removeIndex('vehicle_logs', ['vehicle_id']);
    await queryInterface.removeIndex('vehicle_logs', ['instructor_id']);
  }
};
