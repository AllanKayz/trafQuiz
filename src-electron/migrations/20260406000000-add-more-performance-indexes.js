
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Student Exams - frequently queried for stats and history
    // Added score to index for aggregate queries (pass rate)
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at', 'score']);

    // 2. Exams - filtered by start_time in dashboard
    await queryInterface.addIndex('exams', ['start_time']);

    // 3. Payments - filtered by payment_date in financial stats
    await queryInterface.addIndex('payments', ['payment_date']);

    // 4. Lessons - filtered by status and start_time
    await queryInterface.addIndex('lessons', ['status', 'start_time']);

    // 5. Students & Instructors - filtered by status in dashboard
    await queryInterface.addIndex('students', ['status']);
    await queryInterface.addIndex('instructors', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at', 'score']);
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('lessons', ['status', 'start_time']);
    await queryInterface.removeIndex('students', ['status']);
    await queryInterface.removeIndex('instructors', ['status']);
  }
};
