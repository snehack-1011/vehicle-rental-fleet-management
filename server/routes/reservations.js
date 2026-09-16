const express = require('express');
const Reservation = require('../models/Reservation');
const Vehicle = require('../models/Vehicle');
const router = express.Router();

// POST /api/reservations - Create a new reservation with Overlap Logic & Pricing Engine
router.post('/', async (req, res) => {
  try {
    const { vehicleId, startDate, endDate, includeInsurance, additionalDriver, userId } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // 1. Fetch Vehicle to get Base Price
    const vehicle = await Vehicle.findOne({ id: vehicleId });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.status === 'MAINTENANCE' || vehicle.status === 'DAMAGED') {
      return res.status(400).json({ message: 'Vehicle is currently under maintenance and cannot be booked.' });
    }

    // 2. MAJOR CHALLENGE: Double Booking Overlap Logic
    // Check if there are any ACTIVE reservations for this vehicle that overlap with requested dates
    const overlappingReservations = await Reservation.find({
      vehicleId: vehicleId,
      status: { $in: ['RESERVED', 'RENTED'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (overlappingReservations.length > 0) {
      return res.status(400).json({ message: 'Vehicle is already booked for these dates.' });
    }

    // 3. PRICING ENGINE
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // at least 1 day

    const basePrice = vehicle.pricePerDay * diffDays;
    const insuranceCost = includeInsurance ? 1500 : 0;
    const additionalDriverCost = additionalDriver ? 800 : 0;

    const totalPrice = basePrice + insuranceCost + additionalDriverCost;

    // 4. Create Reservation
    const newReservation = await Reservation.create({
      id: `RES${Date.now()}`,
      userId: userId || '60d0fe4f5311236168a109ca', // mock user ID if not provided
      vehicleId,
      startDate: start,
      endDate: end,
      status: 'RESERVED',
      priceDetails: {
        basePrice,
        insurance: insuranceCost,
        additionalDriver: additionalDriverCost,
        totalPrice
      }
    });

    // Optionally update vehicle status to RESERVED if booking is for today
    const today = new Date();
    if (start <= today && end >= today) {
       await Vehicle.findOneAndUpdate({ id: vehicleId }, { status: 'RESERVED' });
    }

    res.status(201).json({ message: 'Reservation successful', data: newReservation });
  } catch (err) {
    res.status(500).json({ message: 'Error creating reservation', error: err.message });
  }
});

// GET /api/reservations - Fetch reservations
router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    res.status(200).json({ data: reservations });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching reservations' });
  }
});

// PUT /api/reservations/:id/cancel
router.put('/:id/cancel', async (req, res) => {
  try {
    const reservation = await Reservation.findOneAndUpdate(
      { id: req.params.id },
      { status: 'CANCELLED' },
      { new: true }
    );
    
    if (!reservation) return res.status(404).json({ message: 'Reservation not found' });
    
    // Free up vehicle
    await Vehicle.findOneAndUpdate({ id: reservation.vehicleId }, { status: 'AVAILABLE' });

    res.status(200).json({ message: 'Reservation cancelled', data: reservation });
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling reservation' });
  }
});

module.exports = router;
