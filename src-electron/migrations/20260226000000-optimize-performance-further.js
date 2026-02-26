
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - index for date range and type filtering
    await queryInterface.addIndex('payments', ['payment_date']);
    await queryInterface.addIndex('payments', ['type']);

    // 2. Student Exams - frequently filtered by student and joined with exams
    await queryInterface.addIndex('student_exams', ['student_id']);
    await queryInterface.addIndex('student_exams', ['exam_id']);
    await queryInterface.addIndex('student_exams', ['completed_at']);
    await queryInterface.addIndex('student_exams', ['score']);

    // 3. Exams - index for date filtering
    await queryInterface.addIndex('exams', ['start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('payments', ['type']);
    await queryInterface.removeIndex('student_exams', ['student_id']);
    await queryInterface.removeIndex('student_exams', ['exam_id']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('student_exams', ['score']);
    await queryInterface.removeIndex('exams', ['start_time']);
  }
};
