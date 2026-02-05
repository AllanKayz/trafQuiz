const {
  Lesson,
  Vehicle,
  VehicleIssue,
  VehicleLog,
} = require("./OperationalModels");

class VehicleModel {
  static async findAll() {
    return await Vehicle.findAll({ raw: true });
  }

  static async create(data) {
    const vehicle = await Vehicle.create(data);
    return vehicle.get({ plain: true });
  }

  static async update(id, data) {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) throw new Error("Vehicle not found");
    await vehicle.update(data);
    return vehicle.get({ plain: true });
  }

  static async delete(id) {
    return await Vehicle.destroy({ where: { id } });
  }

  static async reportIssue(data) {
    const issue = await VehicleIssue.create(data);
    return issue.get({ plain: true });
  }

  static async logActivity(data) {
    const log = await VehicleLog.create(data);
    // Also update vehicle stats
    const vehicle = await Vehicle.findByPk(data.vehicle_id);
    if (vehicle) {
      await vehicle.update({
        mileage: data.mileage,
        fuel_level: data.fuel_level,
      });
    }
    return log.get({ plain: true });
  }
}

module.exports = VehicleModel;
