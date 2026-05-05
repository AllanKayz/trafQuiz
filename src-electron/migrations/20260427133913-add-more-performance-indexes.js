
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - optimize dashboard revenue and financial reports
    await queryInterface.addIndex('payments', ['payment_date', 'type', 'status']);

    // 2. Exams - optimize "exams today" count and upcoming exams
    await queryInterface.addIndex('exams', ['start_time']);

    // 3. Student Exams - optimize progress reports and pass rate calculations
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', ['payment_date', 'type', 'status']);
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
  }
};
