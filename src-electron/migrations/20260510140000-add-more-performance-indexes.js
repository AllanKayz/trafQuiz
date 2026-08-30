
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Exams - frequently filtered by start_time for dashboard stats
    await queryInterface.addIndex('exams', ['start_time']);

    // 2. Payments - optimize dashboard revenue and financial charts
    // Composite index: equality filter (type) before range filter (payment_date)
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
        name: 'payments_type_date_idx'
    });

    // 3. Student Exams - optimize student progress and pass rate calculations
    // Composite index: equality filter (student_id) before range filter (completed_at)
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
        name: 'student_exams_student_date_idx'
    });

    // 4. Lessons - optimize instructor/student dashboard metrics
    // Composite index: equality filter (instructor_id) before range filter (start_time)
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
        name: 'lessons_instructor_time_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
  }
};
