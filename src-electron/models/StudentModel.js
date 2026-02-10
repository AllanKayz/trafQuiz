const { sequelize } = require('../database');
const { DataTypes, Model } = require('sequelize');
const { User } = require('./UserModel');

class Student extends Model {}

Student.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'users', key: 'id' }
  },
  address: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING(50), defaultValue: 'active' },
  package_id: { type: DataTypes.INTEGER }
}, {
  sequelize,
  modelName: 'Student',
  tableName: 'students',
  underscored: true,
  timestamps: false // matching sqlite_schema.sql which only has created_at
});

// Associations
Student.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(Student, { foreignKey: 'user_id' });

class StudentModel {
    static async all(instructorId = null) {
        // If we want to filter by instructorId, we'd need to join with lessons or assigned instructors if that existed
        // But current schema doesn't have a direct student-instructor link outside of lessons.
        // However, StudentModel.all in original code was just query('SELECT students.*, users.first_name, ...')

        const students = await Student.findAll({
            include: [User],
            order: [[Sequelize.literal('Student.created_at'), 'DESC']],
            raw: true,
            nest: true
        });

        // Flatten for frontend compatibility
        return students.map(s => ({
            ...s,
            userId: s.user_id,
            firstName: s.User.first_name,
            lastName: s.User.last_name,
            email: s.User.email,
            phone: s.User.phone,
            username: s.User.username
        }));
    }

    static async findByUserId(userId) {
        return await Student.findOne({ where: { user_id: userId }, raw: true });
    }

    static async create(data) {
        const { User: UserModelClass } = require('./UserModel');

        const transaction = await sequelize.transaction();
        try {
            const user = await User.create({
                username: data.username,
                password: data.password || '123456',
                email: data.email,
                first_name: data.firstName,
                last_name: data.lastName,
                phone: data.phone,
                role: 'student'
            }, { transaction });

            const student = await Student.create({
                user_id: user.id,
                address: data.address,
                package_id: data.packageId || data.package_id,
                status: data.status || 'active'
            }, { transaction });

            await transaction.commit();
            return { ...student.get({ plain: true }), firstName: user.first_name, lastName: user.last_name, email: user.email };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async update(id, data) {
        const student = await Student.findByPk(id, { include: [User] });
        if (!student) throw new Error('Student not found');

        const transaction = await sequelize.transaction();
        try {
            if (data.firstName || data.lastName || data.email || data.phone) {
                await student.User.update({
                    first_name: data.firstName || student.User.first_name,
                    last_name: data.lastName || student.User.last_name,
                    email: data.email || student.User.email,
                    phone: data.phone || student.User.phone
                }, { transaction });
            }

            await student.update({
                address: data.address || student.address,
                status: data.status || student.status,
                package_id: data.packageId || data.package_id || student.package_id
            }, { transaction });

            await transaction.commit();
            return student.get({ plain: true });
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    static async delete(id) {
        const student = await Student.findByPk(id);
        if (!student) return false;
        // User will be deleted due to CASCADE if we delete the user.
        // But if we delete the student, we might want to keep the user?
        // Typically in this app, student IS the user.
        await User.destroy({ where: { id: student.user_id } });
        return true;
    }
}

// We need to import Sequelize for the order literal if used, but let's just use standard order
const { Sequelize } = require('sequelize');

module.exports = { Student, StudentModel };
