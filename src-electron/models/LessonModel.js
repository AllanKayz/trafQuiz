const { Lesson, Vehicle } = require('./OperationalModels');

class LessonModel {
    static async findAll(filters = {}) {
        return await Lesson.findAll({
            where: filters,
            include: ['Instructor', 'Student', 'Vehicle'],
            raw: true,
            nest: true
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
