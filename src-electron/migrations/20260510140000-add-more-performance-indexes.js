
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Composite index for common financial queries (type + date)
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
      name: 'payments_type_date_idx'
    });

    // Index for general date-based filtering on payments
    await queryInterface.addIndex('payments', ['payment_date'], {
      name: 'payments_date_idx'
    });

    // Index for daily exam counts and upcoming exams
    await queryInterface.addIndex('exams', ['start_time'], {
      name: 'exams_start_time_idx'
    });

    // Composite index for student progress and performance over time
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
      name: 'student_exams_student_date_idx'
    });

    // General index for student exam completion date
    await queryInterface.addIndex('student_exams', ['completed_at'], {
      name: 'student_exams_date_idx'
    });

    // Index for question status queries (e.g., reviewed count)
    await queryInterface.addIndex('questions', ['answer'], {
      name: 'questions_answer_idx'
    });

    // Optimization: Replace single column index with composite for instructor scheduling
    try {
      await queryInterface.removeIndex('lessons', 'lessons_instructor_id');
    } catch (e) {
      // Ignore if index doesn't exist under this name
    }

    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
      name: 'lessons_instructor_time_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('payments', 'payments_date_idx');
    await queryInterface.removeIndex('exams', 'exams_start_time_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_date_idx');
    await queryInterface.removeIndex('questions', 'questions_answer_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
    await queryInterface.addIndex('lessons', ['instructor_id'], {
      name: 'lessons_instructor_id'
    });
  }
};
