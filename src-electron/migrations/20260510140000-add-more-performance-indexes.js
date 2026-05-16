
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add index on payment_date for range queries
    await queryInterface.addIndex('payments', ['payment_date']);

    // Add composite index for financial reports/dashboard
    // (Equality filters status and type followed by range payment_date)
    await queryInterface.addIndex('payments', ['type', 'status', 'payment_date']);

    // Add composite index for student progress tracking
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);

    // Add index on exam start_time for daily dashboard stats
    await queryInterface.addIndex('exams', ['start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('payments', ['type', 'status', 'payment_date']);
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('exams', ['start_time']);
  }
};
