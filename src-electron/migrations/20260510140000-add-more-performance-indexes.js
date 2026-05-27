
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Composite indexes for SARGable queries
    // 1. Payments: type and date (for monthly revenue)
    await queryInterface.addIndex('payments', ['type', 'payment_date']);
    await queryInterface.addIndex('payments', ['payment_date']);

    // 2. Student Exams: student_id and date (for progress tracking)
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);

    // 3. Lessons: instructor and date (for dashboard)
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time']);

    // 4. Exams: start_time (for dashboard)
    await queryInterface.addIndex('exams', ['start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', ['type', 'payment_date']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('lessons', ['instructor_id', 'start_time']);
    await queryInterface.removeIndex('exams', ['start_time']);
  }
};
