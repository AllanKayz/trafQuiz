
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Exams - optimize daily counts
    await queryInterface.addIndex('exams', ['start_time']);

    // 2. Student Exams - optimize student history and progress charts
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
      name: 'student_exams_student_date_idx'
    });

    // 3. Payments - optimize revenue and financial charts
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
      name: 'payments_type_date_idx'
    });

    // 4. Lessons - optimize instructor dashboard daily stats
    // We already have index on instructor_id, but composite is better for range queries on date
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
      name: 'lessons_instructor_time_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
  }
};
