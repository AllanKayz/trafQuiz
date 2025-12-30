const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const StudentExam = sequelize.define('StudentExam', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  exam_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  score: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'student_exams',
  timestamps: true,
  createdAt: 'completed_at',
  updatedAt: false,
});

module.exports = StudentExam;
