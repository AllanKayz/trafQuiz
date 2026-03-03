
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Exams - frequently filtered by start_time for 'exams today'
    await queryInterface.addIndex('exams', ['start_time']);

    // 2. Payments - frequently filtered by date and type for financial stats
    await queryInterface.addIndex('payments', ['payment_date', 'type']);

    // 3. Student Exams - frequently queried for student progress and pass rates
    await queryInterface.addIndex('student_exams', ['student_id']);
    await queryInterface.addIndex('student_exams', ['exam_id']);
    await queryInterface.addIndex('student_exams', ['completed_at']);
    await queryInterface.addIndex('student_exams', ['score']);

    // 4. Lessons - status-based filtering for dashboard
    await queryInterface.addIndex('lessons', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', ['payment_date', 'type']);
    await queryInterface.removeIndex('student_exams', ['student_id']);
    await queryInterface.removeIndex('student_exams', ['exam_id']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('student_exams', ['score']);
    await queryInterface.removeIndex('lessons', ['status']);
  }
};
