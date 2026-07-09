
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - support type filtering + date range queries
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
        name: 'payments_type_date_idx'
    });

    // Also add index on payment_date alone for general range queries if needed
    await queryInterface.addIndex('payments', ['payment_date'], {
        name: 'payments_date_idx'
    });

    // 2. Student Exams - support student_id + time series progress
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
        name: 'student_exams_student_date_idx'
    });

    // 3. Lessons - optimize instructor dashboard (today's lessons)
    // Replace the single instructor_id index with a composite one including start_time
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
        name: 'lessons_instructor_time_idx'
    });

    // 4. Exams - optimize daily count for admin dashboard
    await queryInterface.addIndex('exams', ['start_time'], {
        name: 'exams_start_time_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('payments', 'payments_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
    await queryInterface.removeIndex('exams', 'exams_start_time_idx');
  }
};
