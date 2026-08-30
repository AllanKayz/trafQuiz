
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - index for type and date for efficient revenue/expense calculation
    // Composite index: (type, payment_date) allows filtering by type and then range on date
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
      name: 'payments_type_date_idx'
    });

    // Also a dedicated date index for queries that don't filter by type
    await queryInterface.addIndex('payments', ['payment_date'], {
      name: 'payments_date_idx'
    });

    // 2. Student Exams - index for student and date for progress tracking
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
      name: 'student_exams_student_date_idx'
    });

    // 3. Exams - index for start_time for dashboard "exams today"
    await queryInterface.addIndex('exams', ['start_time'], {
      name: 'exams_start_time_idx'
    });

    // 4. Lessons - improve the existing start_time index to include instructor_id for composite usage
    // We already have single column indexes from previous migration, but a composite one is better for the dashboard
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
      name: 'lessons_instructor_time_idx'
    });

    // 5. Questions - index for answer to support countReviewed()
    await queryInterface.addIndex('questions', ['answer'], {
      name: 'questions_answer_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('payments', 'payments_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('exams', 'exams_start_time_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
    await queryInterface.removeIndex('questions', 'questions_answer_idx');
  }
};
