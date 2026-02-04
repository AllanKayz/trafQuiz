const { sequelize } = require('../database');
const { DataTypes, Model } = require('sequelize');

class Category extends Model {}
Category.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT }
}, { sequelize, modelName: 'Category', tableName: 'categories', underscored: true, timestamps: false });

class CategoryModel {
    static async findAll() {
        return await Category.findAll({ raw: true });
    }

    static async create(data) {
        const category = await Category.create(data);
        return category.get({ plain: true });
    }

    static async update(id, data) {
        const category = await Category.findByPk(id);
        if (!category) throw new Error('Category not found');
        await category.update(data);
        return category.get({ plain: true });
    }

    static async count() {
        return await Category.count();
    }

    static async delete(id) {
        return await Category.destroy({ where: { id } });
    }
}

module.exports = { Category, CategoryModel };
