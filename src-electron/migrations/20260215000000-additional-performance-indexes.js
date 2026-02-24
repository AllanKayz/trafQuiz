
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Exams - frequently filtered by start_time
    await queryInterface.addIndex('exams', ['start_time']);

    // 2. Payments - frequently filtered by payment_date and type
    await queryInterface.addIndex('payments', ['payment_date']);
    await queryInterface.addIndex('payments', ['payment_date', 'type']);

    // 3. Student Exams - used for pass rate and history
    await queryInterface.addIndex('student_exams', ['score']);
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);

    // 4. Students - order by created_at in list views
    await queryInterface.addIndex('students', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('payments', ['payment_date', 'type']);
    await queryInterface.removeIndex('student_exams', ['score']);
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('students', ['created_at']);
  }
};
