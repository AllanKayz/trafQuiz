
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Exams - frequently filtered by start_time
    await queryInterface.addIndex('exams', ['start_time']);

    // 2. Student Exams - frequently filtered by completed_at or student_id + completed_at
    await queryInterface.addIndex('student_exams', ['completed_at']);
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
        name: 'student_exams_student_date_idx'
    });

    // 3. Payments - frequently filtered by payment_date or type + payment_date
    await queryInterface.addIndex('payments', ['payment_date']);
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
        name: 'payments_type_date_idx'
    });

    // 4. Lessons - optimized composite index for instructor dashboard
    // Replacing the single instructor_id index with a composite one is better for range filters on start_time
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
        name: 'lessons_instructor_time_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
  }
};
