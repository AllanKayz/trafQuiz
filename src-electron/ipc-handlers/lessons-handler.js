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
    if (cleanFilters.range) {
      // Keep the range filter for LessonModel.findAll to handle
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

ipcMain.handle("update-lesson", async (event, { id, status, notes }) => {
  try {
    const result = await LessonModel.updateStatus(id, status, notes);
    broadcastChange("lessons", "update-status", result);
    return { success: true, data: result };
  } catch (error) {
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
