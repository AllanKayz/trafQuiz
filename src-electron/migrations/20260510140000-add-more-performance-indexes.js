
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Single column indexes for basic range queries
    await queryInterface.addIndex('payments', ['payment_date']);
    await queryInterface.addIndex('student_exams', ['completed_at']);
    await queryInterface.addIndex('exams', ['start_time']);

    // Composite indexes for specific IPC handler query patterns
    // Instructor Dashboard: Filter by instructor, then range on start_time
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time']);

    // Admin Dashboard / Finances: Filter by type, then range on payment_date
    await queryInterface.addIndex('payments', ['type', 'payment_date']);

    // Student Progress: Filter by student_id, then group/range on completed_at
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('lessons', ['instructor_id', 'start_time']);
    await queryInterface.removeIndex('payments', ['type', 'payment_date']);
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
  }
};
