module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - range query on payment_date and composite with type
    await queryInterface.addIndex('payments', ['payment_date']);
    await queryInterface.addIndex('payments', ['type', 'payment_date']);

    // 2. Student Exams - range query on completed_at and composite with student_id
    await queryInterface.addIndex('student_exams', ['completed_at']);
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);

    // 3. Exams - range query on start_time
    await queryInterface.addIndex('exams', ['start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('payments', ['type', 'payment_date']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('exams', ['start_time']);
  }
};
