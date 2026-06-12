
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Exams - frequently filtered by date in dashboard
    await queryInterface.addIndex('exams', ['start_time']);

    // 2. Payments - date-based filtering and reporting
    await queryInterface.addIndex('payments', ['payment_date']);
    // Composite index for common revenue/expense filtering
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
      name: 'payments_type_date_idx'
    });

    // 3. Student Exams - composite index for student progress and pass rate
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
      name: 'student_exams_student_date_idx'
    });

    // 4. Lessons - composite index for instructor daily stats
    // We replace the single instructor_id index if needed, but adding a composite is better
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
      name: 'lessons_instructor_time_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
  }
};
