
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Student Exams - frequently filtered by student and sorted by date
    await queryInterface.addIndex('student_exams', ['student_id']);
    await queryInterface.addIndex('student_exams', ['completed_at']);
    await queryInterface.addIndex('student_exams', ['score']);

    // 2. Exams - filtered by date
    await queryInterface.addIndex('exams', ['start_time']);

    // 3. Payments - filtered by date
    await queryInterface.addIndex('payments', ['payment_date']);

    // 4. Lessons - filtered by status
    await queryInterface.addIndex('lessons', ['status']);

    // 5. Students - filtered by status
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
