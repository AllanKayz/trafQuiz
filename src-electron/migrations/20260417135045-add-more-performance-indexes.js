
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - frequently filtered by date, type and status
    await queryInterface.addIndex('payments', ['payment_date']);
    await queryInterface.addIndex('payments', ['type']);
    await queryInterface.addIndex('payments', ['status']);

    // 2. Student Exams - progress and dashboard metrics
    await queryInterface.addIndex('student_exams', ['student_id']);
    await queryInterface.addIndex('student_exams', ['completed_at']);

    // 3. Exams - filtered by start_time for 'exams today'
    await queryInterface.addIndex('exams', ['start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('payments', ['type']);
    await queryInterface.removeIndex('payments', ['status']);
    await queryInterface.removeIndex('student_exams', ['student_id']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('exams', ['start_time']);
  }
};
