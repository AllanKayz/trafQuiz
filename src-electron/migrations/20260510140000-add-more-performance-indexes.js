
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - optimized composite index for type and payment_date range
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
      name: 'idx_payments_type_date'
    });

    // 2. Student Exams - optimized composite index for student and completion date
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
      name: 'idx_student_exams_student_date'
    });

    // 3. Exams - index for start_time range queries
    await queryInterface.addIndex('exams', ['start_time'], {
      name: 'idx_exams_start_time'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', 'idx_payments_type_date');
    await queryInterface.removeIndex('student_exams', 'idx_student_exams_student_date');
    await queryInterface.removeIndex('exams', 'idx_exams_start_time');
  }
};
