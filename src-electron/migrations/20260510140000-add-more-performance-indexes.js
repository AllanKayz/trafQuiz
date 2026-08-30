
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - index for financial stats and dashboard revenue
    // Composite index for (type, payment_date) to support filtering by both
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
      name: 'payments_type_date_idx'
    });
    // Individual index for payment_date range queries
    await queryInterface.addIndex('payments', ['payment_date'], {
      name: 'payments_date_idx'
    });

    // 2. Student Exams - for progress tracking and pass rate
    // Composite index for (student_id, completed_at) for time-series progress
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
      name: 'student_exams_student_date_idx'
    });

    // 3. Exams - for daily dashboard counts
    await queryInterface.addIndex('exams', ['start_time'], {
      name: 'exams_start_time_idx'
    });

    // 4. Lessons - improve instructor daily dashboard query
    // Existing lessons_instructor_id_idx only covers instructor_id
    // Adding composite for (instructor_id, start_time)
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
      name: 'lessons_instructor_time_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('payments', 'payments_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('exams', 'exams_start_time_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
  }
};
