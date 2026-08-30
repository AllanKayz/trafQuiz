module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Composite index for student progress queries
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);

    // Composite index for dashboard and financial stats
    await queryInterface.addIndex('payments', ['payment_date', 'type', 'status']);

    // Composite index for instructor schedule and lessons
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time']);

    // Index for exam dashboard stats
    await queryInterface.addIndex('exams', ['start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('payments', ['payment_date', 'type', 'status']);
    await queryInterface.removeIndex('lessons', ['instructor_id', 'start_time']);
    await queryInterface.removeIndex('exams', ['start_time']);
  }
};
