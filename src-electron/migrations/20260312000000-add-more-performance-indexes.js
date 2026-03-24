
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. student_exams - frequently filtered by student and sorted by date
    await queryInterface.addIndex('student_exams', ['student_id']);
    await queryInterface.addIndex('student_exams', ['completed_at']);
    await queryInterface.addIndex('student_exams', ['score']);

    // 2. exams - filtered by start_time for "exams today"
    await queryInterface.addIndex('exams', ['start_time']);

    // 3. payments - frequently filtered/sorted by payment_date
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
