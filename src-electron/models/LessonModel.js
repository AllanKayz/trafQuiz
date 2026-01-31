const { Lesson, Vehicle } = require('./OperationalModels');

class LessonModel {
    static async findAll(filters = {}) {
        // We need to require these here to avoid circular dependency issues if any, 
        // or just ensure they are available.
        const { Instructor } = require('./InstructorModel');
        const { Student } = require('./StudentModel');
        const { User } = require('./UserModel');

        const lessons = await Lesson.findAll({
            where: filters,
            include: [
                {
                    model: Instructor,
                    include: [User]
                },
                {
                    model: Student,
                    include: [User]
                },
                Vehicle
            ],
            order: [['start_time', 'ASC']],
            nest: true
        });

        return lessons.map(l => {
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
                
                instructor: inst ? {
                    id: inst.id,
                    name: inst.User ? `${inst.User.first_name} ${inst.User.last_name}` : 'Unknown',
                    ...inst
                } : null,
                
                student: stud ? {
                    id: stud.id,
                    name: stud.User ? `${stud.User.first_name} ${stud.User.last_name}` : 'Unknown',
                    ...stud
                } : null,
                
                vehicle: veh ? {
                    id: veh.id,
                    make: veh.make,
                    model: veh.model,
                    licensePlate: veh.registration,
                    type: veh.type,
                    status: veh.status
                } : null,
                
                // Helper for simple access
                assignedVehicleId: lesson.assigned_vehicle_id
            };
        });
    }

    static async create(data) {
        const lesson = await Lesson.create(data);
        return lesson.get({ plain: true });
    }

    static async update(id, data) {
        const lesson = await Lesson.findByPk(id);
        if (!lesson) throw new Error('Lesson not found');
        await lesson.update(data);
        return lesson.get({ plain: true });
    }

    static async delete(id) {
        return await Lesson.destroy({ where: { id } });
    }
}

module.exports = { LessonModel };
