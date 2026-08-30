
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - Optimizing combined filters and range queries
    // Supporting WHERE type='income' AND payment_date BETWEEN ...
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
      name: 'payments_type_date_idx'
    });
    // Supporting general range queries on payment_date
    await queryInterface.addIndex('payments', ['payment_date'], {
      name: 'payments_date_idx'
    });

    // 2. Exams - Supporting range queries on start_time for daily counts
    await queryInterface.addIndex('exams', ['start_time'], {
      name: 'exams_start_time_idx'
    });

    // 3. Lessons - Composite index for instructor and time range
    await queryInterface.removeIndex('lessons', ['instructor_id']); // Replace single column index
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
      name: 'lessons_instructor_time_idx'
    });

    // 4. Student Exams - Composite index for student and completion date range
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
      name: 'student_exams_student_date_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('payments', 'payments_date_idx');
    await queryInterface.removeIndex('exams', 'exams_start_time_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
    await queryInterface.addIndex('lessons', ['instructor_id']);
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
  }
};
