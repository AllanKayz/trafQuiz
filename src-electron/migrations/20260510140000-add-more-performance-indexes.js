
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Exams - daily counts
    await queryInterface.addIndex('exams', ['start_time'], {
      name: 'exams_start_time_idx'
    });

    // Payments - date and type+date for revenue queries
    await queryInterface.addIndex('payments', ['payment_date'], {
      name: 'payments_date_idx'
    });
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
      name: 'payments_type_date_idx'
    });

    // Student Exams - progress and stats
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
      name: 'student_exams_student_date_idx'
    });
    await queryInterface.addIndex('student_exams', ['completed_at'], {
      name: 'student_exams_date_idx'
    });

    // Lessons - instructor dashboard optimization
    // We already have individual indexes, but a composite one is better for range queries by instructor
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
      name: 'lessons_instructor_time_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', 'exams_start_time_idx');
    await queryInterface.removeIndex('payments', 'payments_date_idx');
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_date_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
  }
};
