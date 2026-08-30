
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. student_exams - improve student progress and dashboard queries
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);

    // 2. payments - improve financial reporting and dashboard stats
    await queryInterface.addIndex('payments', ['payment_date', 'type', 'status']);

    // 3. exams - improve 'exams today' dashboard query
    await queryInterface.addIndex('exams', ['start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('payments', ['payment_date', 'type', 'status']);
    await queryInterface.removeIndex('exams', ['start_time']);
  }
};
