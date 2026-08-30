
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Exams - frequently filtered by start_time for daily stats
    await queryInterface.addIndex('exams', ['start_time']);

    // 2. Student Exams - composite index for progress and dashboard stats
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);

    // 3. Payments - composite index for financial reports and monthly revenue stats
    // Optimized order for B-tree: equality filters (type, status) before range filters (payment_date)
    await queryInterface.addIndex('payments', ['type', 'status', 'payment_date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('payments', ['type', 'status', 'payment_date']);
  }
};
