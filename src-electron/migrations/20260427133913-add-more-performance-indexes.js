
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Student Exams - optimize progress and stats
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);

    // 2. Payments - optimize dashboard and financial stats
    await queryInterface.addIndex('payments', ['payment_date', 'type', 'status']);

    // 3. Exams - optimize schedule-related queries
    await queryInterface.addIndex('exams', ['start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('payments', ['payment_date', 'type', 'status']);
    await queryInterface.removeIndex('exams', ['start_time']);
  }
};
