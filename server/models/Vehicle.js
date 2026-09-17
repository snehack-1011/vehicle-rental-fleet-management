const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // custom ID like V001
  model: { type: String, required: true },
  type: { type: String, required: true }, // HATCHBACK, SEDAN, SUV, LUXURY, ELECTRIC
  location: { type: String, required: true }, // Bengaluru, Hyderabad, etc.
  status: { type: String, default: 'AVAILABLE' }, // AVAILABLE, RESERVED, RENTED, MAINTENANCE, DAMAGED
  pricePerDay: { type: Number, required: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  distanceKm: { type: Number, default: 5 },
  seats: { type: Number, default: 5 },
  fuelType: { type: String, default: 'PETROL' },
  transmission: { type: String, default: 'AUTOMATIC' },
  condition: { type: String, default: 'Excellent' }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
