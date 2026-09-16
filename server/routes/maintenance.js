const express = require('express');
const Vehicle = require('../models/Vehicle');
const router = express.Router();

// POST /api/maintenance
// Fleet manager can create a maintenance request
router.post('/', async (req, res) => {
  try {
    const { vehicleId, problem, priority, estimatedCost } = req.body;

    const vehicle = await Vehicle.findOne({ id: vehicleId });
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

    if (vehicle.status === 'RENTED' || vehicle.status === 'RESERVED') {
      return res.status(400).json({ message: 'Cannot service a vehicle that is currently rented or reserved.' });
    }

    // Vehicle Lifecycle: (AVAILABLE/DAMAGED -> MAINTENANCE)
    vehicle.status = 'MAINTENANCE';
    vehicle.condition = problem || 'Needs Service';
    await vehicle.save();

    res.status(200).json({ 
      message: 'Maintenance request logged successfully', 
      data: {
        vehicleId,
        problem,
        priority,
        estimatedCost,
        status: 'MAINTENANCE'
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Error logging maintenance request', error: err.message });
  }
});

module.exports = router;
