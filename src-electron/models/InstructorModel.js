const { sequelize } = require('../database');
const { DataTypes, Model } = require('sequelize');
const { User } = require('./UserModel');
const { Specialization, Certification } = require('./MetadataModels');

class Instructor extends Model {}

Instructor.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  license_number: { type: DataTypes.STRING(255), allowNull: false },
  specialization_id: { type: DataTypes.INTEGER },
  certification_id: { type: DataTypes.INTEGER },
  experience: { type: DataTypes.INTEGER, allowNull: false },
  salary: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 },
  status: { type: DataTypes.STRING(50), defaultValue: 'active' },
  availability: { type: DataTypes.TINYINT(1), defaultValue: 1 }
}, {
  sequelize,
  modelName: 'Instructor',
  tableName: 'instructors',
  underscored: true,
  timestamps: true // created_at, updated_at
});

Instructor.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Instructor, { foreignKey: 'user_id' });
Instructor.belongsTo(Specialization, { foreignKey: 'specialization_id' });
Instructor.belongsTo(Certification, { foreignKey: 'certification_id' });

class InstructorModel {
    static async findAll() {
        const instructors = await Instructor.findAll({
            include: [User, Specialization, Certification],
            raw: true,
            nest: true
        });
        return instructors.map(i => ({
            ...i,
            userId: i.user_id,
            firstName: i.User.first_name,
            lastName: i.User.last_name,
            email: i.User.email,
            phone: i.User.phone,
            username: i.User.username
        }));
    }

    static async findByUserId(userId) {
        return await Instructor.findOne({ where: { user_id: userId }, raw: true });
    }

    static async create(data) {
        const transaction = await sequelize.transaction();
        try {
            const user = await User.create({
                username: data.username,
                password: data.password || '123456',
                email: data.email,
                first_name: data.firstName,
                last_name: data.lastName,
                phone: data.phone,
                role: 'instructor'
            }, { transaction });

            const instructor = await Instructor.create({
                user_id: user.id,
                license_number: data.license_number || data.license,
                specialization_id: data.specialization_id,
                certification_id: data.certification_id,
                experience: data.experience || 0,
                salary: data.salary || 0,
                status: data.status || 'active',
                availability: data.availability !== undefined ? data.availability : 1
            }, { transaction });

            await transaction.commit();
            return { ...instructor.get({ plain: true }), firstName: user.first_name, lastName: user.last_name, email: user.email };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async update(id, data) {
        const instructor = await Instructor.findByPk(id, { include: [User] });
        if (!instructor) throw new Error('Instructor not found');

        const transaction = await sequelize.transaction();
        try {
            if (data.firstName || data.lastName || data.email || data.phone) {
                await instructor.User.update({
                    first_name: data.firstName || instructor.User.first_name,
                    last_name: data.lastName || instructor.User.last_name,
                    email: data.email || instructor.User.email,
                    phone: data.phone || instructor.User.phone
                }, { transaction });
            }

            await instructor.update({
                license_number: data.license_number || data.license || instructor.license_number,
                specialization_id: data.specialization_id || instructor.specialization_id,
                certification_id: data.certification_id || instructor.certification_id,
                experience: data.experience !== undefined ? data.experience : instructor.experience,
                salary: data.salary !== undefined ? data.salary : instructor.salary,
                status: data.status || instructor.status,
                availability: data.availability !== undefined ? data.availability : instructor.availability
            }, { transaction });

            await transaction.commit();
            return instructor.get({ plain: true });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async delete(id) {
        const instructor = await Instructor.findByPk(id);
        if (!instructor) return false;
        await User.destroy({ where: { id: instructor.user_id } });
        return true;
    }
}

module.exports = { Instructor, InstructorModel };
