
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Exams - frequently filtered by start_time
    await queryInterface.addIndex('exams', ['start_time']);

    // 2. Student Exams - composite index for student progress and stats
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
      name: 'student_exams_student_date_idx'
    });

    // 3. Payments - composite index for financial stats
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
      name: 'payments_type_date_idx'
    });

    // 4. Lessons - replace single instructor_id index with composite for better performance on daily/upcoming lessons
    // First remove the old one if it exists (it was added in 20260210000000-add-performance-indexes.js)
    try {
      await queryInterface.removeIndex('lessons', ['instructor_id']);
    } catch (e) {
      console.log('Index lessons_instructor_id not found, skipping removal');
    }

    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
      name: 'lessons_instructor_time_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');

    // Restore the single index
    await queryInterface.addIndex('lessons', ['instructor_id']);
  }
};
