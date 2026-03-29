
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. student_exams - dashboard and reporting
    await queryInterface.addIndex('student_exams', ['student_id']);
    await queryInterface.addIndex('student_exams', ['completed_at']);
    await queryInterface.addIndex('student_exams', ['score']);

    // 2. exams - "exams today" query
    await queryInterface.addIndex('exams', ['start_time']);

    // 3. payments - financial stats and dashboard revenue
    await queryInterface.addIndex('payments', ['payment_date']);

    // 4. lessons - filtering by status
    await queryInterface.addIndex('lessons', ['status']);

    // 5. students - filtering by status for dashboard
    await queryInterface.addIndex('students', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('student_exams', ['student_id']);
    await queryInterface.removeIndex('student_exams', ['completed_at']);
    await queryInterface.removeIndex('student_exams', ['score']);
    await queryInterface.removeIndex('exams', ['start_time']);
    await queryInterface.removeIndex('payments', ['payment_date']);
    await queryInterface.removeIndex('lessons', ['status']);
    await queryInterface.removeIndex('students', ['status']);
  }
};
