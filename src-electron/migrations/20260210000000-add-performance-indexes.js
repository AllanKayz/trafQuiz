
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Lessons - frequently filtered and joined
    await queryInterface.addIndex('lessons', ['instructor_id']);
    await queryInterface.addIndex('lessons', ['student_id']);
    await queryInterface.addIndex('lessons', ['assigned_vehicle_id']);
    await queryInterface.addIndex('lessons', ['start_time']);

    // 2. Questions - filtered by exam
    await queryInterface.addIndex('questions', ['exam_id']);

    // 3. Students & Instructors - joined with users
    await queryInterface.addIndex('students', ['user_id']);
    await queryInterface.addIndex('instructors', ['user_id']);

    // 4. Vehicles - filtered by instructor
    await queryInterface.addIndex('vehicles', ['instructor_id']);

    // 5. Payments - frequently filtered
    await queryInterface.addIndex('payments', ['student_id']);
    await queryInterface.addIndex('payments', ['instructor_id']);
    await queryInterface.addIndex('payments', ['vehicle_id']);

    // 6. Messaging - frequently queried by conversation and sender
    await queryInterface.addIndex('messages', ['conversation_id']);
    await queryInterface.addIndex('messages', ['sender_id']);

    // 7. Conversation Participants - join optimization
    // (Note: there is already a unique composite index, but separate ones can help some queries)
    await queryInterface.addIndex('conversation_participants', ['user_id']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('lessons', ['instructor_id']);
    await queryInterface.removeIndex('lessons', ['student_id']);
    await queryInterface.removeIndex('lessons', ['assigned_vehicle_id']);
    await queryInterface.removeIndex('lessons', ['start_time']);
    await queryInterface.removeIndex('questions', ['exam_id']);
    await queryInterface.removeIndex('students', ['user_id']);
    await queryInterface.removeIndex('instructors', ['user_id']);
    await queryInterface.removeIndex('vehicles', ['instructor_id']);
    await queryInterface.removeIndex('payments', ['student_id']);
    await queryInterface.removeIndex('payments', ['instructor_id']);
    await queryInterface.removeIndex('payments', ['vehicle_id']);
    await queryInterface.removeIndex('messages', ['conversation_id']);
    await queryInterface.removeIndex('messages', ['sender_id']);
    await queryInterface.removeIndex('conversation_participants', ['user_id']);
  }
};
