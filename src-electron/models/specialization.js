const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Specialization = sequelize.define('Specialization', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'specialization',
  timestamps: false,
});

module.exports = Specialization;
