
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - Composite index for dashboard and financial stats
    // Order: type/status (equality) first, then payment_date (range)
    await queryInterface.addIndex('payments', ['type', 'status', 'payment_date'], {
        name: 'payments_type_status_date_idx'
    });

    // 2. Student Exams - Composite index for progress tracking
    // Order: student_id (equality) first, then completed_at (range)
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
        name: 'student_exams_student_date_idx'
    });

    // 3. Exams - start_time index for dashboard
    await queryInterface.addIndex('exams', ['start_time'], {
        name: 'exams_start_time_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', 'payments_type_status_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('exams', 'exams_start_time_idx');
  }
};
