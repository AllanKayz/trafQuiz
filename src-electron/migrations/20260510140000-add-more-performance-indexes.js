
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - index for range queries and composite index for dashboard/finances
    await queryInterface.addIndex('payments', ['payment_date']);
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
        name: 'payments_type_date_idx'
    });

    // 2. Exams - index for range queries (exams today)
    await queryInterface.addIndex('exams', ['start_time']);

    // 3. Student Exams - index for range queries and composite index for student progress
    await queryInterface.addIndex('student_exams', ['completed_at']);
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
        name: 'student_exams_student_date_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
  }
};
