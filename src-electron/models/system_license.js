const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const SystemLicense = sequelize.define('SystemLicense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  device_id: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  system_license_key: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  business_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'system_license',
  timestamps: false,
});

module.exports = SystemLicense;
