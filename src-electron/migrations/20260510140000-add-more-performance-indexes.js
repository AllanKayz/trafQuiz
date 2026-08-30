
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Optimize range queries for lessons
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time']);

    // 2. Optimize range queries for payments (Admin Dashboard and Financial stats)
    await queryInterface.addIndex('payments', ['payment_date']);
    await queryInterface.addIndex('payments', ['type', 'payment_date']);

    // 3. Optimize range queries for exams
    await queryInterface.addIndex('exams', ['start_time']);

    // 4. Optimize time-series aggregation for student progress
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);

    // 5. Optimize student status filtering
    await queryInterface.addIndex('students', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('lessons', ['instructor_id', 'start_time']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('payments', ['type', 'payment_date']);
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('students', ['status']);
  }
};
