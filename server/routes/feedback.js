const express = require('express');
const Feedback = require('../models/Feedback');
const router = express.Router();

// GET /api/feedback - Get all feedback
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ timestamp: -1 });
    res.status(200).json({ feedbacks });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching feedback', error: err.message });
  }
});

// POST /api/feedback - Submit new feedback
router.post('/', async (req, res) => {
  try {
    const { reservationId, vehicleId, customerEmail, rating, review } = req.body;

    const newFeedback = await Feedback.create({
      reservationId,
      vehicleId,
      customerEmail,
      rating,
      review
    });

    res.status(201).json({ message: 'Feedback submitted successfully', feedback: newFeedback });
  } catch (err) {
    res.status(500).json({ message: 'Error saving feedback', error: err.message });
  }
});

module.exports = router;
