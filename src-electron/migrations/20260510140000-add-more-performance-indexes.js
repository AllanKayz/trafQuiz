
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - range queries on payment_date
    await queryInterface.addIndex('payments', ['payment_date']);
    await queryInterface.addIndex('payments', ['type', 'payment_date']);

    // 2. Exams - range queries on start_time (dashboard)
    await queryInterface.addIndex('exams', ['start_time']);

    // 3. Student Exams - composite index for student progress reporting
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);

    // 4. Lessons - composite index for instructor dashboard (today's lessons)
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('payments', ['type', 'payment_date']);
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('lessons', ['instructor_id', 'start_time']);
  }
};
