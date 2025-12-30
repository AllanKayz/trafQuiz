const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Package = sequelize.define('Package', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  package: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  amount: {
    type: DataTypes.DECIMAL(18, 2),
  },
}, {
  tableName: 'packages',
  timestamps: false,
});

module.exports = Package;
