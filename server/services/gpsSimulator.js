const Location = require('../models/Location');
const Vehicle = require('../models/Vehicle');

let intervalId = null;

// Base coordinates for default city centers
const CITY_COORDINATES = {
  Hyderabad: { lat: 17.3850, lng: 78.4867 },
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Mumbai: { lat: 19.0760, lng: 72.8777 },
  Delhi: { lat: 28.6139, lng: 77.2090 },
  Chennai: { lat: 13.0827, lng: 80.2707 },
  Pune: { lat: 18.5204, lng: 73.8567 }
};

const DEFAULT_CENTER = { lat: 17.3850, lng: 78.4867 };

/**
 * Starts the backend GPS location simulator.
 * Periodically updates coordinates for vehicles with status 'RENTED'.
 */
const startGpsSimulator = () => {
  if (intervalId) {
    console.log('[GPS Simulator] Simulator is already running.');
    return;
  }

  const intervalMs = parseInt(process.env.GPS_UPDATE_INTERVAL, 10) || 5000;
  console.log(`[GPS Simulator] Backend GPS Simulator initialized (Update interval: ${intervalMs}ms).`);

  intervalId = setInterval(async () => {
    try {
      // Find vehicles that are currently rented out
      const rentedVehicles = await Vehicle.find({ status: 'RENTED' });

      if (!rentedVehicles || rentedVehicles.length === 0) {
        return;
      }

      for (const vehicle of rentedVehicles) {
        const vehicleId = vehicle.id;

        // Find the latest location log for this vehicle
        const lastLocation = await Location.findOne({ vehicleId }).sort({ timestamp: -1 });

        let currentLat, currentLng;

        if (lastLocation && typeof lastLocation.latitude === 'number' && typeof lastLocation.longitude === 'number') {
          currentLat = lastLocation.latitude;
          currentLng = lastLocation.longitude;
        } else {
          // Initialize near city coordinates or default center
          const cityCoords = CITY_COORDINATES[vehicle.location] || DEFAULT_CENTER;
          currentLat = cityCoords.lat;
          currentLng = cityCoords.lng;
        }

        // Small realistic movement (approx 30-100 meters per 5s step)
        const latDelta = (Math.random() - 0.48) * 0.0015;
        const lngDelta = (Math.random() - 0.48) * 0.0015;

        const newLat = parseFloat((currentLat + latDelta).toFixed(6));
        const newLng = parseFloat((currentLng + lngDelta).toFixed(6));

        await Location.create({
          vehicleId,
          latitude: newLat,
          longitude: newLng,
          timestamp: new Date()
        });
      }
    } catch (err) {
      console.error('[GPS Simulator] Error updating locations:', err.message);
    }
  }, intervalMs);
};

/**
 * Stops the backend GPS location simulator.
 */
const stopGpsSimulator = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log('[GPS Simulator] Simulator stopped.');
  }
};

module.exports = {
  startGpsSimulator,
  stopGpsSimulator
};
