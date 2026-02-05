const { sequelize } = require("../database");
const { DataTypes, Model } = require("sequelize");
const { Instructor } = require("./InstructorModel");
const { Student } = require("./StudentModel");

class Vehicle extends Model {}
Vehicle.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    instructor_id: { type: DataTypes.INTEGER },
    make: { type: DataTypes.STRING(100) },
    model: { type: DataTypes.STRING(100) },
    year: { type: DataTypes.INTEGER },
    registration: { type: DataTypes.STRING(50) },
    type: { type: DataTypes.STRING(50), defaultValue: "car" },
    status: { type: DataTypes.STRING(50), defaultValue: "active" },
    mileage: { type: DataTypes.INTEGER, defaultValue: 0 },
    fuel_level: { type: DataTypes.INTEGER, defaultValue: 100 },
    notes: { type: DataTypes.TEXT },
  },
  { sequelize, modelName: "Vehicle", tableName: "vehicles", underscored: true },
);

class Lesson extends Model {}
Lesson.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    subject: { type: DataTypes.STRING(100) },
    start_time: { type: DataTypes.DATE, allowNull: false },
    end_time: { type: DataTypes.DATE },
    duration_minutes: { type: DataTypes.INTEGER },
    instructor_id: { type: DataTypes.INTEGER },
    student_id: { type: DataTypes.INTEGER },
    assigned_vehicle_id: { type: DataTypes.INTEGER },
    location: { type: DataTypes.STRING(200) },
    online_link: { type: DataTypes.STRING(500) },
    status: { type: DataTypes.STRING(50), defaultValue: "upcoming" },
    student_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    capacity: { type: DataTypes.INTEGER },
    notes: { type: DataTypes.TEXT },
    resources: { type: DataTypes.TEXT },
    type: { type: DataTypes.STRING(50), defaultValue: "group" },
  },
  { sequelize, modelName: "Lesson", tableName: "lessons", underscored: true },
);

class VehicleIssue extends Model {}
VehicleIssue.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vehicle_id: { type: DataTypes.INTEGER, allowNull: false },
    instructor_id: { type: DataTypes.INTEGER, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    severity: { type: DataTypes.STRING(50), defaultValue: "low" },
    status: { type: DataTypes.STRING(50), defaultValue: "open" },
  },
  {
    sequelize,
    modelName: "VehicleIssue",
    tableName: "vehicle_issues",
    underscored: true,
  },
);

class VehicleLog extends Model {}
VehicleLog.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    vehicle_id: { type: DataTypes.INTEGER, allowNull: false },
    instructor_id: { type: DataTypes.INTEGER, allowNull: false },
    mileage: { type: DataTypes.INTEGER, allowNull: false },
    fuel_level: { type: DataTypes.INTEGER, allowNull: false },
    notes: { type: DataTypes.TEXT },
  },
  {
    sequelize,
    modelName: "VehicleLog",
    tableName: "vehicle_logs",
    underscored: true,
  },
);

// Associations
Lesson.belongsTo(Instructor, { foreignKey: "instructor_id" });
Lesson.belongsTo(Student, { foreignKey: "student_id" });
Lesson.belongsTo(Vehicle, { foreignKey: "assigned_vehicle_id" });

Vehicle.hasMany(VehicleIssue, { foreignKey: "vehicle_id" });
Vehicle.hasMany(VehicleLog, { foreignKey: "vehicle_id" });
VehicleIssue.belongsTo(Vehicle, { foreignKey: "vehicle_id" });
VehicleLog.belongsTo(Vehicle, { foreignKey: "vehicle_id" });

VehicleIssue.belongsTo(Instructor, { foreignKey: "instructor_id" });
VehicleLog.belongsTo(Instructor, { foreignKey: "instructor_id" });

module.exports = { Lesson, Vehicle, VehicleIssue, VehicleLog };
