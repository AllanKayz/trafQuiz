const express = require('express');
const router = express.Router();
const InstructorModel = require('../models/InstructorModel');

router.get('/', (req, res) => {
    try {
        const instructors = InstructorModel.all();
        res.json(instructors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', (req, res) => {
    try {
        const instructor = InstructorModel.find(req.params.id);
        if (instructor) res.json(instructor);
        else res.status(404).json({ message: 'Not found' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', (req, res) => {
    try {
        const instructor = InstructorModel.create(req.body);
        res.json(instructor);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
