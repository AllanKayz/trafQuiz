
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. student_exams - for dashboard pass rate and student exam stats
    await queryInterface.addIndex('student_exams', ['student_id']);
    await queryInterface.addIndex('student_exams', ['completed_at']);

    // 2. payments - for financial stats and dashboard revenue
    await queryInterface.addIndex('payments', ['payment_date']);
    await queryInterface.addIndex('payments', ['type']);
    await queryInterface.addIndex('payments', ['status']);

    // 3. exams - for dashboard exams today
    await queryInterface.addIndex('exams', ['start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('student_exams', ['student_id']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('payments', ['type']);
    await queryInterface.removeIndex('payments', ['status']);
    await queryInterface.removeIndex('exams', ['start_time']);
  }
};
