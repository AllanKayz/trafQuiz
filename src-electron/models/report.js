const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  exam_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  total_score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  average_score: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0.00,
  },
  progress_summary: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'reports',
  timestamps: true,
  createdAt: 'generated_at',
  updatedAt: false,
});

module.exports = Report;
