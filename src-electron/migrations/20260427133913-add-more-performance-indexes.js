
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Composite index for student progress and performance reports
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);

    // Composite index for optimized financial queries and dashboard stats
    await queryInterface.addIndex('payments', ['payment_date', 'type', 'status']);

    // Single-column index for dashboard 'exams today' and upcoming exams
    await queryInterface.addIndex('exams', ['start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('payments', ['payment_date', 'type', 'status']);
    await queryInterface.removeIndex('exams', ['start_time']);
  }
};
