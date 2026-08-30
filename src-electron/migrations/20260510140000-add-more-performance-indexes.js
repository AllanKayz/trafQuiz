
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add index on exams.start_time for daily exam count
    await queryInterface.addIndex('exams', ['start_time']);

    // Add composite index on student_exams for monthly performance reporting
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);

    // Add composite index on payments for monthly revenue reporting
    // Equality filters (type) should come before range filters (payment_date)
    await queryInterface.addIndex('payments', ['type', 'payment_date']);

    // Add composite index on lessons for instructor dashboard optimization
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('payments', ['type', 'payment_date']);
    await queryInterface.removeIndex('lessons', ['instructor_id', 'start_time']);
  }
};
