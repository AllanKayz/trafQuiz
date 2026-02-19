
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Index for financial reports
    await queryInterface.addIndex('payments', ['payment_date'], {
      name: 'payments_payment_date_idx'
    });

    // Index for student progress and exam analytics
    await queryInterface.addIndex('student_exams', ['completed_at'], {
      name: 'student_exams_completed_at_idx'
    });

    // Index for dashboard 'exams today' and scheduling
    await queryInterface.addIndex('exams', ['start_time'], {
      name: 'exams_start_time_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', 'payments_payment_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_completed_at_idx');
    await queryInterface.removeIndex('exams', 'exams_start_time_idx');
  }
};
