
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - index for date filtering (finances and dashboard)
    await queryInterface.addIndex('payments', ['payment_date']);

    // 2. Student Exams - indexes for progress tracking and stats
    await queryInterface.addIndex('student_exams', ['student_id']);
    await queryInterface.addIndex('student_exams', ['completed_at']);
    await queryInterface.addIndex('student_exams', ['score']);

    // 3. Lessons - index for status filtering
    await queryInterface.addIndex('lessons', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('student_exams', ['student_id']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('student_exams', ['score']);
    await queryInterface.removeIndex('lessons', ['status']);
  }
};
