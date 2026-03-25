
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. student_exams - for progress reporting and dashboard stats
    await queryInterface.addIndex('student_exams', ['student_id']);
    await queryInterface.addIndex('student_exams', ['completed_at']);
    await queryInterface.addIndex('student_exams', ['score']);

    // 2. exams - for dashboard 'exams today' count
    await queryInterface.addIndex('exams', ['start_time']);

    // 3. payments - for dashboard monthly revenue and financial stats
    await queryInterface.addIndex('payments', ['payment_date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('student_exams', ['student_id']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('student_exams', ['score']);
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', ['payment_date']);
  }
};
