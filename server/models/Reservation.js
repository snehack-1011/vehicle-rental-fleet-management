const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // e.g. RES12345
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleId: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['RESERVED', 'RENTED', 'RETURNED', 'CANCELLED'],
    default: 'RESERVED'
  },
  priceDetails: {
    basePrice: { type: Number, required: true },
    insurance: { type: Number, default: 0 },
    additionalDriver: { type: Number, default: 0 },
    lateFee: { type: Number, default: 0 },
    damageCharge: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
