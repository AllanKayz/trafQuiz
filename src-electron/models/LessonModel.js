const { Lesson, Vehicle } = require("./OperationalModels");

class LessonModel {
  static async findAll(filters = {}) {
    const { Instructor } = require("./InstructorModel");
    const { Student } = require("./StudentModel");
    const { User } = require("./UserModel");
    const { Op } = require("sequelize");

    const where = { ...filters };
    const range = filters.range;
    delete where.range;

    if (range) {
      const now = new Date();
      let startDate = new Date();
      let endDate = new Date();

      switch (range) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "7days":
          endDate.setDate(now.getDate() + 7);
          break;
        case "week":
          const day = now.getDay();
          const diff = now.getDate() - day + (day === 0 ? -6 : 1);
          startDate = new Date(now.setDate(diff));
          startDate.setHours(0, 0, 0, 0);
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          endDate.setHours(23, 59, 59, 999);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(
            now.getFullYear(),
            now.getMonth() + 1,
            0,
            23,
            59,
            59,
            999,
          );
          break;
      }

      if (range === "7days") {
        where.start_time = {
          [Op.between]: [now, endDate],
        };
      } else {
        where.start_time = {
          [Op.between]: [startDate, endDate],
        };
      }
    }

    const lessons = await Lesson.findAll({
      where,
      include: [
        {
          model: Instructor,
          include: [
            {
              model: User,
              attributes: ["first_name", "last_name", "email", "avatar"],
            },
            {
              model: require("./MetadataModels").Specialization,
              attributes: ["specialization"],
            },
            {
              model: require("./MetadataModels").Certification,
              attributes: ["certification"],
            },
          ],
          attributes: ["id"],
        },
        {
          model: Student,
          include: [
            {
              model: User,
              attributes: ["first_name", "last_name", "email", "avatar"],
            },
          ],
          attributes: ["id"],
        },
        {
          model: Vehicle,
          attributes: ["id", "make", "model", "registration", "type", "status"],
        },
      ],
      order: [["start_time", "ASC"]],
      nest: true,
      limit: 100,
    });

    return lessons.map((l) => {
      const lesson = l.toJSON ? l.toJSON() : l; // Handle if raw or instance
      const inst = lesson.Instructor;
      const stud = lesson.Student;
      const veh = lesson.Vehicle;

      return {
        id: lesson.id,
        title: lesson.title,
        subject: lesson.subject,
        startTime: lesson.start_time,
        endTime: lesson.end_time,
        durationMinutes: lesson.duration_minutes,
        location: lesson.location,
        onlineLink: lesson.online_link,
        status: lesson.status,
        studentCount: lesson.student_count,
        capacity: lesson.capacity,
        notes: lesson.notes,
        resources: lesson.resources,
        type: lesson.type,

        instructor: inst
          ? {
              id: inst.id,
              name: inst.User
                ? `${inst.User.first_name} ${inst.User.last_name}`
                : "Unknown",
              specialization: inst.Specialization
                ? inst.Specialization.specialization
                : "",
              certification: inst.Certification
                ? inst.Certification.certification
                : "",
              ...inst,
            }
          : null,

        student: stud
          ? {
              id: stud.id,
              name: stud.User
                ? `${stud.User.first_name} ${stud.User.last_name}`
                : "Unknown",
              ...stud,
            }
          : null,

        vehicle: veh
          ? {
              id: veh.id,
              make: veh.make,
              model: veh.model,
              licensePlate: veh.registration,
              type: veh.type,
              status: veh.status,
            }
          : null,

        // Helper for simple access
        assignedVehicleId: lesson.assigned_vehicle_id,
      };
    });
  }

  static async book(data) {
    const mappedData = {
      title: data.title,
      subject: data.subject,
      start_time: data.startTime || data.start_time,
      duration_minutes: data.durationMinutes || data.duration_minutes,
      instructor_id: data.instructorId || data.instructor_id,
      student_id: data.studentId || data.student_id,
      assigned_vehicle_id: data.assignedVehicleId || data.assigned_vehicle_id,
      location: data.location,
      online_link: data.onlineLink || data.online_link,
      status: data.status || "pending",
      capacity: data.capacity,
      notes: data.notes,
      type: data.type || "private",
    };

    if (mappedData.start_time && mappedData.duration_minutes) {
      const start = new Date(mappedData.start_time);
      if (!isNaN(start.getTime())) {
        mappedData.end_time = new Date(
          start.getTime() + mappedData.duration_minutes * 60000,
        );
      }
    }

    const lesson = await Lesson.create(mappedData);
    // Return fully hydrated object
    const created = await this.findAll({ id: lesson.id });
    return created[0];
  }

  static async create(data) {
    return this.book(data);
  }

  static async update(id, data) {
    const lesson = await Lesson.findByPk(id);
    if (!lesson) throw new Error("Lesson not found");

    // Map camelCase to snake_case for partial updates
    const mappedData = {};

    if (data.title !== undefined) mappedData.title = data.title;
    if (data.subject !== undefined) mappedData.subject = data.subject;
    if (data.startTime !== undefined || data.start_time !== undefined) {
      mappedData.start_time = data.startTime || data.start_time;
    }
    if (
      data.durationMinutes !== undefined ||
      data.duration_minutes !== undefined
    ) {
      mappedData.duration_minutes =
        data.durationMinutes || data.duration_minutes;
    }
    if (data.instructorId !== undefined || data.instructor_id !== undefined) {
      mappedData.instructor_id = data.instructorId || data.instructor_id;
    }
    if (data.studentId !== undefined || data.student_id !== undefined) {
      mappedData.student_id = data.studentId || data.student_id;
    }
    if (
      data.assignedVehicleId !== undefined ||
      data.assigned_vehicle_id !== undefined
    ) {
      mappedData.assigned_vehicle_id =
        data.assignedVehicleId || data.assigned_vehicle_id;
    }
    if (data.location !== undefined) mappedData.location = data.location;
    if (data.onlineLink !== undefined || data.online_link !== undefined) {
      mappedData.online_link = data.onlineLink || data.online_link;
    }
    if (data.status !== undefined) mappedData.status = data.status;
    if (data.capacity !== undefined) mappedData.capacity = data.capacity;
    if (data.notes !== undefined) mappedData.notes = data.notes;
    if (data.type !== undefined) mappedData.type = data.type;
    if (data.resources !== undefined) mappedData.resources = data.resources;

    // Recalculate end_time if start_time or duration changes
    if (mappedData.start_time && mappedData.duration_minutes) {
      const start = new Date(mappedData.start_time);
      if (!isNaN(start.getTime())) {
        mappedData.end_time = new Date(
          start.getTime() + mappedData.duration_minutes * 60000,
        );
      }
    } else if (mappedData.start_time && lesson.duration_minutes) {
      const start = new Date(mappedData.start_time);
      if (!isNaN(start.getTime())) {
        mappedData.end_time = new Date(
          start.getTime() + lesson.duration_minutes * 60000,
        );
      }
    } else if (mappedData.duration_minutes && lesson.start_time) {
      const start = new Date(lesson.start_time);
      if (!isNaN(start.getTime())) {
        mappedData.end_time = new Date(
          start.getTime() + mappedData.duration_minutes * 60000,
        );
      }
    }

    await lesson.update(mappedData);

    // Return fully hydrated object
    const updated = await this.findAll({ id });
    return updated[0];
  }

  static async delete(id) {
    return await Lesson.destroy({ where: { id } });
  }
}

module.exports = { LessonModel };
