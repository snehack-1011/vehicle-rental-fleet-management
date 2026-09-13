require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");

const app = express();

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());
app.use(express.json());

// ======================================================
// MONGODB CONFIGURATION
// ======================================================

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017";

const DB_NAME =
  process.env.DB_NAME ||
  "vehicle_rental_platform";

const PORT =
  process.env.PORT || 5000;

let db;

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Vehicle Rental API is running",
  });
});

// ======================================================
// AUTH - REGISTER
// ======================================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required",
      });
    }

    const existingUser = await db
      .collection("users")
      .findOne({
        email: email.toLowerCase(),
      });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "CUSTOMER",
      createdAt: new Date(),
    };

    const result = await db
      .collection("users")
      .insertOne(newUser);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user: {
        id: result.insertedId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
});

// ======================================================
// AUTH - LOGIN
// ======================================================

app.post("/api/auth/login", async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required",
      });
    }

    const user = await db
      .collection("users")
      .findOne({
        email: email.toLowerCase(),
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password",
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
      message: "Login failed",
      error: error.message,
    });
  }
});

// ======================================================
// ADMIN DASHBOARD
// ======================================================

app.get("/api/admin/dashboard", async (req, res) => {
  try {
    const vehicles = await db
      .collection("vehicles")
      .find({})
      .toArray();

    const invoices = await db
      .collection("invoices")
      .find({})
      .toArray();

    const maintenance = await db
      .collection("maintenance")
      .find({})
      .toArray();

    // ==================================================
    // VEHICLE COUNTS
    // ==================================================

    const totalVehicles = vehicles.length;

    const available = vehicles.filter(
      (vehicle) =>
        vehicle.status === "AVAILABLE"
    ).length;

    const reserved = vehicles.filter(
      (vehicle) =>
        vehicle.status === "RESERVED"
    ).length;

    const rented = vehicles.filter(
      (vehicle) =>
        vehicle.status === "RENTED"
    ).length;

    const underMaintenance = vehicles.filter(
      (vehicle) =>
        vehicle.status === "MAINTENANCE" ||
        vehicle.status === "DAMAGED"
    ).length;

    // ==================================================
    // REVENUE CALCULATION
    // ==================================================

    /*
      Daily Revenue:
      Only invoices created TODAY.

      Monthly Revenue:
      All invoices created during the CURRENT MONTH.
    */

    const today = new Date();

    // Current date in Indian Standard Time
    const todayKey = today.toLocaleDateString(
      "en-CA",
      {
        timeZone: "Asia/Kolkata",
      }
    );

    // Example:
    // todayKey = "2026-09-13"

    const currentMonthKey =
      todayKey.substring(0, 7);

    // Example:
    // currentMonthKey = "2026-09"

    // --------------------------------------------------
    // DAILY REVENUE
    // --------------------------------------------------

    const dailyRevenue = invoices.reduce(
      (sum, invoice) => {
        if (!invoice.createdAt) {
          return sum;
        }

        const invoiceDate = new Date(
          invoice.createdAt
        );

        const invoiceDateKey =
          invoiceDate.toLocaleDateString(
            "en-CA",
            {
              timeZone: "Asia/Kolkata",
            }
          );

        if (
          invoiceDateKey === todayKey
        ) {
          return (
            sum +
            Number(invoice.total || 0)
          );
        }

        return sum;
      },
      0
    );

    // --------------------------------------------------
    // MONTHLY REVENUE
    // --------------------------------------------------

    const monthlyRevenue = invoices.reduce(
      (sum, invoice) => {
        if (!invoice.createdAt) {
          return sum;
        }

        const invoiceDate = new Date(
          invoice.createdAt
        );

        const invoiceDateKey =
          invoiceDate.toLocaleDateString(
            "en-CA",
            {
              timeZone: "Asia/Kolkata",
            }
          );

        const invoiceMonthKey =
          invoiceDateKey.substring(0, 7);

        if (
          invoiceMonthKey ===
          currentMonthKey
        ) {
          return (
            sum +
            Number(invoice.total || 0)
          );
        }

        return sum;
      },
      0
    );

    // ==================================================
    // MAINTENANCE COST
    // ==================================================

    const maintenanceCost =
      maintenance.reduce(
        (sum, item) =>
          sum +
          Number(item.cost || 0),
        0
      );

    // ==================================================
    // MOST RENTED VEHICLE
    // ==================================================

    const rentedVehicles =
      invoices.reduce(
        (result, invoice) => {
          const vehicle =
            invoice.vehicleName ||
            invoice.vehicleId;

          if (vehicle) {
            result[vehicle] =
              (result[vehicle] || 0) + 1;
          }

          return result;
        },
        {}
      );

    let mostRentedVehicle = "N/A";
    let highestCount = 0;

    Object.entries(
      rentedVehicles
    ).forEach(
      ([vehicle, count]) => {
        if (count > highestCount) {
          highestCount = count;
          mostRentedVehicle = vehicle;
        }
      }
    );

    // ==================================================
    // SEND DASHBOARD DATA
    // ==================================================

    res.json({
      success: true,

      dashboard: {
        totalVehicles,
        available,
        reserved,
        rented,
        underMaintenance,

        dailyRevenue,
        monthlyRevenue,

        maintenanceCost,
        mostRentedVehicle,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to load dashboard",
      error: error.message,
    });
  }
});

// ======================================================
// GET ALL VEHICLES
// ======================================================

app.get("/api/vehicles", async (req, res) => {
  try {
    const vehicles = await db
      .collection("vehicles")
      .find({})
      .sort({
        createdAt: -1,
      })
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
        "Failed to load vehicles",
      error: error.message,
    });
  }
});

