
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - composite index for type and date range queries
    // Placing 'type' first because it's usually an equality filter
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
      name: 'payments_type_date_idx'
    });

    // Add single index on payment_date for general range queries (e.g. finance charts)
    await queryInterface.addIndex('payments', ['payment_date'], {
      name: 'payments_date_idx'
    });

    // 2. Student Exams - composite index for student and completion date
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
      name: 'student_exams_student_date_idx'
    });

    // Add single index on completed_at for general range queries if not present
    await queryInterface.addIndex('student_exams', ['completed_at'], {
        name: 'student_exams_date_idx'
    });

    // 3. Lessons - composite index for instructor and start time
    // Replacing single column index with a more powerful composite one
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
      name: 'lessons_instructor_time_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_date_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
  }
};
