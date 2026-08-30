
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. student_exams - composite index for student progress and dashboard queries
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
        name: 'student_exams_student_completed_idx'
    });

    // 2. payments - composite index for financial stats (revenue, expenses)
    await queryInterface.addIndex('payments', ['payment_date', 'type', 'status'], {
        name: 'payments_date_type_status_idx'
    });

    // 3. exams - index for today's exams stats
    await queryInterface.addIndex('exams', ['start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('student_exams', 'student_exams_student_completed_idx');
    await queryInterface.removeIndex('payments', 'payments_date_type_status_idx');
    await queryInterface.removeIndex('exams', ['start_time']);
  }
};
