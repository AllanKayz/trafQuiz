
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Exams - frequently filtered by start_time for "today's exams"
    await queryInterface.addIndex('exams', ['start_time']);

    // 2. Payments - frequently filtered by payment_date for revenue stats
    // We use a composite index with 'type' first because it's often used in equality filters (type='income')
    await queryInterface.addIndex('payments', ['type', 'payment_date']);
    await queryInterface.addIndex('payments', ['payment_date']);

    // 3. Student Exams - frequently filtered by student_id and completed_at
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.addIndex('student_exams', ['completed_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', ['type', 'payment_date']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
  }
};
