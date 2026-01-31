const { sequelize } = require('../database');
const { DataTypes, Model } = require('sequelize');

class Specialization extends Model {}
Specialization.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  specialization: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT }
}, { sequelize, modelName: 'Specialization', tableName: 'specialization', underscored: true, timestamps: false });

class Certification extends Model {}
Certification.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  certification: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false }
}, { sequelize, modelName: 'Certification', tableName: 'certification', underscored: true, timestamps: false });

module.exports = { Specialization, Certification };
