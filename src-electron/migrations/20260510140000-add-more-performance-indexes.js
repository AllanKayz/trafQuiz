
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - optimize dashboard monthly revenue and financial stats
    // Place 'type' first for equality filter, then 'payment_date' for range
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
        name: 'payments_type_date_idx'
    });

    // Also add a standalone index on payment_date for queries that don't filter by type
    await queryInterface.addIndex('payments', ['payment_date'], {
        name: 'payments_date_idx'
    });

    // 2. Exams - optimize dashboard exams_today
    await queryInterface.addIndex('exams', ['start_time'], {
        name: 'exams_start_time_idx'
    });

    // 3. Student Exams - optimize student progress queries
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
        name: 'student_exams_student_date_idx'
    });

    // 4. Lessons - optimize dashboard and instructor queries
    // Combining instructor_id and start_time for range queries
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
        name: 'lessons_instructor_time_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('payments', 'payments_date_idx');
    await queryInterface.removeIndex('exams', 'exams_start_time_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
  }
};
