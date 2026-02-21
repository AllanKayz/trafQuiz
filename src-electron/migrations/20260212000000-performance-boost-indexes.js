
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. student_exams - frequently filtered by student and sorted by date
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.addIndex('student_exams', ['exam_id']);

    // 2. payments - optimized for dashboard revenue and finance chart range queries
    await queryInterface.addIndex('payments', ['payment_date', 'type']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('student_exams', ['exam_id']);
    await queryInterface.removeIndex('payments', ['payment_date', 'type']);
  }
};
