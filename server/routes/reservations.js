const express = require('express');
const mongoose = require('mongoose');
const Reservation = require('../models/Reservation');
const Vehicle = require('../models/Vehicle');
const User = require('../models/User');
const { logAudit } = require('../utils/logger');
const { sendBookingConfirmationEmail } = require('../services/emailService');
const { auth } = require('../middleware/auth');
const router = express.Router();

// POST /api/reservations - Create a new reservation with Overlap Logic & Pricing Engine
// auth middleware verifies the JWT and populates req.userId with the logged-in customer's MongoDB _id
router.post('/', auth, async (req, res) => {
  try {
    // Use the authenticated user's ID from the verified JWT — do NOT trust req.body.userId
    const authenticatedUserId = req.userId;

    const { vehicleId, startDate, endDate, includeInsurance, additionalDriver } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // 1. Fetch the authenticated customer from the database to get their email
    const authenticatedCustomer = await User.findById(authenticatedUserId);
    if (!authenticatedCustomer) {
      return res.status(401).json({ message: 'Authenticated user not found. Please log in again.' });
    }

    // 2. Fetch Vehicle to get Base Price
    const vehicle = await Vehicle.findOne({ id: vehicleId });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    if (vehicle.status === 'MAINTENANCE' || vehicle.status === 'DAMAGED') {
      return res.status(400).json({ message: 'Vehicle is currently under maintenance and cannot be booked.' });
    }

    // 3. MAJOR CHALLENGE: Double Booking Overlap Logic
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

    // 4. PRICING ENGINE
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1; // at least 1 day

    const basePrice = vehicle.pricePerDay * diffDays;
    const insuranceCost = includeInsurance ? 1500 : 0;
    const additionalDriverCost = additionalDriver ? 800 : 0;

    const totalPrice = basePrice + insuranceCost + additionalDriverCost;

    // 5. Create Reservation — userId comes from the verified JWT, not from the request body
    const newReservation = await Reservation.create({
      id: `RES${Date.now()}`,
      userId: authenticatedUserId,
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

    await logAudit(req, 'BOOKING_CREATED', newReservation.userId, { reservationId: newReservation.id, vehicleId: vehicleId });

    // 6. Send automatic booking confirmation email to the authenticated customer's registered email
    // Isolated in try-catch so email failures never cancel a valid booking
    try {
      // The recipient email comes ONLY from the authenticated customer's DB document
      // EMAIL_USER is only the sender — it is never used as the recipient here
      const recipientEmail = authenticatedCustomer.email;
      const recipientName = authenticatedCustomer.fullName || 'Valued Customer';

      console.log(`[Reservations API] Sending confirmation email to authenticated customer: ${recipientEmail} (userId: ${authenticatedUserId})`);

      sendBookingConfirmationEmail({
        bookingId: newReservation.id,
        bookingStatus: newReservation.status || 'CONFIRMED',
        customerName: recipientName,
        customerEmail: recipientEmail,
        vehicleName: vehicle.model,
        vehicleId: vehicle.id,
        vehicleType: vehicle.type,
        registrationNumber: vehicle.id,
        fuelType: vehicle.fuelType || 'PETROL',
        transmission: vehicle.transmission || 'AUTOMATIC',
        seats: vehicle.seats || 5,
        pickupLocation: vehicle.location || 'Main Depot',
        pickupDate: newReservation.startDate,
        pickupTime: '10:00 AM',
        returnLocation: vehicle.location || 'Main Depot',
        returnDate: newReservation.endDate,
        returnTime: '10:00 AM',
        rentalDuration: `${diffDays} day${diffDays > 1 ? 's' : ''}`,
        basePrice: basePrice,
        insurance: insuranceCost,
        otherFees: additionalDriverCost,
        discount: 0,
        totalAmount: totalPrice,
        paymentStatus: 'PENDING'
      }).catch((emailErr) => {
        console.error(`[Reservations API] Background email dispatch failed for ${recipientEmail}:`, emailErr.message);
      });
    } catch (emailProcessingError) {
      console.error('[Reservations API] Email processing error:', emailProcessingError.message);
    }

    res.status(201).json({ message: 'Reservation successful', data: newReservation });
  } catch (err) {
    console.error(err);
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

    await logAudit(req, 'BOOKING_CANCELLED', reservation.userId, { reservationId: reservation.id });

    res.status(200).json({ message: 'Reservation cancelled', data: reservation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error cancelling reservation' });
  }
});

module.exports = router;
