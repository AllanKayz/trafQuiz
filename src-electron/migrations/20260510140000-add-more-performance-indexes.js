
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add index on exams.start_time for "exams today" queries
    await queryInterface.addIndex('exams', ['start_time']);

    // Add index on payments.payment_date for revenue queries
    await queryInterface.addIndex('payments', ['payment_date']);

    // Add index on student_exams.completed_at for progress/stats queries
    await queryInterface.addIndex('student_exams', ['completed_at']);

    // Optimized composite index for financial reports
    // Filter on type, then range on payment_date
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
        name: 'payments_type_date_idx'
    });

    // Optimized composite index for student progress tracking
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
        name: 'student_exams_student_date_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
  }
};
