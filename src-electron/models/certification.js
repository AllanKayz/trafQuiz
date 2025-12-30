const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Certification = sequelize.define('Certification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  certification: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
}, {
  tableName: 'certification',
  timestamps: false,
});

module.exports = Certification;
