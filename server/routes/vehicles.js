const express = require('express');
const Vehicle = require('../models/Vehicle');
const router = express.Router();

// GET all vehicles (with filters)
router.get('/', async (req, res) => {
  try {
    const { location, type, status } = req.query;
    let query = {};
    if (location) query.location = new RegExp(location, 'i');
    if (type && type !== 'ALL') query.type = type;
    if (status) query.status = status;
    
    const vehicles = await Vehicle.find(query);
    res.status(200).json(vehicles);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching vehicles' });
  }
});

// GET vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ id: req.params.id });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.status(200).json({ data: vehicle });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching vehicle' });
  }
});

// POST add vehicle
router.post('/', async (req, res) => {
  try {
    const newVehicle = await Vehicle.create(req.body);
    res.status(201).json({ message: 'Vehicle created', data: newVehicle });
  } catch (err) {
    res.status(500).json({ message: 'Error creating vehicle', error: err.message });
  }
});

// PUT update vehicle
router.put('/:id', async (req, res) => {
  try {
    const updatedVehicle = await Vehicle.findOneAndUpdate({ $or: [{ id: req.params.id }, { _id: req.params.id }] }, req.body, { new: true });
    res.status(200).json({ message: 'Vehicle updated', data: updatedVehicle });
  } catch (err) {
    res.status(500).json({ message: 'Error updating vehicle', error: err.message });
  }
});

// DELETE vehicle
router.delete('/:id', async (req, res) => {
  try {
    await Vehicle.findOneAndDelete({ $or: [{ id: req.params.id }, { _id: req.params.id }] });
    res.status(200).json({ message: 'Vehicle deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting vehicle' });
  }
});

module.exports = router;
