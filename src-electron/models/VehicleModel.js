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
    const mappedData = {
      make: data.make,
      model: data.model,
      year: data.year,
      registration: data.registration,
      type: data.type,
      status: data.status,
      notes: data.notes,
      instructor_id: data.instructorId || data.assignedInstructorId || data.instructor_id,
      mileage: data.mileage || 0,
      fuel_level: data.fuelLevel || data.fuel_level || 100
    };
    const vehicle = await Vehicle.create(mappedData);
    return vehicle.get({ plain: true });
  }

  static async update(id, data) {
    const vehicle = await Vehicle.findByPk(id);
    if (!vehicle) throw new Error("Vehicle not found");

    const mappedData = {};
    if (data.make !== undefined) mappedData.make = data.make;
    if (data.model !== undefined) mappedData.model = data.model;
    if (data.year !== undefined) mappedData.year = data.year;
    if (data.registration !== undefined) mappedData.registration = data.registration;
    if (data.type !== undefined) mappedData.type = data.type;
    if (data.status !== undefined) mappedData.status = data.status;
    if (data.notes !== undefined) mappedData.notes = data.notes;
    if (data.instructorId !== undefined || data.assignedInstructorId !== undefined || data.instructor_id !== undefined) {
      mappedData.instructor_id = data.instructorId || data.assignedInstructorId || data.instructor_id;
    }
    if (data.mileage !== undefined) mappedData.mileage = data.mileage;
    if (data.fuelLevel !== undefined || data.fuel_level !== undefined) {
      mappedData.fuel_level = data.fuelLevel || data.fuel_level;
    }

    await vehicle.update(mappedData);
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
