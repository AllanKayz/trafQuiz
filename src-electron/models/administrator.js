const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Administrator = sequelize.define('Administrator', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  license_key_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'administrators',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Administrator;
