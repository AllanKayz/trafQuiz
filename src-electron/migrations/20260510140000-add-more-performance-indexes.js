
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Optimize daily exams count
    await queryInterface.addIndex('exams', ['start_time'], {
        name: 'exams_start_time_idx'
    });

    // 2. Optimize monthly revenue and financial stats
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
        name: 'payments_type_date_idx'
    });

    // Add separate index for payment_date for queries that don't filter by type
    await queryInterface.addIndex('payments', ['payment_date'], {
        name: 'payments_date_idx'
    });

    // 3. Optimize student progress and monthly performance
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
        name: 'student_exams_student_date_idx'
    });

    // 4. Upgrade lessons index to include start_time for daily counts
    await queryInterface.removeIndex('lessons', ['instructor_id']);
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
        name: 'lessons_instructor_time_idx'
    });

    // 5. Optimize questions search/filter
    await queryInterface.addIndex('questions', ['answer'], {
        name: 'questions_answer_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', 'exams_start_time_idx');
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('payments', 'payments_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
    await queryInterface.addIndex('lessons', ['instructor_id']);
    await queryInterface.removeIndex('questions', 'questions_answer_idx');
  }
};
