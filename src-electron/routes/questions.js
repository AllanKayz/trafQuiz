const express = require('express');
const router = express.Router();
const QuestionModel = require('../models/QuestionModel');
const ExamModel = require('../models/ExamModel');

router.get('/exam/:examId', (req, res) => {
    try {
        const questions = QuestionModel.getByExamId(req.params.examId);
        res.json(questions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/check-answer', (req, res) => {
    try {
        const { questionId, selectedOption } = req.body;
        const isCorrect = QuestionModel.checkAnswer(questionId, selectedOption);
        res.json({ correct: isCorrect });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/exams', (req, res) => {
    try {
        const exams = ExamModel.all();
        res.json(exams);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/exams', (req, res) => {
    try {
        const exam = ExamModel.create(req.body);
        res.json(exam);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
