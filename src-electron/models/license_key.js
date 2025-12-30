const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const LicenseKey = sequelize.define('LicenseKey', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  license_key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  },
}, {
  tableName: 'license_keys',
  timestamps: false,
});

module.exports = LicenseKey;