// ======================================================
// GET SINGLE VEHICLE
// ======================================================

app.get(
  "/api/vehicles/:id",
  async (req, res) => {
    try {
      const value = req.params.id;

      let vehicle = await db
        .collection("vehicles")
        .findOne({
          id: value,
        });

      if (
        !vehicle &&
        ObjectId.isValid(value)
      ) {
        vehicle = await db
          .collection("vehicles")
          .findOne({
            _id: new ObjectId(value),
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
          "Failed to load vehicle",
        error: error.message,
      });
    }
  }
);

// ======================================================
// ADD VEHICLE
// ======================================================

app.post("/api/vehicles", async (req, res) => {
  try {
    const {
      id,
      model,
      type,
      location,
      status,
      pricePerDay,
    } = req.body;

    if (
      !id ||
      !model ||
      !type ||
      !location
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Vehicle ID, model, type and location are required",
      });
    }

    const existingVehicle =
      await db
        .collection("vehicles")
        .findOne({
          id: id,
        });

    if (existingVehicle) {
      return res.status(400).json({
        success: false,
        message:
          "Vehicle ID already exists",
      });
    }

    const newVehicle = {
      id,
      model,
      type,
      location,
      status:
        status || "AVAILABLE",
      pricePerDay: Number(
        pricePerDay || 0
      ),
      createdAt: new Date(),
    };

    const result = await db
      .collection("vehicles")
      .insertOne(newVehicle);

    res.status(201).json({
      success: true,
      message:
        "Vehicle added successfully",
      vehicle: {
        ...newVehicle,
        _id: result.insertedId,
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
        "Failed to add vehicle",
      error: error.message,
    });
  }
});

// ======================================================
// UPDATE VEHICLE
// ======================================================

app.put(
  "/api/vehicles/:id",
  async (req, res) => {
    try {
      const value = req.params.id;

      const {
        id,
        model,
        type,
        location,
        status,
        pricePerDay,
      } = req.body;

      const updateData = {
        model,
        type,
        location,
        status,
        pricePerDay: Number(
          pricePerDay || 0
        ),
        updatedAt: new Date(),
      };

      let result = await db
        .collection("vehicles")
        .updateOne(
          {
            id: value,
          },
          {
            $set: updateData,
          }
        );

      if (
        result.matchedCount === 0 &&
        ObjectId.isValid(value)
      ) {
        result = await db
          .collection("vehicles")
          .updateOne(
            {
              _id: new ObjectId(value),
            },
            {
              $set: {
                ...updateData,
                ...(id ? { id } : {}),
              },
            }
          );
      }

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Vehicle not found",
        });
      }

      res.json({
        success: true,
        message:
          "Vehicle updated successfully",
      });
    } catch (error) {
      console.error(
        "Update vehicle error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update vehicle",
        error: error.message,
      });
    }
  }
);

