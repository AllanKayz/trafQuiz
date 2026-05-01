
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add indexes for columns frequently used in WHERE, JOIN, and ORDER BY clauses

    // student_exams: Optimized for get-student-progress and dashboard pass rate
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.addIndex('student_exams', ['completed_at']);

    // payments: Optimized for dashboard revenue and financial reports
    await queryInterface.addIndex('payments', ['payment_date', 'type', 'status']);

    // exams: Optimized for today's exams on dashboard
    await queryInterface.addIndex('exams', ['start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('payments', ['payment_date', 'type', 'status']);
    await queryInterface.removeIndex('exams', ['start_time']);
  }
};
