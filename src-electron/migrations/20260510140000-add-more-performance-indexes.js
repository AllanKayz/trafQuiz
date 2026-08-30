
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Exams - optimize dashboard daily count
    await queryInterface.addIndex('exams', ['start_time']);

    // Payments - optimize dashboard revenue and financial reports
    await queryInterface.addIndex('payments', ['payment_date']);
    await queryInterface.addIndex('payments', ['type', 'payment_date']);

    // Student Exams - optimize student progress and pass rates
    await queryInterface.addIndex('student_exams', ['completed_at']);
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('payments', ['type', 'payment_date']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
  }
};
