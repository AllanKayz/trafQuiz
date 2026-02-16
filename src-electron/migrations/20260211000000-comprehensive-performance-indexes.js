
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Exams - frequently filtered by start_time in dashboard
    await queryInterface.addIndex('exams', ['start_time']);

    // 2. Payments - frequently filtered by payment_date for revenue reports
    await queryInterface.addIndex('payments', ['payment_date']);

    // 3. Student Exams - filtered by score (pass rate) and student_id (student stats)
    await queryInterface.addIndex('student_exams', ['score']);
    await queryInterface.addIndex('student_exams', ['student_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('student_exams', ['score']);
    await queryInterface.removeIndex('student_exams', ['student_id']);
  }
};