// ======================================================
// DELETE VEHICLE
// ======================================================

app.delete(
  "/api/vehicles/:id",
  async (req, res) => {
    try {
      const value = req.params.id;

      console.log(
        "DELETE REQUEST RECEIVED:",
        value
      );

      let result = await db
        .collection("vehicles")
        .deleteOne({
          id: value,
        });

      if (
        result.deletedCount === 0 &&
        ObjectId.isValid(value)
      ) {
        console.log(
          "Trying MongoDB _id:",
          value
        );

        result = await db
          .collection("vehicles")
          .deleteOne({
            _id: new ObjectId(value),
          });
      }

      console.log(
        "DELETE RESULT:",
        result.deletedCount
      );

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Vehicle not found in database",
        });
      }

      res.json({
        success: true,
        message:
          "Vehicle deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete vehicle",
        error: error.message,
      });
    }
  }
);

// ======================================================
// MAINTENANCE - GET
// ======================================================

app.get(
  "/api/maintenance",
  async (req, res) => {
    try {
      const maintenance =
        await db
          .collection("maintenance")
          .find({})
          .sort({
            createdAt: -1,
          })
          .toArray();

      res.json({
        success: true,
        maintenance,
      });
    } catch (error) {
      console.error(
        "Get maintenance error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load maintenance records",
        error: error.message,
      });
    }
  }
);

// ======================================================
// MAINTENANCE - ADD
// ======================================================

app.post(
  "/api/maintenance",
  async (req, res) => {
    try {
      const {
        vehicleId,
        issue,
        priority,
        cost,
      } = req.body;

      if (!vehicleId || !issue) {
        return res.status(400).json({
          success: false,
          message:
            "Vehicle ID and issue are required",
        });
      }

      const maintenanceRecord = {
        vehicleId: String(vehicleId),

        issue,

        priority:
          priority || "MEDIUM",

        cost: Number(cost || 0),

        createdAt: new Date(),
      };

      const result = await db
        .collection("maintenance")
        .insertOne(
          maintenanceRecord
        );

      // Change vehicle status
      await db
        .collection("vehicles")
        .updateOne(
          {
            id: String(vehicleId),
          },
          {
            $set: {
              status: "MAINTENANCE",
            },
          }
        );

      res.status(201).json({
        success: true,
        message:
          "Maintenance record added",

        maintenance: {
          ...maintenanceRecord,
          _id: result.insertedId,
        },
      });
    } catch (error) {
      console.error(
        "Add maintenance error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to add maintenance record",
        error: error.message,
      });
    }
  }
);

// ======================================================
// INVOICE TOTAL CALCULATION
// ======================================================

function calculateInvoiceTotal(data) {
  return (
    Number(
      data.baseRental || 0
    ) +
    Number(
      data.weekendCharges || 0
    ) +
    Number(
      data.peakSeasonCharges || 0
    ) +
    Number(
      data.insurance || 0
    ) +
    Number(
      data.additionalDriver || 0
    ) +
    Number(
      data.lateFee || 0
    ) +
    Number(
      data.damageCharges || 0
    )
  );
}

// ======================================================
// GET ALL INVOICES
// ======================================================

app.get(
  "/api/invoices",
  async (req, res) => {
    try {
      const invoices =
        await db
          .collection("invoices")
          .find({})
          .sort({
            createdAt: -1,
          })
          .toArray();

      res.json({
        success: true,
        invoices,
      });
    } catch (error) {
      console.error(
        "Get invoices error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to load invoices",
        error: error.message,
      });
    }
  }
);

