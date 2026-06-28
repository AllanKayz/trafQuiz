
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - optimize monthly revenue and financial stats
    // Composite index on (type, payment_date) for SARGable range queries
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
      name: 'payments_type_date_idx'
    });

    // 2. Exams - optimize today's exam count on dashboard
    await queryInterface.addIndex('exams', ['start_time'], {
      name: 'exams_start_time_idx'
    });

    // 3. Lessons - optimize instructor dashboard lessons count and upcoming list
    // Replaces single index with more efficient composite index for equality+range filters
    await queryInterface.removeIndex('lessons', 'lessons_instructor_id');
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
      name: 'lessons_instructor_time_idx'
    });

    // 4. Questions - optimize "reviewed" questions count
    await queryInterface.addIndex('questions', ['answer'], {
      name: 'questions_answer_idx'
    });

    // 5. Student Exams - optimize pass rate calculation and progress tracking
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
      name: 'student_exams_student_date_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('exams', 'exams_start_time_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
    await queryInterface.addIndex('lessons', ['instructor_id'], {
      name: 'lessons_instructor_id'
    });
    await queryInterface.removeIndex('questions', 'questions_answer_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
  }
};
