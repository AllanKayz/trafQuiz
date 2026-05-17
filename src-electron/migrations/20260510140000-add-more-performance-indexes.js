
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - optimize financial stats and range queries
    await queryInterface.addIndex('payments', ['payment_date']);
    // Composite index for common filtering in financial reports
    await queryInterface.addIndex('payments', ['type', 'status', 'payment_date'], {
        name: 'payments_type_status_date_idx'
    });

    // 2. Student Exams - optimize student progress and performance tracking
    await queryInterface.addIndex('student_exams', ['exam_id']);
    // Composite index for time-series aggregation per student
    // Note: This also optimizes queries filtering only by student_id
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
        name: 'student_exams_student_completed_idx'
    });

    // 3. Exams - optimize dashboard "exams today" query
    await queryInterface.addIndex('exams', ['start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('payments', 'payments_type_status_date_idx');
    await queryInterface.removeIndex('student_exams', ['exam_id']);
    await queryInterface.removeIndex('student_exams', 'student_exams_student_completed_idx');
    await queryInterface.removeIndex('exams', ['start_time']);
  }
};
