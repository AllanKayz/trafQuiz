
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Composite index for payments to optimize dashboard and finance stats
    await queryInterface.addIndex('payments', ['type', 'payment_date']);
    await queryInterface.addIndex('payments', ['payment_date']);

    // Composite index for student_exams to optimize progress charts
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.addIndex('student_exams', ['completed_at']);

    // Index for exams to optimize "exams today" query
    await queryInterface.addIndex('exams', ['start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', ['type', 'payment_date']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('exams', ['start_time']);
  }
};
