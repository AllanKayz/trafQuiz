const { sequelize } = require('../database');
const { DataTypes, Model } = require('sequelize');

class Exam extends Model {}
Exam.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(100), allowNull: false },
  start_time: { type: DataTypes.DATE, allowNull: false },
  end_time: { type: DataTypes.DATE, allowNull: false }
}, { sequelize, modelName: 'Exam', tableName: 'exams', underscored: true });

class StudentExamHistory extends Model {}
StudentExamHistory.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    exam_id: { type: DataTypes.INTEGER, allowNull: false },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { sequelize, modelName: 'StudentExamHistory', tableName: 'student_exam_history', underscored: true, timestamps: false });

class ExamTimeframe extends Model {}
ExamTimeframe.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    exam_id: { type: DataTypes.INTEGER, allowNull: false },
    period: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 30 }
}, { sequelize, modelName: 'ExamTimeframe', tableName: 'exam_timeframe', underscored: true });

class ExamModel {
    static async findAll() {
        return await Exam.findAll({ raw: true });
    }

    static async find(id) {
        return await Exam.findByPk(id, { raw: true });
    }

    static async create(data) {
        const exam = await Exam.create(data);
        return exam.get({ plain: true });
    }

    static async update(id, data) {
        const exam = await Exam.findByPk(id);
        if (!exam) throw new Error('Exam not found');
        await exam.update(data);
        return exam.get({ plain: true });
    }

    static async delete(id) {
        return await Exam.destroy({ where: { id } });
    }
}

module.exports = { Exam, ExamModel, StudentExamHistory, ExamTimeframe };
