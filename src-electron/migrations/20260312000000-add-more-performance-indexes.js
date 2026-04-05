
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // student_exams performance
    await queryInterface.addIndex('student_exams', ['student_id']);
    await queryInterface.addIndex('student_exams', ['completed_at']);
    await queryInterface.addIndex('student_exams', ['score']);

    // exams performance
    await queryInterface.addIndex('exams', ['start_time']);

    // payments performance
    await queryInterface.addIndex('payments', ['payment_date']);

    // lessons status performance
    await queryInterface.addIndex('lessons', ['status']);

    // students status performance
    await queryInterface.addIndex('students', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('student_exams', ['student_id']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('student_exams', ['score']);
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('lessons', ['status']);
    await queryInterface.removeIndex('students', ['status']);
  }
};
