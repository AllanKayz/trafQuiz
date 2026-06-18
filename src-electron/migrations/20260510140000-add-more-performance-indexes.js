module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Optimized composite index for payments
    // Putting 'type' first because it's usually an equality filter, followed by range filter on date
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
      name: 'payments_type_date_idx'
    });

    // 2. Optimized composite index for student_exams
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
      name: 'student_exams_student_date_idx'
    });

    // 3. Optimized composite index for lessons
    // Replaces the single instructor_id index with one that covers time ranges too
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
      name: 'lessons_instructor_time_idx'
    });

    // 4. Index for exams start_time to optimize dashboard daily counts
    await queryInterface.addIndex('exams', ['start_time'], {
      name: 'exams_start_time_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
    await queryInterface.removeIndex('exams', 'exams_start_time_idx');
  }
};
