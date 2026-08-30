
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - optimized for revenue and chart queries
    await queryInterface.addIndex('payments', ['payment_date']);
    await queryInterface.addIndex('payments', ['type', 'payment_date']);

    // 2. Student Exams - optimized for progress tracking and statistics
    await queryInterface.addIndex('student_exams', ['completed_at']);
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);

    // 3. Exams - optimized for "today's exams" dashboard widget
    await queryInterface.addIndex('exams', ['start_time']);

    // 4. Lessons - composite index for instructor dashboard "lessons today"
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('payments', ['type', 'payment_date']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('lessons', ['instructor_id', 'start_time']);
  }
};
