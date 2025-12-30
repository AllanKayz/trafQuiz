const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Lesson = sequelize.define('Lesson', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  student_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  instructor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  vehicle_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  lesson_date: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  lesson_status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'lessons',
  timestamps: false,
});

module.exports = Lesson;
