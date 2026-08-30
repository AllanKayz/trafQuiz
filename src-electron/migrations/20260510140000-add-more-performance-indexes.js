
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - Optimized composite index for financial reporting
    // Equality filters (type) should come before range filters (payment_date)
    await queryInterface.addIndex('payments', ['type', 'payment_date']);
    await queryInterface.addIndex('payments', ['payment_date']);

    // 2. Student Exams - Composite index for student progress tracking
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);

    // 3. Exams - Index for dashboard "exams today" stats
    await queryInterface.addIndex('exams', ['start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', ['type', 'payment_date']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('exams', ['start_time']);
  }
};
