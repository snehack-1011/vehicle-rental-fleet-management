const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  licenseNumber: { type: String },
  role: { 
    type: String, 
    enum: ['CUSTOMER', 'FLEET_MANAGER', 'ADMIN'], 
    default: 'CUSTOMER' 
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
