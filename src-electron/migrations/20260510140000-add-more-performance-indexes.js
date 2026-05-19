
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Exams - frequently filtered by date for dashboard
    await queryInterface.addIndex('exams', ['start_time']);

    // 2. Student Exams - progress tracking and pass rates
    await queryInterface.addIndex('student_exams', ['student_id']);
    await queryInterface.addIndex('student_exams', ['completed_at']);
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at']);

    // 3. Payments - financial reports and revenue calculation
    await queryInterface.addIndex('payments', ['payment_date']);
    // Composite index for efficient filtering by type and status then range on date
    await queryInterface.addIndex('payments', ['type', 'status', 'payment_date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('student_exams', ['student_id']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('student_exams', ['student_id', 'completed_at']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('payments', ['type', 'status', 'payment_date']);
  }
};
