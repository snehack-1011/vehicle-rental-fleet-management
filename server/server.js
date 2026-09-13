const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017";

const DB_NAME =
  process.env.DB_NAME || "vehicle_rental_platform";

const client = new MongoClient(MONGO_URI);

let db;


// =====================================================
// MONGODB CONNECTION
// =====================================================

async function connectDatabase() {
  try {
    await client.connect();

    db = client.db(DB_NAME);

    console.log("MongoDB connected successfully");
    console.log(`Database: ${DB_NAME}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
}


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Vehicle Rental Backend is running",
  });
});


// =====================================================
// REGISTER
// =====================================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "CUSTOMER",
      createdAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      userId: result.insertedId,
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
});


// =====================================================
// LOGIN
// =====================================================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});


// =====================================================
// ADMIN DASHBOARD
// =====================================================

app.get("/api/admin/dashboard", async (req, res) => {
  try {
    const vehiclesCollection = db.collection("vehicles");
    const invoicesCollection = db.collection("invoices");
    const maintenanceCollection = db.collection("maintenance");
    const rentalsCollection = db.collection("rentals");

    const vehicles = await vehiclesCollection
      .find({})
      .toArray();

    const totalVehicles = vehicles.length;

    const availableVehicles = vehicles.filter(
      (vehicle) =>
        String(vehicle.status).toUpperCase() === "AVAILABLE"
    ).length;

    const reservedVehicles = vehicles.filter(
      (vehicle) =>
        String(vehicle.status).toUpperCase() === "RESERVED"
    ).length;

    const rentedVehicles = vehicles.filter(
      (vehicle) =>
        String(vehicle.status).toUpperCase() === "RENTED"
    ).length;

    const maintenanceVehicles = vehicles.filter(
      (vehicle) =>
        String(vehicle.status).toUpperCase() === "MAINTENANCE"
    ).length;


    // -----------------------------
    // DAILY REVENUE
    // -----------------------------

    const today = new Date();

    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfTomorrow = new Date(startOfDay);
    startOfTomorrow.setDate(
      startOfTomorrow.getDate() + 1
    );

    const invoices = await invoicesCollection
      .find({})
      .toArray();

    let dailyRevenue = 0;
    let monthlyRevenue = 0;

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    invoices.forEach((invoice) => {
      const amount = Number(
        invoice.totalAmount ||
        invoice.total ||
        invoice.amount ||
        0
      );

      const invoiceDate = new Date(
        invoice.createdAt ||
        invoice.date ||
        today
      );

      if (
        invoiceDate >= startOfDay &&
        invoiceDate < startOfTomorrow
      ) {
        dailyRevenue += amount;
      }

      if (
        invoiceDate.getMonth() === currentMonth &&
        invoiceDate.getFullYear() === currentYear
      ) {
        monthlyRevenue += amount;
      }
    });


    // -----------------------------
    // MAINTENANCE COST
    // -----------------------------

    const maintenanceRecords =
      await maintenanceCollection
        .find({})
        .toArray();

    let maintenanceCost = 0;

    maintenanceRecords.forEach((record) => {
      maintenanceCost += Number(
        record.cost ||
        record.maintenanceCost ||
        0
      );
    });


    // -----------------------------
    // MOST RENTED VEHICLE
    // -----------------------------

    const rentals = await rentalsCollection
      .find({})
      .toArray();

    const rentalCounts = {};

    rentals.forEach((rental) => {
      const vehicleId =
        rental.vehicleId ||
        rental.vehicle;

      if (vehicleId) {
        const key = String(vehicleId);

        rentalCounts[key] =
          (rentalCounts[key] || 0) + 1;
      }
    });

    let mostRentedVehicle = null;

    const rentalEntries =
      Object.entries(rentalCounts);

    if (rentalEntries.length > 0) {
      rentalEntries.sort(
        (a, b) => b[1] - a[1]
      );

      const [vehicleId, rentalCount] =
        rentalEntries[0];

      const vehicle =
        await vehiclesCollection.findOne({
          $or: [
            { _id: ObjectId.isValid(vehicleId)
                ? new ObjectId(vehicleId)
                : null
            },
            { id: vehicleId },
            { vehicleId: vehicleId },
          ],
        });

      mostRentedVehicle = {
        id: vehicleId,
        name:
          vehicle?.name ||
          vehicle?.vehicleName ||
          "Unknown Vehicle",
        rentals: rentalCount,
      };
    }


    res.json({
      success: true,
      dashboard: {
        totalVehicles,
        availableVehicles,
        reservedVehicles,
        currentlyRented: rentedVehicles,
        underMaintenance: maintenanceVehicles,
        dailyRevenue,
        monthlyRevenue,
        maintenanceCost,
        mostRentedVehicle,
      },
    });
  } catch (error) {
    console.error(
      "Admin dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while loading admin dashboard",
    });
  }
});


// =====================================================
// GET ALL VEHICLES
// =====================================================

app.get("/api/vehicles", async (req, res) => {
  try {
    const vehicles =
      await db.collection("vehicles")
        .find({})
        .toArray();

    res.json({
      success: true,
      vehicles,
    });
  } catch (error) {
    console.error(
      "Get vehicles error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching vehicles",
    });
  }
});


// =====================================================
// GET VEHICLE BY ID
// =====================================================

app.get("/api/vehicles/:id", async (req, res) => {
  try {
    const { id } = req.params;

    let vehicle = null;

    if (ObjectId.isValid(id)) {
      vehicle =
        await db.collection("vehicles").findOne({
          _id: new ObjectId(id),
        });
    }

    if (!vehicle) {
      vehicle =
        await db.collection("vehicles").findOne({
          $or: [
            { id: id },
            { vehicleId: id },
          ],
        });
    }

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.json({
      success: true,
      vehicle,
    });
  } catch (error) {
    console.error(
      "Get vehicle error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching vehicle",
    });
  }
});


// =====================================================
// ADD VEHICLE
// =====================================================

app.post("/api/vehicles", async (req, res) => {
  try {
    const vehicle = {
      ...req.body,
      createdAt: new Date(),
    };

    const result =
      await db.collection("vehicles")
        .insertOne(vehicle);

    res.status(201).json({
      success: true,
      message: "Vehicle added successfully",
      vehicle: {
        _id: result.insertedId,
        ...vehicle,
      },
    });
  } catch (error) {
    console.error(
      "Add vehicle error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while adding vehicle",
    });
  }
});


// =====================================================
// GET MAINTENANCE RECORDS
// =====================================================

app.get("/api/maintenance", async (req, res) => {
  try {
    const records =
      await db.collection("maintenance")
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

    res.json({
      success: true,
      maintenance: records,
    });
  } catch (error) {
    console.error(
      "Get maintenance error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching maintenance records",
    });
  }
});


// =====================================================
// CREATE MAINTENANCE REQUEST
// =====================================================

app.post("/api/maintenance", async (req, res) => {
  try {
    const {
      vehicleId,
      description,
      cost,
    } = req.body;

    if (!vehicleId || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Vehicle ID and description are required",
      });
    }

    const maintenance = {
      vehicleId,
      description,
      cost: Number(cost || 0),
      status: "OPEN",
      createdAt: new Date(),
    };

    const result =
      await db.collection("maintenance")
        .insertOne(maintenance);


    // Change vehicle status
    let vehicleQuery = null;

    if (ObjectId.isValid(vehicleId)) {
      vehicleQuery = {
        _id: new ObjectId(vehicleId),
      };
    } else {
      vehicleQuery = {
        $or: [
          { id: vehicleId },
          { vehicleId: vehicleId },
        ],
      };
    }

    await db.collection("vehicles").updateOne(
      vehicleQuery,
      {
        $set: {
          status: "MAINTENANCE",
          updatedAt: new Date(),
        },
      }
    );


    res.status(201).json({
      success: true,
      message:
        "Maintenance request created successfully",
      maintenance: {
        _id: result.insertedId,
        ...maintenance,
      },
    });
  } catch (error) {
    console.error(
      "Create maintenance error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while creating maintenance request",
    });
  }
});


// =====================================================
// CREATE INVOICE
// =====================================================

app.post("/api/invoices", async (req, res) => {
  try {
    const {
      invoiceNumber,
      customerName,
      vehicleName,
      vehicleId,
      startDate,
      returnDate,
      location,
      baseRental,
      insurance,
      additionalDriver,
      lateFee,
      damageCharges,
    } = req.body;


    if (
      !invoiceNumber ||
      !customerName ||
      !vehicleName ||
      !vehicleId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Required invoice details are missing",
      });
    }


    const totalAmount =
      Number(baseRental || 0) +
      Number(insurance || 0) +
      Number(additionalDriver || 0) +
      Number(lateFee || 0) +
      Number(damageCharges || 0);


    const invoice = {
      invoiceNumber,
      customerName,
      vehicleName,
      vehicleId,
      startDate: startDate || "",
      returnDate: returnDate || "",
      location: location || "",

      baseRental:
        Number(baseRental || 0),

      insurance:
        Number(insurance || 0),

      additionalDriver:
        Number(additionalDriver || 0),

      lateFee:
        Number(lateFee || 0),

      damageCharges:
        Number(damageCharges || 0),

      totalAmount,

      createdAt: new Date(),
    };


    const result =
      await db.collection("invoices")
        .insertOne(invoice);


    res.status(201).json({
      success: true,
      message: "Invoice created successfully",

      invoice: {
        id: result.insertedId,
        ...invoice,
      },
    });
  } catch (error) {
    console.error(
      "Create invoice error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while creating invoice",
    });
  }
});


// =====================================================
// GET INVOICE
// =====================================================

app.get("/api/invoices/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const invoicesCollection =
      db.collection("invoices");

    let invoice = null;


    // Search using MongoDB ObjectId
    if (ObjectId.isValid(id)) {
      invoice =
        await invoicesCollection.findOne({
          _id: new ObjectId(id),
        });
    }


    // If not found, search using invoice number
    if (!invoice) {
      invoice =
        await invoicesCollection.findOne({
          invoiceNumber: id,
        });
    }


    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }


    res.json({
      success: true,
      invoice,
    });
  } catch (error) {
    console.error(
      "Get invoice error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching invoice",
    });
  }
});


// =====================================================
// CREATE RATING
// =====================================================

app.post("/api/ratings", async (req, res) => {
  try {
    const {
      vehicleId,
      customerId,
      rating,
      review,
    } = req.body;


    if (
      !vehicleId ||
      !rating
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Vehicle ID and rating are required",
      });
    }


    if (
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rating must be between 1 and 5",
      });
    }


    const ratingData = {
      vehicleId,
      customerId: customerId || null,
      rating: Number(rating),
      review: review || "",
      createdAt: new Date(),
    };


    const result =
      await db.collection("ratings")
        .insertOne(ratingData);


    res.status(201).json({
      success: true,
      message:
        "Rating submitted successfully",

      rating: {
        _id: result.insertedId,
        ...ratingData,
      },
    });
  } catch (error) {
    console.error(
      "Create rating error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while submitting rating",
    });
  }
});


// =====================================================
// GET RATINGS FOR VEHICLE
// =====================================================

app.get(
  "/api/ratings/:vehicleId",
  async (req, res) => {
    try {
      const { vehicleId } = req.params;

      const ratings =
        await db.collection("ratings")
          .find({ vehicleId })
          .sort({ createdAt: -1 })
          .toArray();


      res.json({
        success: true,
        ratings,
      });
    } catch (error) {
      console.error(
        "Get ratings error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Server error while fetching ratings",
      });
    }
  }
);


// =====================================================
// ADD VEHICLE LOCATION
// =====================================================

app.post("/api/locations", async (req, res) => {
  try {
    const {
      vehicleId,
      latitude,
      longitude,
      timestamp,
    } = req.body;


    if (
      !vehicleId ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Vehicle ID, latitude and longitude are required",
      });
    }


    const location = {
      vehicleId,
      latitude: Number(latitude),
      longitude: Number(longitude),
      timestamp:
        timestamp
          ? new Date(timestamp)
          : new Date(),
    };


    const result =
      await db.collection("locations")
        .insertOne(location);


    res.status(201).json({
      success: true,
      message:
        "Vehicle location saved successfully",

      location: {
        _id: result.insertedId,
        ...location,
      },
    });
  } catch (error) {
    console.error(
      "Create location error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while saving location",
    });
  }
});


// =====================================================
// GET VEHICLE LOCATIONS
// =====================================================

app.get("/api/locations", async (req, res) => {
  try {
    const locations =
      await db.collection("locations")
        .find({})
        .sort({ timestamp: -1 })
        .toArray();


    res.json({
      success: true,
      locations,
    });
  } catch (error) {
    console.error(
      "Get locations error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching locations",
    });
  }
});


// =====================================================
// START SERVER
// =====================================================

async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(
      `Server running on http://localhost:${PORT}`
    );
  });
}

startServer();