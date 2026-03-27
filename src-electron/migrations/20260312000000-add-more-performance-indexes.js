
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Student Exams - used for dashboard pass rate and student progress
    await queryInterface.addIndex('student_exams', ['student_id']);
    await queryInterface.addIndex('student_exams', ['completed_at']);
    await queryInterface.addIndex('student_exams', ['score']);

    // 2. Exams - used for dashboard exams today
    await queryInterface.addIndex('exams', ['start_time']);

    // 3. Payments - used for financial stats and dashboard revenue
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
