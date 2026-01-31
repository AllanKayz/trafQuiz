const { sequelize } = require('../database');
const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');

class User extends Model {}

User.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  username: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.STRING(50), allowNull: false, defaultValue: 'user' },
  first_name: { type: DataTypes.STRING(100) },
  last_name: { type: DataTypes.STRING(100) },
  email: { type: DataTypes.STRING(255) },
  phone: { type: DataTypes.STRING(255) },
  avatar: { type: DataTypes.STRING(500) },
  reset_token: { type: DataTypes.STRING(255) },
  reset_expires: { type: DataTypes.DATE },
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password && !user.password.startsWith('$2y$') && !user.password.startsWith('$2b$')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
    beforeUpdate: async (user) => {
        if (user.changed('password') && !user.password.startsWith('$2y$') && !user.password.startsWith('$2b$')) {
            user.password = await bcrypt.hash(user.password, 10);
        }
    }
  }
});

class UserModel {
    static async findByEmail(email) {
        return await User.findOne({ where: { email }, raw: true });
    }

    static async findByUsername(username) {
        return await User.findOne({ where: { username }, raw: true });
    }

    static async find(id) {
        return await User.findByPk(id, { raw: true });
    }

    static async verifyPassword(user, password) {
        if (!user || !user.password) return false;
        return await bcrypt.compare(password, user.password);
    }

    static async create(data) {
        // Map camelCase from frontend if needed, but better to keep it consistent
        const user = await User.create({
            username: data.username,
            first_name: data.firstName || data.first_name,
            last_name: data.lastName || data.last_name,
            email: data.email,
            password: data.password,
            role: data.role,
            phone: data.phone
        });
        return user.get({ plain: true });
    }

    static async update(id, data) {
        const user = await User.findByPk(id);
        if (!user) throw new Error('User not found');
        
        // Map fields
        const updateData = {};
        if (data.username) updateData.username = data.username;
        if (data.firstName || data.first_name) updateData.first_name = data.firstName || data.first_name;
        if (data.lastName || data.last_name) updateData.last_name = data.lastName || data.last_name;
        if (data.email) updateData.email = data.email;
        if (data.role) updateData.role = data.role;
        if (data.phone) updateData.phone = data.phone;
        if (data.avatar) updateData.avatar = data.avatar;

        await user.update(updateData);
        return user.get({ plain: true });
    }

    static async updatePassword(id, newPassword) {
        const user = await User.findByPk(id);
        if (!user) throw new Error('User not found');
        user.password = newPassword; // Hook handles hashing
        await user.save();
        return true;
    }

    static async delete(id) {
        return await User.destroy({ where: { id } });
    }

    static async findAll() {
        return await User.findAll({ raw: true });
    }
}

module.exports = { User, UserModel };
