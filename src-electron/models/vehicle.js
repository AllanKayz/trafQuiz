const { DataTypes } = require('sequelize');
const { sequelize } = require('../database');

const Vehicle = sequelize.define('Vehicle', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  vehicle_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  license_plate: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  vehicles_status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'vehicles',
  timestamps: false,
});

module.exports = Vehicle;
