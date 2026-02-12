
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Students - status filtering for dashboard
    await queryInterface.addIndex('students', ['status']);

    // 2. Instructors - status filtering
    await queryInterface.addIndex('instructors', ['status']);

    // 3. Vehicles - status filtering
    await queryInterface.addIndex('vehicles', ['status']);

    // 4. Lessons - status and type filtering
    await queryInterface.addIndex('lessons', ['status']);
    await queryInterface.addIndex('lessons', ['type']);

    // 5. Payments - type and date filtering
    await queryInterface.addIndex('payments', ['type']);
    await queryInterface.addIndex('payments', ['payment_date']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('students', ['status']);
    await queryInterface.removeIndex('instructors', ['status']);
    await queryInterface.removeIndex('vehicles', ['status']);
    await queryInterface.removeIndex('lessons', ['status']);
    await queryInterface.removeIndex('lessons', ['type']);
    await queryInterface.removeIndex('payments', ['type']);
    await queryInterface.removeIndex('payments', ['payment_date']);
  }
};
