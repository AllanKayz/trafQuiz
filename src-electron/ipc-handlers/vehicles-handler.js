const { ipcMain } = require("electron");
const VehicleModel = require("../models/VehicleModel");
const { InstructorModel } = require("../models/InstructorModel");
const { broadcastChange } = require("../utils/broadcast");

ipcMain.handle("get-vehicles", async (event, { role, userId } = {}) => {
  try {
    let sql = "SELECT * FROM vehicles";
    const params = [];

    // If role is instructor, filter by their instructor_id
    if (role === "instructor" && userId) {
      const instructor = await InstructorModel.findByUserId(userId);
      if (instructor) {
        sql += " WHERE instructor_id = ?";
        params.push(instructor.id);
      }
    }
    // Admin (or no role/user) gets all vehicles

    sql += " ORDER BY created_at DESC";

    const { query } = require("../db");
    const vehicles = await query(sql, params);
    return { success: true, data: vehicles };
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle("add-vehicle", async (event, data) => {
  try {
    const newVehicle = await VehicleModel.create(data);
    broadcastChange("vehicles", "create", newVehicle);
    return { success: true, data: newVehicle };
  } catch (error) {
    console.error("Error adding vehicle:", error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle("update-vehicle", async (event, { id, ...data }) => {
  try {
    const updatedVehicle = await VehicleModel.update(id, data);
    broadcastChange("vehicles", "update", updatedVehicle);
    return { success: true, data: updatedVehicle };
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle("delete-vehicle", async (event, id) => {
  try {
    await VehicleModel.delete(id);
    broadcastChange("vehicles", "delete", { id });
    return { success: true };
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle("report-vehicle-issue", async (event, data) => {
  try {
    let { instructorId } = data;
    const instructor = await InstructorModel.findByUserId(instructorId);
    if (instructor) {
      data.instructor_id = instructor.id;
    } else {
      data.instructor_id = instructorId; // Fallback if already an instructor ID
    }

    if (data.vehicleId) {
      data.vehicle_id = data.vehicleId;
    }

    const issue = await VehicleModel.reportIssue(data);
    broadcastChange("vehicles", "issue-report", issue);
    return { success: true, data: issue };
  } catch (error) {
    console.error("Error reporting vehicle issue:", error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle("log-vehicle-activity", async (event, data) => {
  try {
    let { instructorId } = data;
    const instructor = await InstructorModel.findByUserId(instructorId);
    if (instructor) {
      data.instructor_id = instructor.id;
    } else {
      data.instructor_id = instructorId;
    }

    if (data.vehicleId) {
      data.vehicle_id = data.vehicleId;
    }

    if (data.fuelLevel) {
      data.fuel_level = data.fuelLevel;
    }

    const log = await VehicleModel.logActivity(data);
    broadcastChange("vehicles", "activity-log", log);
    return { success: true, data: log };
  } catch (error) {
    console.error("Error logging vehicle activity:", error);
    return { success: false, message: error.message };
  }
});
