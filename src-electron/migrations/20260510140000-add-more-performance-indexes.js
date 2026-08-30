
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Composite index for payments: (type, payment_date)
    // Helps with queries like WHERE type='income' AND payment_date >= ?
    await queryInterface.addIndex('payments', ['type', 'payment_date'], {
        name: 'payments_type_date_idx'
    });

    // Composite index for student_exams: (student_id, completed_at)
    // Helps with student progress and monthly performance charts
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at'], {
        name: 'student_exams_student_date_idx'
    });

    // Composite index for lessons: (instructor_id, start_time)
    // Helps with "lessons today" and "upcoming lessons" for instructors
    // Replacing the single instructor_id index with a more efficient composite one
    await queryInterface.addIndex('lessons', ['instructor_id', 'start_time'], {
        name: 'lessons_instructor_time_idx'
    });

    // Index on exams.start_time for "exams today"
    await queryInterface.addIndex('exams', ['start_time'], {
        name: 'exams_start_time_idx'
    });

    // Index on questions.answer for performance (hypothetical, but common)
    await queryInterface.addIndex('questions', ['answer'], {
        name: 'questions_answer_idx'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('payments', 'payments_type_date_idx');
    await queryInterface.removeIndex('student_exams', 'student_exams_student_date_idx');
    await queryInterface.removeIndex('lessons', 'lessons_instructor_time_idx');
    await queryInterface.removeIndex('exams', 'exams_start_time_idx');
    await queryInterface.removeIndex('questions', 'questions_answer_idx');
  }
};