// ======================================================
// GET SINGLE INVOICE
// ======================================================

app.get(
  "/api/invoices/:id",
  async (req, res) => {
    try {
      const value = req.params.id;

      let invoice = await db
        .collection("invoices")
        .findOne({
          invoiceNumber: value,
        });

      if (
        !invoice &&
        ObjectId.isValid(value)
      ) {
        invoice = await db
          .collection("invoices")
          .findOne({
            _id: new ObjectId(value),
          });
      }

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message:
            "Invoice not found",
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
          "Failed to load invoice",
        error: error.message,
      });
    }
  }
);

// ======================================================
// CREATE INVOICE
// ======================================================

app.post(
  "/api/invoices",
  async (req, res) => {
    try {
      const data = req.body;

      if (!data.invoiceNumber) {
        return res.status(400).json({
          success: false,
          message:
            "Invoice number is required",
        });
      }

      const existingInvoice =
        await db
          .collection("invoices")
          .findOne({
            invoiceNumber:
              data.invoiceNumber,
          });

      if (existingInvoice) {
        return res.status(400).json({
          success: false,
          message:
            "Invoice number already exists",
        });
      }

      const total =
        calculateInvoiceTotal(data);

      const invoice = {
        invoiceNumber:
          data.invoiceNumber,

        customerName:
          data.customerName || "",

        vehicleName:
          data.vehicleName || "",

        vehicleId:
          data.vehicleId || "",

        startDate:
          data.startDate || "",

        returnDate:
          data.returnDate || "",

        location:
          data.location || "",

        baseRental: Number(
          data.baseRental || 0
        ),

        weekendCharges: Number(
          data.weekendCharges || 0
        ),

        peakSeasonCharges: Number(
          data.peakSeasonCharges || 0
        ),

        insurance: Number(
          data.insurance || 0
        ),

        additionalDriver: Number(
          data.additionalDriver || 0
        ),

        lateFee: Number(
          data.lateFee || 0
        ),

        damageCharges: Number(
          data.damageCharges || 0
        ),

        total,

        notes:
          data.notes || "",

        createdAt: new Date(),

        updatedAt: new Date(),
      };

      const result = await db
        .collection("invoices")
        .insertOne(invoice);

      res.status(201).json({
        success: true,
        message:
          "Invoice created successfully",

        invoice: {
          ...invoice,
          _id: result.insertedId,
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
          "Failed to create invoice",
        error: error.message,
      });
    }
  }
);

// ======================================================
// UPDATE INVOICE
// ======================================================

app.put(
  "/api/invoices/:id",
  async (req, res) => {
    try {
      const value = req.params.id;

      const data = req.body;

      const updateData = {
        invoiceNumber:
          data.invoiceNumber,

        customerName:
          data.customerName || "",

        vehicleName:
          data.vehicleName || "",

        vehicleId:
          data.vehicleId || "",

        startDate:
          data.startDate || "",

        returnDate:
          data.returnDate || "",

        location:
          data.location || "",

        baseRental: Number(
          data.baseRental || 0
        ),

        weekendCharges: Number(
          data.weekendCharges || 0
        ),

        peakSeasonCharges: Number(
          data.peakSeasonCharges || 0
        ),

        insurance: Number(
          data.insurance || 0
        ),

        additionalDriver: Number(
          data.additionalDriver || 0
        ),

        lateFee: Number(
          data.lateFee || 0
        ),

        damageCharges: Number(
          data.damageCharges || 0
        ),

        total:
          calculateInvoiceTotal(
            data
          ),

        notes:
          data.notes || "",

        updatedAt: new Date(),
      };

      let result = await db
        .collection("invoices")
        .updateOne(
          {
            invoiceNumber: value,
          },
          {
            $set: updateData,
          }
        );

      if (
        result.matchedCount === 0 &&
        ObjectId.isValid(value)
      ) {
        result = await db
          .collection("invoices")
          .updateOne(
            {
              _id: new ObjectId(value),
            },
            {
              $set: updateData,
            }
          );
      }

      if (result.matchedCount === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Invoice not found",
        });
      }

      res.json({
        success: true,
        message:
          "Invoice updated successfully",
      });
    } catch (error) {
      console.error(
        "Update invoice error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update invoice",
        error: error.message,
      });
    }
  }
);

