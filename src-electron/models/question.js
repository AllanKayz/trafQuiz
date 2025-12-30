const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  question_text: {
    type: DataTypes.TEXT('long'),
  },
  img_insert: {
    type: DataTypes.STRING(300),
  },
  option_image: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  option_a: {
    type: DataTypes.TEXT('long'),
  },
  option_b: {
    type: DataTypes.TEXT('long'),
  },
  option_c: {
    type: DataTypes.TEXT('long'),
  },
  correct_option: {
    type: DataTypes.STRING(45),
  },
  exam_id: {
    type: DataTypes.INTEGER,
  },
  answer: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'questions',
  timestamps: false,
});

module.exports = Question;
