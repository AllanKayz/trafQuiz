const { Lesson, Vehicle } = require('./OperationalModels');

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
        if (!vehicle) throw new Error('Vehicle not found');
        await vehicle.update(data);
        return vehicle.get({ plain: true });
    }

    static async delete(id) {
        return await Vehicle.destroy({ where: { id } });
    }
}

module.exports = VehicleModel;
