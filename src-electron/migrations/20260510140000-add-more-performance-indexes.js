
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Exams - optimize daily count
    await queryInterface.addIndex('exams', ['start_time']);

    // 2. Payments - optimize filtered sums and monthly charts
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
      name: 'payments_type_date_idx'
    });

    // 3. Student Exams - optimize student-specific stats and progress
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
      name: 'student_exams_student_date_idx'
    });

    // 4. Lessons - optimize instructor daily/upcoming views
    // Replacing/augmenting instructor_id index with a composite one for time-based filtering
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
