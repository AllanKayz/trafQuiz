const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Users
    await queryInterface.createTable('users', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      username: { type: DataTypes.STRING(100), allowNull: false, unique: true },
      password: { type: DataTypes.STRING(255), allowNull: false },
      role: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'user' },
      first_name: { type: DataTypes.STRING(100) },
      last_name: { type: DataTypes.STRING(100) },
      email: { type: DataTypes.STRING(255) },
      phone: { type: DataTypes.STRING(255) },
      avatar: { type: DataTypes.STRING(500) },
      reset_token: { type: DataTypes.STRING(255) },
      reset_expires: { type: DataTypes.DATE },
      created_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 2. Packages
    await queryInterface.createTable('packages', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      package: { type: DataTypes.STRING(255) },
      description: { type: DataTypes.TEXT },
      amount: { type: DataTypes.DECIMAL(18, 2) }
    });

    // 3. Specialization
    await queryInterface.createTable('specialization', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      specialization: { type: DataTypes.STRING(255), allowNull: false },
      description: { type: DataTypes.TEXT }
    });

    // 4. Certification
    await queryInterface.createTable('certification', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      certification: { type: DataTypes.STRING(255), allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: false }
    });

    // 5. Categories
    await queryInterface.createTable('categories', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(255), allowNull: false },
      description: { type: DataTypes.TEXT }
    });

    // 6. Students
    await queryInterface.createTable('students', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      address: { type: DataTypes.TEXT },
      status: { type: DataTypes.STRING(50), defaultValue: 'active' },
      package_id: {
        type: DataTypes.INTEGER,
        references: { model: 'packages', key: 'id' },
        onDelete: 'SET NULL'
      },
      created_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 7. Instructors
    await queryInterface.createTable('instructors', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      license_number: { type: DataTypes.STRING(255), allowNull: false },
      specialization_id: {
        type: DataTypes.INTEGER,
        references: { model: 'specialization', key: 'id' },
        onDelete: 'SET NULL'
      },
      certification_id: {
        type: DataTypes.INTEGER,
        references: { model: 'certification', key: 'id' },
        onDelete: 'SET NULL'
      },
      experience: { type: DataTypes.INTEGER, allowNull: false },
      salary: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0.00 },
      status: { type: DataTypes.STRING(50), defaultValue: 'active' },
      availability: { type: DataTypes.TINYINT(1), allowNull: false, defaultValue: 1 },
      created_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 8. Vehicles
    await queryInterface.createTable('vehicles', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      instructor_id: {
        type: DataTypes.INTEGER,
        references: { model: 'instructors', key: 'id' },
        onDelete: 'SET NULL'
      },
      make: { type: DataTypes.STRING(100) },
      model: { type: DataTypes.STRING(100) },
      year: { type: DataTypes.INTEGER },
      registration: { type: DataTypes.STRING(50) },
      type: { type: DataTypes.STRING(50), defaultValue: 'car' },
      status: { type: DataTypes.STRING(50), defaultValue: 'active' },
      mileage: { type: DataTypes.INTEGER, defaultValue: 0 },
      fuel_level: { type: DataTypes.INTEGER, defaultValue: 100 },
      notes: { type: DataTypes.TEXT },
      created_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 9. Exams
    await queryInterface.createTable('exams', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      start_time: { type: DataTypes.DATE, allowNull: false },
      end_time: { type: DataTypes.DATE, allowNull: false },
      created_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 10. Lessons
    await queryInterface.createTable('lessons', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: DataTypes.STRING(200), allowNull: false },
      subject: { type: DataTypes.STRING(100) },
      start_time: { type: DataTypes.DATE, allowNull: false },
      end_time: { type: DataTypes.DATE },
      duration_minutes: { type: DataTypes.INTEGER },
      instructor_id: {
        type: DataTypes.INTEGER,
        references: { model: 'instructors', key: 'id' },
        onDelete: 'SET NULL'
      },
      student_id: {
        type: DataTypes.INTEGER,
        references: { model: 'students', key: 'id' },
        onDelete: 'SET NULL'
      },
      assigned_vehicle_id: {
        type: DataTypes.INTEGER,
        references: { model: 'vehicles', key: 'id' },
        onDelete: 'SET NULL'
      },
      location: { type: DataTypes.STRING(200) },
      online_link: { type: DataTypes.STRING(500) },
      status: { type: DataTypes.STRING(50), defaultValue: 'upcoming' },
      student_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      capacity: { type: DataTypes.INTEGER },
      notes: { type: DataTypes.TEXT },
      resources: { type: DataTypes.TEXT },
      type: { type: DataTypes.STRING(50), defaultValue: 'group' },
      created_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 11. Questions
    await queryInterface.createTable('questions', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      question_text: { type: DataTypes.TEXT },
      img_insert: { type: DataTypes.STRING(300) },
      option_image: { type: DataTypes.TINYINT(4), defaultValue: 0 },
      option_a: { type: DataTypes.TEXT },
      option_b: { type: DataTypes.TEXT },
      option_c: { type: DataTypes.TEXT },
      correct_option: { type: DataTypes.STRING(45) },
      exam_id: {
        type: DataTypes.INTEGER,
        references: { model: 'exams', key: 'id' },
        onDelete: 'SET NULL'
      },
      answer: { type: DataTypes.STRING(255), allowNull: false }
    });

    // 12. Payments
    await queryInterface.createTable('payments', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      student_id: {
        type: DataTypes.INTEGER,
        references: { model: 'students', key: 'id' },
        onDelete: 'SET NULL'
      },
      instructor_id: {
        type: DataTypes.INTEGER,
        references: { model: 'instructors', key: 'id' },
        onDelete: 'SET NULL'
      },
      vehicle_id: {
        type: DataTypes.INTEGER,
        references: { model: 'vehicles', key: 'id' },
        onDelete: 'SET NULL'
      },
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      type: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'income' },
      category: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'student_payment' },
      payment_date: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      transaction_id: { type: DataTypes.STRING(100), allowNull: false },
      status: { type: DataTypes.STRING(50), defaultValue: 'pending' },
      package_id: {
        type: DataTypes.INTEGER,
        references: { model: 'packages', key: 'id' },
        onDelete: 'SET NULL'
      },
      method: { type: DataTypes.STRING(50) },
      notes: { type: DataTypes.TEXT },
      description: { type: DataTypes.TEXT },
      created_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 13. Vehicle Issues
    await queryInterface.createTable('vehicle_issues', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      vehicle_id: {
        type: DataTypes.INTEGER, allowNull: false,
        references: { model: 'vehicles', key: 'id' },
        onDelete: 'CASCADE'
      },
      instructor_id: {
        type: DataTypes.INTEGER, allowNull: false,
        references: { model: 'instructors', key: 'id' },
        onDelete: 'CASCADE'
      },
      description: { type: DataTypes.TEXT, allowNull: false },
      severity: { type: DataTypes.STRING(50), defaultValue: 'low' },
      status: { type: DataTypes.STRING(50), defaultValue: 'open' },
      created_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 14. Vehicle Logs
    await queryInterface.createTable('vehicle_logs', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      vehicle_id: {
        type: DataTypes.INTEGER, allowNull: false,
        references: { model: 'vehicles', key: 'id' },
        onDelete: 'CASCADE'
      },
      instructor_id: {
        type: DataTypes.INTEGER, allowNull: false,
        references: { model: 'instructors', key: 'id' },
        onDelete: 'CASCADE'
      },
      mileage: { type: DataTypes.INTEGER, allowNull: false },
      fuel_level: { type: DataTypes.INTEGER, allowNull: false },
      notes: { type: DataTypes.TEXT },
      created_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 15. Reports
    await queryInterface.createTable('reports', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      student_id: {
        type: DataTypes.INTEGER, allowNull: false,
        references: { model: 'students', key: 'id' },
        onDelete: 'CASCADE'
      },
      exam_count: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      total_score: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      average_score: { type: DataTypes.DECIMAL(5, 2), defaultValue: 0.00 },
      progress_summary: { type: DataTypes.TEXT },
      generated_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 16. Student Exams
    await queryInterface.createTable('student_exams', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      student_id: {
        type: DataTypes.INTEGER, allowNull: false,
        references: { model: 'students', key: 'id' },
        onDelete: 'CASCADE'
      },
      exam_id: {
        type: DataTypes.INTEGER, allowNull: false,
        references: { model: 'exams', key: 'id' },
        onDelete: 'CASCADE'
      },
      score: { type: DataTypes.INTEGER, defaultValue: 0 },
      completed_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 17. Student Exam History
    await queryInterface.createTable('student_exam_history', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      student_id: {
        type: DataTypes.INTEGER, allowNull: false,
        references: { model: 'students', key: 'id' },
        onDelete: 'CASCADE'
      },
      exam_id: {
        type: DataTypes.INTEGER, allowNull: false,
        references: { model: 'exams', key: 'id' },
        onDelete: 'CASCADE'
      },
      timestamp: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 18. Conversations (Refactored)
    await queryInterface.createTable('conversations', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: DataTypes.STRING(255) },
      last_message_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      created_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 19. Conversation Participants (New)
    await queryInterface.createTable('conversation_participants', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      conversation_id: {
        type: DataTypes.INTEGER, allowNull: false,
        references: { model: 'conversations', key: 'id' },
        onDelete: 'CASCADE'
      },
      user_id: {
        type: DataTypes.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      created_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      unique_participant: {
          type: Sequelize.VIRTUAL, // Not actually virtual in table creation, but for index
      }
    });
    await queryInterface.addIndex('conversation_participants', ['conversation_id', 'user_id'], {
        unique: true,
        name: 'unique_participant_idx'
    });

    // 20. Messages
    await queryInterface.createTable('messages', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      conversation_id: {
        type: DataTypes.INTEGER, allowNull: false,
        references: { model: 'conversations', key: 'id' },
        onDelete: 'CASCADE'
      },
      sender_id: {
        type: DataTypes.INTEGER, allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      sender_name: { type: DataTypes.STRING(255) },
      text: { type: DataTypes.TEXT, allowNull: false },
      type: { type: DataTypes.STRING(50), defaultValue: 'text' },
      attachment_url: { type: DataTypes.STRING(255) },
      attachment_name: { type: DataTypes.STRING(255) },
      attachment_type: { type: DataTypes.STRING(100) },
      duration: { type: DataTypes.INTEGER },
      call_status: { type: DataTypes.STRING(50) },
      timestamp: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      is_read: { type: DataTypes.TINYINT(1), defaultValue: 0 }
    });

    // 21. Exam Timeframe
    await queryInterface.createTable('exam_timeframe', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      exam_id: {
        type: DataTypes.INTEGER, allowNull: false,
        references: { model: 'exams', key: 'id' },
        onDelete: 'CASCADE'
      },
      period: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30 },
      created_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 22. License Keys
    await queryInterface.createTable('license_keys', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      license_key: { type: DataTypes.STRING(100), allowNull: false },
      status: { type: DataTypes.STRING(50), defaultValue: 'active' }
    });

    // 23. System License
    await queryInterface.createTable('system_license', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      device_id: { type: DataTypes.TEXT, allowNull: false },
      system_license_key: { type: DataTypes.TEXT, allowNull: false },
      business_name: { type: DataTypes.STRING(255), allowNull: false }
    });

    // INITIAL SEEDING
    await queryInterface.bulkInsert('certification', [
      { id: 1, certification: 'TSCZ Instructor Certificate', description: 'Traffic Safety Council of Zimbabwe Instructor Certification' }
    ]);

    await queryInterface.bulkInsert('specialization', [
      { id: 1, specialization: 'Advanced Driving', description: '' },
      { id: 2, specialization: 'Commercial License', description: '' },
      { id: 3, specialization: 'Beginner Courses', description: '' }
    ]);

    await queryInterface.bulkInsert('packages', [
      { id: 1, package: 'Provisional Drivers Certificate', description: '', amount: 2.00 },
      { id: 2, package: 'Light Motor Vehicles(Class 4)', description: '', amount: 10.00 },
      { id: 3, package: 'Motor Cycles (Class 3)', description: '', amount: 5.00 },
      { id: 4, package: 'Heavy Motor Vehicles (Class 2)', description: '', amount: 20.00 },
      { id: 5, package: 'Public Motor Vehicles (Class 1)', description: '', amount: 30.00 }
    ]);

    // Admin user (123456)
    await queryInterface.bulkInsert('users', [
      { id: 1, username: 'admin', password: '$2y$10$j8KHrniTKtPcVga7/7HHUeFiPsC3vouihT6HFS85W/AhaAjTay6NG', role: 'admin', first_name: 'admin', last_name: 'admin', email: 'admin@gmail.com' }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop in reverse order of creation
    await queryInterface.dropTable('system_license');
    await queryInterface.dropTable('license_keys');
    await queryInterface.dropTable('exam_timeframe');
    await queryInterface.dropTable('messages');
    await queryInterface.dropTable('conversation_participants');
    await queryInterface.dropTable('conversations');
    await queryInterface.dropTable('student_exam_history');
    await queryInterface.dropTable('student_exams');
    await queryInterface.dropTable('reports');
    await queryInterface.dropTable('vehicle_logs');
    await queryInterface.dropTable('vehicle_issues');
    await queryInterface.dropTable('payments');
    await queryInterface.dropTable('questions');
    await queryInterface.dropTable('lessons');
    await queryInterface.dropTable('exams');
    await queryInterface.dropTable('vehicles');
    await queryInterface.dropTable('instructors');
    await queryInterface.dropTable('students');
    await queryInterface.dropTable('categories');
    await queryInterface.dropTable('certification');
    await queryInterface.dropTable('specialization');
    await queryInterface.dropTable('packages');
    await queryInterface.dropTable('users');
  }
};
