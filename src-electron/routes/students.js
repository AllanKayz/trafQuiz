const express = require('express');
const router = express.Router();
const StudentModel = require('../models/StudentModel');

router.get('/', (req, res) => {
    try {
        const students = StudentModel.all();
        res.json(students); // Angular expects array directly usually, or wrapped? check existing service.
        // Existing PHP likely returned JSON array.
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', (req, res) => {
    try {
        const student = StudentModel.find(req.params.id);
        if (student) res.json(student);
        else res.status(404).json({ message: 'Not found' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', (req, res) => {
    try {
        const newStudent = StudentModel.create(req.body);
        res.json(newStudent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', (req, res) => {
    try {
        const updated = StudentModel.update(req.params.id, req.body);
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', (req, res) => {
    try {
        const success = StudentModel.delete(req.params.id);
        res.json({ success });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
