
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Exams - optimized for "exams today"
    await queryInterface.addIndex('exams', ['start_time'], {
      name: 'exams_start_time_idx'
    });

    // 2. Student Exams - optimized for progress tracking and "pass rate"
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
      name: 'student_exams_student_date_idx'
    });
    await queryInterface.addIndex('student_exams', ['completed_at'], {
      name: 'student_exams_date_idx'
    });

    // 3. Payments - optimized for financial stats and dashboard revenue
    await queryInterface.addIndex('payments', ['payment_date'], {
      name: 'payments_date_idx'
    });
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
      name: 'payments_type_date_idx'
    });

    // 4. Lessons - optimized for instructor "lessons today"
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
      name: 'lessons_instructor_time_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', 'exams_start_time_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_date_idx');
    await queryInterface.removeIndex('payments', 'payments_date_idx');
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
  }
};
