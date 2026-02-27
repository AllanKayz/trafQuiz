
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adding performance indexes for frequently queried/filtered columns

    // 1. Exams - filtered by start_time in dashboard
    await queryInterface.addIndex('exams', ['start_time']);

    // 2. Payments - filtered by payment_date and type for finances/dashboard
    await queryInterface.addIndex('payments', ['payment_date', 'type']);

    // 3. Student Exams - heavily used in progress and dashboard stats
    await queryInterface.addIndex('student_exams', ['student_id']);
    await queryInterface.addIndex('student_exams', ['exam_id']);
    await queryInterface.addIndex('student_exams', ['completed_at', 'score']);

    // 4. Lessons - status filtering for dashboard/calendar
    await queryInterface.addIndex('lessons', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', ['payment_date', 'type']);
    await queryInterface.removeIndex('student_exams', ['student_id']);
    await queryInterface.removeIndex('student_exams', ['exam_id']);
    await queryInterface.removeIndex('student_exams', ['completed_at', 'score']);
    await queryInterface.removeIndex('lessons', ['status']);
  }
};
