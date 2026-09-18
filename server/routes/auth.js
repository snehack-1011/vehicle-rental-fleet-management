const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { logAudit } = require('../utils/logger');
const { auth } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Input Validation chains
const registerValidation = [
  body('fullName').notEmpty().withMessage('Full name is required').trim().escape(),
  body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['CUSTOMER', 'FLEET_MANAGER', 'ADMIN']).withMessage('Invalid role specified')
];

const loginValidation = [
  body('email').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
];

router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { fullName, email, password, phone, licenseNumber, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userRole = role || 'CUSTOMER';

    const newUser = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
      licenseNumber,
      role: userRole
    });

    await logAudit(req, 'REGISTER_SUCCESS', newUser._id, { email: newUser.email, role: newUser.role });
    res.status(201).json({ message: 'User registered successfully', user: { id: newUser._id, email: newUser.email, role: newUser.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      await logAudit(req, 'LOGIN_FAILED', null, { email, reason: 'User not found' });
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      await logAudit(req, 'LOGIN_FAILED', user._id, { email, reason: 'Invalid credentials' });
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    await logAudit(req, 'LOGIN_SUCCESS', user._id, { email: user.email, role: user.role });

    res.status(200).json({ result: { id: user._id, fullName: user.fullName, email: user.email, role: user.role }, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/logout', auth, async (req, res) => {
  try {
    await logAudit(req, 'LOGOUT', req.userId, { message: 'User logged out' });
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
