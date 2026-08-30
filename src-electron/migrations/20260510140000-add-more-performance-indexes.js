
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Payments - index for range queries on payment_date and filtering by type
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
        name: 'payments_type_date_idx'
    });

    // Add separate index for payment_date for queries not filtering by type
    await queryInterface.addIndex('payments', ['payment_date'], {
        name: 'payments_date_idx'
    });

    // 2. Student Exams - index for range queries on completed_at and student filtering
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
        name: 'student_exams_student_date_idx'
    });

    // 3. Exams - index for range queries on start_time
    await queryInterface.addIndex('exams', ['start_time'], {
        name: 'exams_start_time_idx'
    });

    // 4. Lessons - improve instructor lesson count and upcoming lessons
    // Existing lessons_instructor_id index exists, but composite helps for range
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
        name: 'lessons_instructor_time_idx'
    });

    // 5. Questions - improve answer count
    await queryInterface.addIndex('questions', ['answer'], {
        name: 'questions_answer_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('payments', 'payments_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('exams', 'exams_start_time_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
    await queryInterface.removeIndex('questions', 'questions_answer_idx');
  }
};
