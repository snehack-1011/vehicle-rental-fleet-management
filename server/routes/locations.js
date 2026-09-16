const express = require('express');
const Location = require('../models/Location');
const router = express.Router();

// GET /api/locations - Fetch all location histories
router.get('/', async (req, res) => {
  try {
    const locations = await Location.find().sort({ timestamp: -1 });
    res.status(200).json({ locations });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching locations', error: err.message });
  }
});

// POST /api/locations - Save a simulated location from the frontend map
router.post('/', async (req, res) => {
  try {
    const { vehicleId, latitude, longitude, timestamp } = req.body;

    const newLocation = await Location.create({
      vehicleId,
      latitude,
      longitude,
      timestamp: timestamp || new Date()
    });

    res.status(201).json({ message: 'Location saved', location: newLocation });
  } catch (err) {
    res.status(500).json({ message: 'Error saving location', error: err.message });
  }
});

module.exports = router;
