
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ⚡ Bolt Optimization: Add indexes on columns frequently used in WHERE and JOIN clauses

    // student_exams: student_id and completed_at are heavily used for progress reports and dashboard
    await queryInterface.addIndex('student_exams', ['student_id']);
    await queryInterface.addIndex('student_exams', ['completed_at']);

    // payments: payment_date, type, and status are used for financial stats and dashboard revenue
    await queryInterface.addIndex('payments', ['payment_date']);
    await queryInterface.addIndex('payments', ['type']);
    await queryInterface.addIndex('payments', ['status']);

    // exams: start_time is used for counting exams "today"
    await queryInterface.addIndex('exams', ['start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('student_exams', ['student_id']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('payments', ['type']);
    await queryInterface.removeIndex('payments', ['status']);
    await queryInterface.removeIndex('exams', ['start_time']);
  }
};
