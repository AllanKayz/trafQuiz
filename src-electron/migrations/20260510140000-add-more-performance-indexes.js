
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add indexes for dashboard and reporting performance

    // 1. Exams - for daily exam count
    await queryInterface.addIndex('exams', ['start_time']);

    // 2. Payments - for financial reports and dashboard revenue
    await queryInterface.addIndex('payments', ['payment_date']);
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
        name: 'payments_type_date_idx'
    });

    // 3. Student Exams - for progress tracking and stats
    // Adding student_id first as it is the primary filter in most cases
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
        name: 'student_exams_student_completed_idx'
    });
    await queryInterface.addIndex('student_exams', ['completed_at']);

    // 4. Lessons - composite index for instructor dashboard
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
        name: 'lessons_instructor_start_time_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_completed_idx');
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('lessons', 'lessons_instructor_start_time_idx');
  }
};
