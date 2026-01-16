const express = require('express');
const router = express.Router();
const VehicleModel = require('../models/VehicleModel');

router.get('/', (req, res) => {
    try {
        const vehicles = VehicleModel.all();
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', (req, res) => {
    try {
        const vehicle = VehicleModel.create(req.body);
        res.json(vehicle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', (req, res) => {
    try {
        const vehicle = VehicleModel.update(req.params.id, req.body);
        res.json(vehicle);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
