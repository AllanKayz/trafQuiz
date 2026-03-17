
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Index for student performance queries
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at', 'score'], {
      name: 'student_exams_student_completed_score_idx'
    });

    // Index for exam scheduling queries
    await queryInterface.addIndex('exams', ['start_time'], {
      name: 'exams_start_time_idx'
    });

    // Index for financial reporting queries
    await queryInterface.addIndex('payments', ['payment_date'], {
      name: 'payments_payment_date_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('student_exams', 'student_exams_student_completed_score_idx');
    await queryInterface.removeIndex('exams', 'exams_start_time_idx');
    await queryInterface.removeIndex('payments', 'payments_payment_date_idx');
  }
};
