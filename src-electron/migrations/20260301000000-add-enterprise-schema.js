const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Organizations Table
    await queryInterface.createTable('organizations', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      code: { type: DataTypes.STRING, unique: true, allowNull: true },
      contact_email: { type: DataTypes.STRING, allowNull: true },
      contact_phone: { type: DataTypes.STRING, allowNull: true },
      status: { type: DataTypes.STRING, defaultValue: 'active' },
      createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // Seed default main organization if none exists
    await queryInterface.bulkInsert('organizations', [{
      id: 1,
      name: 'Default Driving Academy',
      code: 'MAIN-HQ',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // 2. Branches Table
    await queryInterface.createTable('branches', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      organization_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'organizations', key: 'id' },
        onDelete: 'CASCADE'
      },
      name: { type: DataTypes.STRING, allowNull: false },
      code: { type: DataTypes.STRING, allowNull: true },
      address: { type: DataTypes.STRING, allowNull: true },
      phone: { type: DataTypes.STRING, allowNull: true },
      status: { type: DataTypes.STRING, defaultValue: 'active' },
      createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    await queryInterface.bulkInsert('branches', [{
      id: 1,
      organization_id: 1,
      name: 'Main Campus',
      code: 'BR-001',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    }]);

    // 3. User Sessions Table
    await queryInterface.createTable('user_sessions', {
      id: { type: DataTypes.STRING, primaryKey: true },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      token: { type: DataTypes.STRING, allowNull: false },
      device_info: { type: DataTypes.STRING, allowNull: true },
      ip_address: { type: DataTypes.STRING, allowNull: true },
      is_revoked: { type: DataTypes.BOOLEAN, defaultValue: false },
      last_activity: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      expires_at: { type: DataTypes.DATE, allowNull: false },
      createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 4. Audit Logs Table
    await queryInterface.createTable('audit_logs', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: true },
      username: { type: DataTypes.STRING, allowNull: true },
      action: { type: DataTypes.STRING, allowNull: false },
      entity: { type: DataTypes.STRING, allowNull: false },
      entity_id: { type: DataTypes.STRING, allowNull: true },
      details: { type: DataTypes.TEXT, allowNull: true },
      ip_address: { type: DataTypes.STRING, allowNull: true },
      status: { type: DataTypes.STRING, defaultValue: 'SUCCESS' },
      createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 5. Exam Attempt Answers Table
    await queryInterface.createTable('exam_attempt_answers', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      exam_attempt_id: { type: DataTypes.INTEGER, allowNull: false },
      student_id: { type: DataTypes.INTEGER, allowNull: false },
      question_id: { type: DataTypes.INTEGER, allowNull: false },
      selected_option: { type: DataTypes.TEXT, allowNull: true },
      is_flagged: { type: DataTypes.BOOLEAN, defaultValue: false },
      is_correct: { type: DataTypes.BOOLEAN, allowNull: true },
      saved_at: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 6. Question Versions Table
    await queryInterface.createTable('question_versions', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      question_id: { type: DataTypes.INTEGER, allowNull: false },
      version_number: { type: DataTypes.INTEGER, defaultValue: 1 },
      question_text: { type: DataTypes.TEXT, allowNull: false },
      options_json: { type: DataTypes.TEXT, allowNull: false },
      correct_answer: { type: DataTypes.TEXT, allowNull: false },
      explanation: { type: DataTypes.TEXT, allowNull: true },
      changed_by: { type: DataTypes.INTEGER, allowNull: true },
      createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 7. Invoices Table
    await queryInterface.createTable('invoices', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      invoice_number: { type: DataTypes.STRING, unique: true, allowNull: false },
      student_id: { type: DataTypes.INTEGER, allowNull: false },
      branch_id: { type: DataTypes.INTEGER, defaultValue: 1 },
      total_amount_cents: { type: DataTypes.INTEGER, allowNull: false },
      balance_due_cents: { type: DataTypes.INTEGER, allowNull: false },
      status: { type: DataTypes.STRING, defaultValue: 'UNPAID' }, // UNPAID, PARTIAL, PAID, CANCELLED
      due_date: { type: DataTypes.DATE, allowNull: true },
      createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 8. Payment Allocations Table
    await queryInterface.createTable('payment_allocations', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      payment_id: { type: DataTypes.INTEGER, allowNull: false },
      invoice_id: { type: DataTypes.INTEGER, allowNull: false },
      allocated_amount_cents: { type: DataTypes.INTEGER, allowNull: false },
      createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 9. Vehicle Maintenance Table
    await queryInterface.createTable('vehicle_maintenance', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      vehicle_id: { type: DataTypes.INTEGER, allowNull: false },
      maintenance_type: { type: DataTypes.STRING, allowNull: false }, // SERVICE, REPAIR, INSPECTION
      cost_cents: { type: DataTypes.INTEGER, defaultValue: 0 },
      mileage: { type: DataTypes.INTEGER, allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: true },
      performed_by: { type: DataTypes.STRING, allowNull: true },
      service_date: { type: DataTypes.DATE, allowNull: false },
      next_service_due: { type: DataTypes.DATE, allowNull: true },
      createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 10. Notifications Table
    await queryInterface.createTable('notifications', {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      message: { type: DataTypes.TEXT, allowNull: false },
      type: { type: DataTypes.STRING, defaultValue: 'INFO' }, // INFO, WARNING, SUCCESS, URGENT
      is_read: { type: DataTypes.BOOLEAN, defaultValue: false },
      createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // 11. Sync Events Queue Table
    await queryInterface.createTable('sync_events', {
      id: { type: DataTypes.STRING, primaryKey: true },
      entity_type: { type: DataTypes.STRING, allowNull: false },
      entity_id: { type: DataTypes.STRING, allowNull: false },
      operation: { type: DataTypes.STRING, allowNull: false }, // CREATE, UPDATE, DELETE
      payload_json: { type: DataTypes.TEXT, allowNull: false },
      status: { type: DataTypes.STRING, defaultValue: 'PENDING' }, // PENDING, SYNCED, FAILED
      retry_count: { type: DataTypes.INTEGER, defaultValue: 0 },
      error_message: { type: DataTypes.TEXT, allowNull: true },
      createdAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
    });

    // Add composite indexes for optimal lookup speed
    await queryInterface.addIndex('audit_logs', ['user_id', 'createdAt']);
    await queryInterface.addIndex('exam_attempt_answers', ['exam_attempt_id', 'student_id']);
    await queryInterface.addIndex('notifications', ['user_id', 'is_read']);
    await queryInterface.addIndex('sync_events', ['status', 'createdAt']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('sync_events');
    await queryInterface.dropTable('notifications');
    await queryInterface.dropTable('vehicle_maintenance');
    await queryInterface.dropTable('payment_allocations');
    await queryInterface.dropTable('invoices');
    await queryInterface.dropTable('question_versions');
    await queryInterface.dropTable('exam_attempt_answers');
    await queryInterface.dropTable('audit_logs');
    await queryInterface.dropTable('user_sessions');
    await queryInterface.dropTable('branches');
    await queryInterface.dropTable('organizations');
  }
};
