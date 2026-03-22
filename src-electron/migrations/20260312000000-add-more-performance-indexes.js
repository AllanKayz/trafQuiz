
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // student_exams - frequently queried by student, date, and score for performance stats
    await queryInterface.addIndex('student_exams', ['student_id']);
    await queryInterface.addIndex('student_exams', ['completed_at']);
    await queryInterface.addIndex('student_exams', ['score']);

    // exams - frequently filtered by start_time for daily stats
    await queryInterface.addIndex('exams', ['start_time']);

    // payments - frequently filtered by date for financial reports
    await queryInterface.addIndex('payments', ['payment_date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('student_exams', ['student_id']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('student_exams', ['score']);
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', ['payment_date']);
  }
};
