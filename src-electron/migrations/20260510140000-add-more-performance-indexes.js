
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Composite index for lessons (instructor + time) for dashboard and calendar queries
    // First instructor_id (equality), then start_time (range)
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
      name: 'lessons_instructor_time_idx'
    });

    // Index for exams start_time (range/filtering)
    await queryInterface.addIndex('exams', ['start_time'], {
      name: 'exams_start_time_idx'
    });

    // Index for payments date
    await queryInterface.addIndex('payments', ['payment_date'], {
      name: 'payments_date_idx'
    });

    // Composite index for payments (type + date)
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
      name: 'payments_type_date_idx'
    });

    // Composite index for student_exams (student + date)
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
      name: 'student_exams_student_date_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
    await queryInterface.removeIndex('exams', 'exams_start_time_idx');
    await queryInterface.removeIndex('payments', 'payments_date_idx');
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
  }
};
