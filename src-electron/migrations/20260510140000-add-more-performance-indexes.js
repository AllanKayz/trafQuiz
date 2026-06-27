
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Composite indexes for SARGable range queries

    // 1. Exams - optimized for daily counts
    await queryInterface.addIndex('exams', ['start_time']);

    // 2. Payments - optimized for income/expense aggregation by date
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
      name: 'payments_type_date_idx'
    });

    // 3. Lessons - optimized for instructor-specific daily views
    // Replace the single instructor_id index with a composite one if helpful,
    // but here we add a new one to support range filters on start_time.
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
      name: 'lessons_instructor_time_idx'
    });

    // 4. Student Exams - optimized for progress tracking and pass rate calculation
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
      name: 'student_exams_student_date_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
  }
};
