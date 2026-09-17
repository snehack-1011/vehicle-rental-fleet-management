const express = require('express');
const Reservation = require('../models/Reservation');
const Vehicle = require('../models/Vehicle');
const router = express.Router();

// POST /api/rentals/start
router.post('/start', async (req, res) => {
  try {
    const { reservationId } = req.body;
    
    // Find reservation
    const reservation = await Reservation.findOne({ id: reservationId });
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    
    if (reservation.status !== 'RESERVED') {
      return res.status(400).json({ message: 'Only RESERVED vehicles can be started.' });
    }

    // Update Reservation
    reservation.status = 'RENTED';
    await reservation.save();

    // Update Vehicle Lifecycle (RESERVED -> RENTED)
    await Vehicle.findOneAndUpdate({ id: reservation.vehicleId }, { status: 'RENTED' });

    res.status(200).json({ message: 'Rental started successfully', data: reservation });
  } catch (err) {
    res.status(500).json({ message: 'Error starting rental', error: err.message });
  }
});

// POST /api/rentals/:id/return
router.post('/:id/return', async (req, res) => {
  try {
    const reservationId = req.params.id;
    const { damageDetected } = req.body; // boolean from frontend inspection
    const actualReturnTime = new Date();

    const reservation = await Reservation.findOne({ id: reservationId });
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });

    if (reservation.status !== 'RENTED') {
      return res.status(400).json({ message: 'Vehicle is not currently rented out.' });
    }

    // CHALLENGING REQUIREMENT: Late Return Calculation
    const expectedReturnTime = new Date(reservation.endDate);
    
    // If returned late, charge 500 INR per late hour
    if (actualReturnTime > expectedReturnTime) {
      const lateMs = actualReturnTime - expectedReturnTime;
      const lateHours = Math.ceil(lateMs / (1000 * 60 * 60)); // rounded up hours
      const latePenalty = lateHours * 500;
      
      reservation.priceDetails.lateFee = latePenalty;
      reservation.priceDetails.totalPrice += latePenalty;
    }

    // Damage Charge
    if (damageDetected) {
      reservation.priceDetails.damageCharge = 5000; // Flat damage fee for example
      reservation.priceDetails.totalPrice += 5000;
    }

    reservation.status = 'RETURNED';
    await reservation.save();

    // Update Vehicle Lifecycle (RENTED -> RETURNED -> INSPECTION / DAMAGED)
    const nextStatus = damageDetected ? 'DAMAGED' : 'AVAILABLE'; // Ideally goes to INSPECTION first, but AVAILABLE is fine for simplicity unless requested
    
    await Vehicle.findOneAndUpdate({ id: reservation.vehicleId }, { status: nextStatus });

    res.status(200).json({ message: 'Vehicle returned successfully', data: reservation });
  } catch (err) {
    res.status(500).json({ message: 'Error returning vehicle', error: err.message });
  }
});

module.exports = router;
