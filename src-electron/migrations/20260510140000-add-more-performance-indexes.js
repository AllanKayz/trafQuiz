
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Optimization for Lessons dashboard stats (Instructor)
    // Replace single instructor_id index with composite index including start_time for SARGability
    await queryInterface.removeIndex('lessons', ['instructor_id']);
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
        name: 'lessons_instructor_time_idx'
    });

    // Optimization for Exams today count (Admin)
    await queryInterface.addIndex('exams', ['start_time']);

    // Optimization for Financial stats and monthly revenue (Admin)
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
        name: 'payments_type_date_idx'
    });

    // Optimization for Student monthly performance and pass rates
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
        name: 'student_exams_student_date_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
    await queryInterface.addIndex('lessons', ['instructor_id']);

    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
  }
};
