
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Optimized composite indexes for payments
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
      name: 'payments_type_date_idx'
    });
    await queryInterface.addIndex('payments', ['payment_date'], {
      name: 'payments_date_idx'
    });

    // Optimized composite indexes for student_exams
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
      name: 'student_exams_student_date_idx'
    });
    await queryInterface.addIndex('student_exams', ['completed_at'], {
      name: 'student_exams_date_idx'
    });

    // Optimized composite index for lessons
    // Replacing the single instructor_id index with a composite one for time-filtered queries
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
      name: 'lessons_instructor_time_idx'
    });

    // Index on exams.start_time for daily count
    await queryInterface.addIndex('exams', ['start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('payments', 'payments_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_date_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
    await queryInterface.removeIndex('exams', ['start_time']);
  }
};
