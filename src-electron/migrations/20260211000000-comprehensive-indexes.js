
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - index payment_date for revenue queries
    await queryInterface.addIndex('payments', ['payment_date']);

    // 2. Exams - index start_time for dashboard 'Exams Today'
    await queryInterface.addIndex('exams', ['start_time']);

    // 3. Student Exams - index completed_at and score for pass rate analytics
    await queryInterface.addIndex('student_exams', ['completed_at']);
    await queryInterface.addIndex('student_exams', ['score']);

    // 4. Lessons - index status for quick filtering
    await queryInterface.addIndex('lessons', ['status']);

    // 5. Students & Instructors - index status and created_at for filtering and sorting
    await queryInterface.addIndex('students', ['status']);
    await queryInterface.addIndex('students', ['created_at']);
    await queryInterface.addIndex('instructors', ['status']);
    await queryInterface.addIndex('instructors', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('student_exams', ['score']);
    await queryInterface.removeIndex('lessons', ['status']);
    await queryInterface.removeIndex('students', ['status']);
    await queryInterface.removeIndex('students', ['created_at']);
    await queryInterface.removeIndex('instructors', ['status']);
    await queryInterface.removeIndex('instructors', ['created_at']);
  }
};
