const { sequelize } = require('../database');
const { DataTypes, Model } = require('sequelize');
const { Exam } = require('./ExamModel');

class Question extends Model {}

Question.init({
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  question_text: { type: DataTypes.TEXT },
  img_insert: { type: DataTypes.STRING(300) },
  option_image: { type: DataTypes.TINYINT(4), defaultValue: 0 },
  option_a: { type: DataTypes.TEXT },
  option_b: { type: DataTypes.TEXT },
  option_c: { type: DataTypes.TEXT },
  correct_option: { type: DataTypes.STRING(45) },
  exam_id: { type: DataTypes.INTEGER },
  answer: { type: DataTypes.STRING(255), allowNull: false }
}, {
  sequelize,
  modelName: 'Question',
  tableName: 'questions',
  underscored: true,
  timestamps: false
});

Question.belongsTo(Exam, { foreignKey: 'exam_id' });
Exam.hasMany(Question, { foreignKey: 'exam_id' });

class QuestionModel {
    static async findAll() {
        return await Question.findAll({
            attributes: [
                'id',
                ['question_text', 'question'],
                'option_a',
                'option_b',
                'option_c',
                'answer',
                ['img_insert', 'photo'],
                'exam_id'
            ],
            raw: true
        });
    }

    static async findByExam(examId) {
        return await Question.findAll({
            where: { exam_id: examId },
            attributes: [
                'id',
                ['question_text', 'question'],
                'option_a',
                'option_b',
                'option_c',
                'answer',
                ['img_insert', 'photo'],
                'exam_id'
            ],
            raw: true
        });
    }

    static async create(data) {
        const questionData = {
            question_text: data.question || data.question_text,
            option_a: data.option_a || (data.options ? data.options[0] : ''),
            option_b: data.option_b || (data.options ? data.options[1] : ''),
            option_c: data.option_c || (data.options ? data.options[2] : ''),
            answer: data.answer !== undefined ? data.answer : (data.options ? data.options[data.correct] : ''),
            img_insert: data.photo || data.img_insert || data.image,
            exam_id: data.exam_id
        };
        const question = await Question.create(questionData);
        return question.get({ plain: true });
    }

    static async bulkCreate(dataArray) {
        const questions = dataArray.map(data => ({
            question_text: data.question || data.question_text,
            option_a: data.option_a || (data.options ? data.options[0] : ''),
            option_b: data.option_b || (data.options ? data.options[1] : ''),
            option_c: data.option_c || (data.options ? data.options[2] : ''),
            answer: data.answer !== undefined ? data.answer : (data.options ? data.options[data.correct] : ''),
            img_insert: data.photo || data.img_insert || data.image,
            exam_id: data.exam_id
        }));
        return await Question.bulkCreate(questions);
    }

    static async update(id, data) {
        const question = await Question.findByPk(id);
        if (!question) throw new Error('Question not found');
        await question.update({
            question_text: data.question || data.question_text || question.question_text,
            option_a: data.option_a || question.option_a,
            option_b: data.option_b || question.option_b,
            option_c: data.option_c || question.option_c,
            answer: data.answer || question.answer,
            img_insert: data.photo || data.img_insert || question.img_insert,
            exam_id: data.exam_id || question.exam_id
        });
        return question.get({ plain: true });
    }

    static async count() {
        return await Question.count();
    }

    static async countReviewed() {
        // Assuming a question is "reviewed" if it has an answer or based on some other criteria.
        // For now, let's count questions with non-empty answers.
        const { Op } = require('sequelize');
        return await Question.count({ 
            where: { 
                answer: { [Op.ne]: '' } 
            } 
        });
    }

    static async delete(id) {
        return await Question.destroy({ where: { id } });
    }
}

module.exports = { Question, QuestionModel };
