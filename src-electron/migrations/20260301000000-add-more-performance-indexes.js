
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Student Exams - frequently filtered by student, exam and used for stats
    await queryInterface.addIndex('student_exams', ['student_id']);
    await queryInterface.addIndex('student_exams', ['exam_id']);
    await queryInterface.addIndex('student_exams', ['completed_at']);
    await queryInterface.addIndex('student_exams', ['score']);

    // Composite index for common progress queries
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);

    // 2. Lessons - additional filtering by status
    await queryInterface.addIndex('lessons', ['status']);

    // 3. Exams - filtered by start_time (used in dashboard)
    await queryInterface.addIndex('exams', ['start_time']);

    // 4. Payments - filtered by type and payment_date (used in finances and dashboard)
    await queryInterface.addIndex('payments', ['type']);
    await queryInterface.addIndex('payments', ['payment_date']);
    await queryInterface.addIndex('payments', ['type', 'payment_date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('student_exams', ['student_id']);
    await queryInterface.removeIndex('student_exams', ['exam_id']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('student_exams', ['score']);
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('lessons', ['status']);
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', ['type']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('payments', ['type', 'payment_date']);
  }
};
