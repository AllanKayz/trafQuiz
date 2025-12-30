const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const ExamTimeframe = sequelize.define('ExamTimeframe', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  period: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'exam_timeframe',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = ExamTimeframe;
