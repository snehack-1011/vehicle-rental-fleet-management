const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const vehicleRoutes = require('./routes/vehicles');
const adminRoutes = require('./routes/admin');
const reservationRoutes = require('./routes/reservations');
const rentalRoutes = require('./routes/rentals');
const maintenanceRoutes = require('./routes/maintenance');
const locationRoutes = require('./routes/locations');
const feedbackRoutes = require('./routes/feedback');
const { MongoMemoryServer } = require('mongodb-memory-server');
const seedVehicles = require('./seed');
const Vehicle = require('./models/Vehicle');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/feedback', feedbackRoutes);

const PORT = process.env.PORT || 5000;

// Start Server with Memory Database
const startServer = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;
    
    // If no URI is provided, spin up a temporary memory server
    if (!mongoUri) {
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log('Started In-Memory MongoDB Server for development.');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Auto-seed database if empty
    const vehicleCount = await Vehicle.countDocuments();
    if (vehicleCount === 0) {
      await Vehicle.insertMany(seedVehicles);
      console.log(`Successfully seeded ${seedVehicles.length} realistic vehicles into the database!`);
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('password123', 12);
      await User.insertMany([
        { fullName: 'Test Customer', email: 'customer@test.com', password: hashedPassword, role: 'CUSTOMER' },
        { fullName: 'Test Fleet Manager', email: 'fleet@test.com', password: hashedPassword, role: 'FLEET_MANAGER' },
        { fullName: 'Test Admin', email: 'admin@test.com', password: hashedPassword, role: 'ADMIN' },
        { fullName: 'Ananya', email: 'ananyaa962@gmail.com', password: hashedPassword, role: 'CUSTOMER' }
      ]);
      console.log('Successfully seeded default users (customer@test.com, fleet@test.com, admin@test.com - password: password123)');
    }

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.log('Error starting server:', err);
  }
};

startServer();
