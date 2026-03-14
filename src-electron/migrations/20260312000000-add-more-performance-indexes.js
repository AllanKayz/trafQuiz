
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Student Exams - optimized for progress reporting and pass rates
    await queryInterface.addIndex('student_exams', ['student_id', 'completed_at', 'score'], {
      name: 'idx_student_exams_stats'
    });

    // 2. Exams - optimized for dashboard 'exams today' filter
    await queryInterface.addIndex('exams', ['start_time'], {
      name: 'idx_exams_start_time'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('student_exams', 'idx_student_exams_stats');
    await queryInterface.removeIndex('exams', 'idx_exams_start_time');
  }
};
