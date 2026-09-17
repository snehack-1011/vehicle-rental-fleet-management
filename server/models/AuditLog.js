const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Sometimes we don't have a user (e.g. failed login for unknown email)
  },
  action: {
    type: String,
    required: true,
    enum: ['REGISTER_SUCCESS', 'LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'BOOKING_CREATED', 'BOOKING_CANCELLED']
  },
  ipAddress: {
    type: String,
    default: 'unknown'
  },
  userAgent: {
    type: String,
    default: 'unknown'
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {} // E.g., failed email attempt, but NO PASSWORDS
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
