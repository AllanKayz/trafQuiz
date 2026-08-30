
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Exams - frequently filtered by start_time for dashboard stats
    await queryInterface.addIndex('exams', ['start_time']);

    // 2. Payments - optimize monthly aggregation and type filtering
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
        name: 'payments_type_date_idx'
    });

    // 3. Student Exams - optimize student-specific progress and global pass rate
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
        name: 'student_exams_student_date_idx'
    });

    // 4. Lessons - composite index for instructor dashboard (equality filter before range)
    // First remove the single column index if it might conflict or be redundant
    try {
        await queryInterface.removeIndex('lessons', ['instructor_id']);
    } catch (e) {
        // Index might not exist or have different name
    }

    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
        name: 'lessons_instructor_time_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
    // Restore the single column index if needed
    await queryInterface.addIndex('lessons', ['instructor_id']);
  }
};
