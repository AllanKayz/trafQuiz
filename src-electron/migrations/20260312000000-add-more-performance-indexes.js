
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Student Exams - frequently queried by student and completed_at for progress
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at', 'score']);

    // 2. Exams - frequently queried by start_time (e.g. today's exams)
    await queryInterface.addIndex('exams', ['start_time']);

    // 3. Payments - frequently filtered by payment_date and type
    await queryInterface.addIndex('payments', ['payment_date']);

    // 4. Students - filtered by status in dashboard
    await queryInterface.addIndex('students', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at', 'score']);
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('students', ['status']);
  }
};
