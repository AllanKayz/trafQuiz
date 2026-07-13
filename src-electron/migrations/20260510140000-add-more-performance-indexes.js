module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - frequently filtered by date and type for financial stats
    await queryInterface.addIndex('payments', ['payment_date'], {
        name: 'payments_date_idx'
    });
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
        name: 'payments_type_date_idx'
    });

    // 2. Exams - daily dashboard count
    await queryInterface.addIndex('exams', ['start_time'], {
        name: 'exams_start_time_idx'
    });

    // 3. Student Exams - optimized for pass rate calculations
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
        name: 'student_exams_student_date_idx'
    });

    // 4. Lessons - composite index for instructor dashboard
    // Note: Replacing single instructor_id index with composite for better performance
    await queryInterface.removeIndex('lessons', ['instructor_id']);
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
        name: 'lessons_instructor_time_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', 'payments_date_idx');
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('exams', 'exams_start_time_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
    await queryInterface.addIndex('lessons', ['instructor_id']);
  }
};
