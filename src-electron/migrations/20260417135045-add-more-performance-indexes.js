
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. student_exams - filter by student and date
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.addIndex('student_exams', ['completed_at']);

    // 2. payments - range queries by date and filter by type/status
    await queryInterface.addIndex('payments', ['payment_date']);
    await queryInterface.addIndex('payments', ['type', 'status', 'payment_date']);

    // 3. exams - filter by start_time (dashboard stats)
    await queryInterface.addIndex('exams', ['start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('payments', ['type', 'status', 'payment_date']);
    await queryInterface.removeIndex('exams', ['start_time']);
  }
};
