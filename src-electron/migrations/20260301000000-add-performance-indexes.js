
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Student Exams - frequently filtered by student, exam and completed_at
    await queryInterface.addIndex('student_exams', ['student_id', 'exam_id']);
    await queryInterface.addIndex('student_exams', ['completed_at']);
    await queryInterface.addIndex('student_exams', ['score']);

    // 2. Payments - index on payment_date for range queries and type for filtering
    await queryInterface.addIndex('payments', ['payment_date', 'type']);

    // 3. Lessons - index on status for filtering in student/instructor dashboards
    await queryInterface.addIndex('lessons', ['status']);

    // 4. Exams - index on start_time for range queries
    await queryInterface.addIndex('exams', ['start_time']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('student_exams', ['student_id', 'exam_id']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('student_exams', ['score']);
    await queryInterface.removeIndex('payments', ['payment_date', 'type']);
    await queryInterface.removeIndex('lessons', ['status']);
    await queryInterface.removeIndex('exams', ['start_time']);
  }
};
