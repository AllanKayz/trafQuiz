
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add missing indexes identified during performance optimization

    // 1. Exams - frequently filtered by start_time (dashboard)
    await queryInterface.addIndex('exams', ['start_time']);

    // 2. Payments - frequently filtered by payment_date (dashboard, finances)
    await queryInterface.addIndex('payments', ['payment_date']);

    // 3. Composite index for instructor dashboard (lessons today)
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time']);

    // 4. Student Exams - composite index for progress and pass rate
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);

    // 5. Composite index for monthly revenue (finances)
    await queryInterface.addIndex('payments', ['type', 'payment_date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('lessons', ['instructor_id', 'start_time']);
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('payments', ['type', 'payment_date']);
  }
};
