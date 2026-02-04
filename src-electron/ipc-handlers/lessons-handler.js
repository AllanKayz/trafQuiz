const { ipcMain } = require("electron");
const { LessonModel } = require("../models/LessonModel");
const { broadcastChange } = require("../utils/broadcast");

ipcMain.handle("get-lessons", async (event, filters) => {
  try {
    const cleanFilters = {};
    for (const key in filters) {
      if (
        filters[key] !== undefined &&
        filters[key] !== null &&
        filters[key] !== ""
      ) {
        cleanFilters[key] = filters[key];
      }
    }
    const { role, userId } = filters;
    if (role === "instructor" && userId) {
      const { Instructor } = require("../models/InstructorModel");
      const instructor = await Instructor.findOne({
        where: { user_id: userId },
      });
      if (instructor) {
        cleanFilters.instructor_id = instructor.id;
        delete cleanFilters.instructorId; // Standardize on snake_case for DB query
      }
    } else if (filters.instructorId) {
      cleanFilters.instructor_id = filters.instructorId;
      delete cleanFilters.instructorId;
    }

    const lessons = await LessonModel.findAll(cleanFilters);
    return { success: true, data: lessons };
  } catch (error) {
    console.error("Get lessons error:", error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle("add-lesson", async (event, lesson) => {
  try {
    const result = await LessonModel.book(lesson);
    broadcastChange("lessons", "book", result);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle("update-lesson", async (event, payload) => {
  try {
    const { id, ...updateData } = payload;
    const result = await LessonModel.update(id, updateData);
    broadcastChange("lessons", "update", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Update lesson error:", error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle("delete-lesson", async (event, { id }) => {
  try {
    await LessonModel.delete(id);
    broadcastChange("lessons", "delete", { id });
    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
});
