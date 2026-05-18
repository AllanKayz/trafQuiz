
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Exams - frequently filtered by start_time
    await queryInterface.addIndex('exams', ['start_time']);

    // 2. Student Exams - optimized for student progress and monthly stats
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);

    // 3. Payments - optimized for financial reporting and dashboard stats
    // We use a composite index including type and status for efficient filtering before the date range
    await queryInterface.addIndex('payments', ['type', 'status', 'payment_date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('payments', ['type', 'status', 'payment_date']);
  }
};