// ======================================================
// DELETE INVOICE
// ======================================================

app.delete(
  "/api/invoices/:id",
  async (req, res) => {
    try {
      const value = req.params.id;

      let result = await db
        .collection("invoices")
        .deleteOne({
          invoiceNumber: value,
        });

      if (
        result.deletedCount === 0 &&
        ObjectId.isValid(value)
      ) {
        result = await db
          .collection("invoices")
          .deleteOne({
            _id: new ObjectId(value),
          });
      }

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Invoice not found",
        });
      }

      res.json({
        success: true,
        message:
          "Invoice deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete invoice error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete invoice",
        error: error.message,
      });
    }
  }
);

// ======================================================
// RATINGS - ADD
// ======================================================

app.post(
  "/api/ratings",
  async (req, res) => {
    try {
      const {
        vehicleId,
        customerId,
        rating,
        review,
      } = req.body;

      if (
        !vehicleId ||
        !customerId ||
        !rating
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Vehicle ID, customer ID and rating are required",
        });
      }

      const ratingValue = Number(rating);

      if (
        ratingValue < 1 ||
        ratingValue > 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Rating must be between 1 and 5",
        });
      }

      const newRating = {
        vehicleId: String(vehicleId),

        customerId: String(customerId),

        rating: ratingValue,

        review: review || "",

        createdAt: new Date(),
      };

      const result = await db
        .collection("ratings")
        .insertOne(newRating);

      res.status(201).json({
        success: true,
        message:
          "Rating submitted successfully",

        rating: {
          ...newRating,
          _id: result.insertedId,
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
          "Failed to submit rating",
        error: error.message,
      });
    }
  }
);

// ======================================================
// RATINGS - GET ALL FOR VEHICLE
// ======================================================

app.get(
  "/api/ratings/:vehicleId",
  async (req, res) => {
    try {
      const vehicleId = String(
        req.params.vehicleId
      );

      const ratings = await db
        .collection("ratings")
        .find({
          vehicleId: vehicleId,
        })
        .sort({
          createdAt: -1,
        })
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
          "Failed to fetch ratings",
        error: error.message,
      });
    }
  }
);

// ======================================================
// LOCATIONS - ADD
// ======================================================

app.post(
  "/api/locations",
  async (req, res) => {
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
        vehicleId: String(
          vehicleId
        ),

        latitude: Number(
          latitude
        ),

        longitude: Number(
          longitude
        ),

        timestamp: timestamp
          ? new Date(timestamp)
          : new Date(),
      };

      const result = await db
        .collection("locations")
        .insertOne(location);

      res.status(201).json({
        success: true,
        message:
          "Vehicle location saved successfully",

        location: {
          ...location,
          _id: result.insertedId,
        },
      });
    } catch (error) {
      console.error(
        "Save location error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to save vehicle location",
        error: error.message,
      });
    }
  }
);

// ======================================================
// LOCATIONS - GET ALL
// ======================================================

app.get(
  "/api/locations",
  async (req, res) => {
    try {
      const locations = await db
        .collection("locations")
        .find({})
        .sort({
          timestamp: -1,
        })
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
          "Failed to load locations",
        error: error.message,
      });
    }
  }
);

// ======================================================
// START SERVER
// ======================================================

async function startServer() {
  try {
    const client = new MongoClient(
      MONGO_URI
    );

    await client.connect();

    console.log(
      "MongoDB connected successfully"
    );

    db = client.db(DB_NAME);

    console.log(
      `Database: ${DB_NAME}`
    );

    app.listen(
      PORT,
      () => {
        console.log(
          `Server running on http://localhost:${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "Failed to start server:"
    );

    console.error(error);
  }
}

startServer();