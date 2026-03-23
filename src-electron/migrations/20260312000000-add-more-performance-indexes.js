
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Student Exams - frequently filtered by student and date
    await queryInterface.addIndex('student_exams', ['student_id']);
    await queryInterface.addIndex('student_exams', ['completed_at']);
    await queryInterface.addIndex('student_exams', ['score']);

    // 2. Exams - filtered by start_time for dashboard and lists
    await queryInterface.addIndex('exams', ['start_time']);

    // 3. Payments - additional index on payment_date for financial charts
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
