require("dotenv").config();
const { MongoClient } = require("mongodb");

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017";

const DB_NAME =
  process.env.DB_NAME || "vehicle_rental_platform";

const vehicles = [
  {
    id: "CAR1001",
    model: "Hyundai Creta",
    type: "SUV",
    location: "Hyderabad",
    status: "AVAILABLE",
    pricePerDay: 2500,
    createdAt: new Date()
  },
  {
    id: "CAR1002",
    model: "Maruti Swift",
    type: "HATCHBACK",
    location: "Hyderabad",
    status: "AVAILABLE",
    pricePerDay: 2000,
    createdAt: new Date()
  },
  {
    id: "CAR1003",
    model: "Honda City",
    type: "SEDAN",
    location: "Hyderabad",
    status: "RESERVED",
    pricePerDay: 2800,
    createdAt: new Date()
  },
  {
    id: "CAR1004",
    model: "Tata Nexon EV",
    type: "ELECTRIC",
    location: "Hyderabad",
    status: "AVAILABLE",
    pricePerDay: 2700,
    createdAt: new Date()
  },
  {
    id: "CAR1005",
    model: "Toyota Camry",
    type: "LUXURY",
    location: "Hyderabad",
    status: "RENTED",
    pricePerDay: 4500,
    createdAt: new Date()
  },
  {
    id: "CAR1006",
    model: "Hyundai Venue",
    type: "SUV",
    location: "Hyderabad",
    status: "MAINTENANCE",
    pricePerDay: 2400,
    createdAt: new Date()
  }
];

async function seedVehicles() {
  const client = new MongoClient(MONGO_URI);

  try {
    await client.connect();

    const db = client.db(DB_NAME);
    const collection = db.collection("vehicles");

    for (const vehicle of vehicles) {
      await collection.updateOne(
        { id: vehicle.id },
        { $set: vehicle },
        { upsert: true }
      );
    }

    console.log("Vehicle seed data added successfully.");

    const allVehicles = await collection.find({}).toArray();

    console.log("\nVehicles in database:");
    allVehicles.forEach((vehicle) => {
      console.log(
        `${vehicle.id} - ${vehicle.model} - ${vehicle.type} - ${vehicle.status}`
      );
    });
  } catch (error) {
    console.error("Error adding vehicle seed data:", error);
  } finally {
    await client.close();
  }
}

seedVehicles();