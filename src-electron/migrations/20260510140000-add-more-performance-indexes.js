
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Exams - frequently queried by date in dashboard
    await queryInterface.addIndex('exams', ['start_time']);

    // 2. Payments - optimize monthly revenue aggregation
    // Composite index: equality (type) followed by range (payment_date)
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
      name: 'payments_type_date_idx'
    });

    // 3. Student Exams - optimize student progress charts
    // Composite index: equality (student_id) followed by range (completed_at)
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
      name: 'student_exams_student_date_idx'
    });

    // 4. Lessons - optimize instructor dashboard today's count
    // Replace individual indexes with a better composite index
    await queryInterface.removeIndex('lessons', ['instructor_id']);
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
      name: 'lessons_instructor_time_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
    await queryInterface.addIndex('lessons', ['instructor_id']);
  }
};
