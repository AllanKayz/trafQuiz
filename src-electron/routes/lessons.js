const express = require('express');
const router = express.Router();
const LessonModel = require('../models/LessonModel');

router.get('/', (req, res) => {
    try {
        const lessons = LessonModel.all();
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', (req, res) => {
    try {
        const lesson = LessonModel.create(req.body);
        res.json(lesson);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', (req, res) => {
    try {
        const lesson = LessonModel.update(req.params.id, req.body);
        res.json(lesson);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
