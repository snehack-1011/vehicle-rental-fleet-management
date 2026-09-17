const express = require('express');
const Vehicle = require('../models/Vehicle');
const router = express.Router();

router.get('/dashboard', async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments();
    const availableVehicles = await Vehicle.countDocuments({ status: 'AVAILABLE' });
    const reservedVehicles = await Vehicle.countDocuments({ status: 'RESERVED' });
    const rentedVehicles = await Vehicle.countDocuments({ status: 'RENTED' });
    const maintenanceVehicles = await Vehicle.countDocuments({ status: 'MAINTENANCE' });
    const forSaleVehicles = await Vehicle.countDocuments({ status: 'FOR_SALE' });

    res.status(200).json({
      totalVehicles,
      availableVehicles,
      reservedVehicles,
      rentedVehicles,
      maintenanceVehicles,
      forSaleVehicles,
      dailyRevenue: rentedVehicles * 2500, // mock calculation based on rent
      monthlyRevenue: rentedVehicles * 2500 * 30, // mock calculation
      maintenanceCost: maintenanceVehicles * 5000,
      mostRentedVehicle: 'Toyota Innova'
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
});

module.exports = router;
