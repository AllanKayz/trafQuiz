
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Exams - frequently filtered by start_time for dashboard stats
    await queryInterface.addIndex('exams', ['start_time']);

    // 2. Payments - frequently filtered by payment_date and type for financial stats
    // Single index for payment_date
    await queryInterface.addIndex('payments', ['payment_date']);
    // Composite index for (type, payment_date) to optimize range queries with type filter
    await queryInterface.addIndex('payments', ['type', 'payment_date']);

    // 3. Student Exams - frequently filtered by student_id and completed_at for progress
    // Composite index for (student_id, completed_at)
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);

    // 4. Lessons - composite index for instructor lessons filtering by date
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('payments', ['type', 'payment_date']);
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('lessons', ['instructor_id', 'start_time']);
  }
};
