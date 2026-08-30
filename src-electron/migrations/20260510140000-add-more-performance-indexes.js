
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - index for range queries and composite index for dashboard/finance charts
    await queryInterface.addIndex('payments', ['payment_date']);
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
        name: 'payments_type_date_idx'
    });

    // 2. Student Exams - index for completed_at for pass rate and progress queries
    await queryInterface.addIndex('student_exams', ['completed_at']);
    // Composite index for student-specific progress queries
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
        name: 'student_exams_student_date_idx'
    });

    // 3. Exams - index for start_time for "exams today" query
    await queryInterface.addIndex('exams', ['start_time']);

    // 4. Lessons - optimized composite index for instructor dashboard
    // Dropping the single instructor_id index first to replace it with a better composite one
    await queryInterface.removeIndex('lessons', ['instructor_id']);
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
        name: 'lessons_instructor_time_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
    // Restore the original index from the previous migration
    await queryInterface.addIndex('lessons', ['instructor_id']);
  }
};
