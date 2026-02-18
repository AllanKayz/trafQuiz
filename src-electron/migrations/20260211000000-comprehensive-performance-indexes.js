
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Exams - frequently filtered by start_time in dashboard
    await queryInterface.addIndex('exams', ['start_time']);

    // 2. Payments - frequently filtered by payment_date in finances and dashboard
    await queryInterface.addIndex('payments', ['payment_date']);

    // 3. Student Exams - join and filtering optimization
    await queryInterface.addIndex('student_exams', ['student_id']);
    await queryInterface.addIndex('student_exams', ['exam_id']);
    await queryInterface.addIndex('student_exams', ['score']);

    // 4. Student Exam History - join optimization
    await queryInterface.addIndex('student_exam_history', ['student_id']);
    await queryInterface.addIndex('student_exam_history', ['exam_id']);

    // 5. Lessons - index status for dashboard filtering
    await queryInterface.addIndex('lessons', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('student_exams', ['student_id']);
    await queryInterface.removeIndex('student_exams', ['exam_id']);
    await queryInterface.removeIndex('student_exams', ['score']);
    await queryInterface.removeIndex('student_exam_history', ['student_id']);
    await queryInterface.removeIndex('student_exam_history', ['exam_id']);
    await queryInterface.removeIndex('lessons', ['status']);
  }
};
