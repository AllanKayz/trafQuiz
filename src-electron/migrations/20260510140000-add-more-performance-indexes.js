
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Composite index for payments optimization (used in dashboard and financial stats)
    // Ordered by 'type' (equality) then 'payment_date' (range)
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
      name: 'payments_type_date_idx'
    });

    // Composite index for student_exams optimization (used in progress model)
    // Ordered by 'student_id' (equality) then 'completed_at' (range)
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
      name: 'student_exams_student_date_idx'
    });

    // Composite index for lessons optimization (used in dashboard)
    // Ordered by 'instructor_id' (equality) then 'start_time' (range)
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
      name: 'lessons_instructor_time_idx'
    });

    // Index on exams start_time for dashboard "exams today" query
    await queryInterface.addIndex('exams', ['start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
    await queryInterface.removeIndex('exams', ['start_time']);
  }
};
