
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Composite index for financial reporting and dashboard stats
    await queryInterface.addIndex('payments', ['payment_date', 'type', 'status'], {
      name: 'payments_reporting_idx'
    });

    // Composite index for student progress and performance charts
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
      name: 'student_exams_progress_idx'
    });

    // Index for today's exams filter in dashboard
    await queryInterface.addIndex('exams', ['start_time'], {
      name: 'exams_start_time_idx'
    });

    // Composite index for instructor lessons filter in dashboard
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
      name: 'lessons_instructor_start_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', 'payments_reporting_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_progress_idx');
    await queryInterface.removeIndex('exams', 'exams_start_time_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_start_idx');
  }
};
