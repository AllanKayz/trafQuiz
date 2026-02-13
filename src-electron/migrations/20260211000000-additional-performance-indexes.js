
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Vehicle issues and logs - frequently joined with vehicles and instructors
    await queryInterface.addIndex('vehicle_issues', ['vehicle_id']);
    await queryInterface.addIndex('vehicle_issues', ['instructor_id']);
    await queryInterface.addIndex('vehicle_logs', ['vehicle_id']);
    await queryInterface.addIndex('vehicle_logs', ['instructor_id']);

    // 2. Reports - filtered by student
    await queryInterface.addIndex('reports', ['student_id']);

    // 3. Student exams and history - heavily used in ProgressModel
    await queryInterface.addIndex('student_exams', ['student_id']);
    await queryInterface.addIndex('student_exams', ['exam_id']);
    await queryInterface.addIndex('student_exams', ['completed_at']);
    await queryInterface.addIndex('student_exam_history', ['student_id']);
    await queryInterface.addIndex('student_exam_history', ['exam_id']);

    // 4. Exam timeframe - filtered by exam
    await queryInterface.addIndex('exam_timeframe', ['exam_id']);

    // 5. Payments - missing package_id index
    await queryInterface.addIndex('payments', ['package_id']);

    // 6. Instructors - missing specialization and certification indexes
    await queryInterface.addIndex('instructors', ['specialization_id']);
    await queryInterface.addIndex('instructors', ['certification_id']);

    // 7. Students - missing package_id and created_at (used for sorting)
    await queryInterface.addIndex('students', ['package_id']);
    await queryInterface.addIndex('students', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('vehicle_issues', ['vehicle_id']);
    await queryInterface.removeIndex('vehicle_issues', ['instructor_id']);
    await queryInterface.removeIndex('vehicle_logs', ['vehicle_id']);
    await queryInterface.removeIndex('vehicle_logs', ['instructor_id']);
    await queryInterface.removeIndex('reports', ['student_id']);
    await queryInterface.removeIndex('student_exams', ['student_id']);
    await queryInterface.removeIndex('student_exams', ['exam_id']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('student_exam_history', ['student_id']);
    await queryInterface.removeIndex('student_exam_history', ['exam_id']);
    await queryInterface.removeIndex('exam_timeframe', ['exam_id']);
    await queryInterface.removeIndex('payments', ['package_id']);
    await queryInterface.removeIndex('instructors', ['specialization_id']);
    await queryInterface.removeIndex('instructors', ['certification_id']);
    await queryInterface.removeIndex('students', ['package_id']);
    await queryInterface.removeIndex('students', ['created_at']);
  }
};
