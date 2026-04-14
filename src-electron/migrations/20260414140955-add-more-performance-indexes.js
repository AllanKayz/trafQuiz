
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. student_exams - optimized for ProgressModel and Dashboard
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.addIndex('student_exams', ['completed_at']);

    // 2. payments - optimized for financial stats and dashboard revenue
    await queryInterface.addIndex('payments', ['payment_date', 'type']);
    await queryInterface.addIndex('payments', ['type', 'status']);

    // 3. exams - optimized for "exams today" dashboard metric
    await queryInterface.addIndex('exams', ['start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('payments', ['payment_date', 'type']);
    await queryInterface.removeIndex('payments', ['type', 'status']);
    await queryInterface.removeIndex('exams', ['start_time']);
  }
};
