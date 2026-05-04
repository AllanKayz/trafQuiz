
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. student_exams - composite index for performance reports and dashboard
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);

    // 2. payments - composite index for financial stats and dashboard revenue
    await queryInterface.addIndex('payments', ['payment_date', 'type', 'status']);

    // 3. exams - index for today's exams count
    await queryInterface.addIndex('exams', ['start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('payments', ['payment_date', 'type', 'status']);
    await queryInterface.removeIndex('exams', ['start_time']);
  }
};
