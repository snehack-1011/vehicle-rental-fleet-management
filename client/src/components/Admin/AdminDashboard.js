import React, { useEffect, useState } from "react";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/admin/dashboard"
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load dashboard"
        );
      }

      setDashboard(data.dashboard);
    } catch (error) {
      console.error("Dashboard error:", error);
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <h2>Loading Admin Dashboard...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <h2>{error}</h2>
        <button onClick={fetchDashboard}>
          Try Again
        </button>
      </div>
    );
  }

  const dashboardData = [
    {
      title: "Total Vehicles",
      value: dashboard.totalVehicles,
      icon: "🚗",
    },
    {
      title: "Available",
      value: dashboard.availableVehicles,
      icon: "✅",
    },
    {
      title: "Reserved",
      value: dashboard.reservedVehicles,
      icon: "📅",
    },
    {
      title: "Currently Rented",
      value: dashboard.currentlyRented,
      icon: "🔑",
    },
    {
      title: "Under Maintenance",
      value: dashboard.underMaintenance,
      icon: "🔧",
    },
    {
      title: "Daily Revenue",
      value: `₹${Number(
        dashboard.dailyRevenue
      ).toLocaleString("en-IN")}`,
      icon: "💰",
    },
    {
      title: "Monthly Revenue",
      value: `₹${Number(
        dashboard.monthlyRevenue
      ).toLocaleString("en-IN")}`,
      icon: "📈",
    },
    {
      title: "Maintenance Cost",
      value: `₹${Number(
        dashboard.maintenanceCost
      ).toLocaleString("en-IN")}`,
      icon: "🛠️",
    },
  ];

  return (
    <div className="admin-dashboard">

      {/* HEADER */}
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>
            Vehicle Rental & Fleet Management System
          </p>
        </div>

        <button className="admin-profile">
          Admin
        </button>
      </div>

      {/* DASHBOARD CARDS */}
      <div className="dashboard-cards">
        {dashboardData.map((item, index) => (
          <div
            className="dashboard-card"
            key={index}
          >
            <div className="card-icon">
              {item.icon}
            </div>

            <div>
              <p className="card-title">
                {item.title}
              </p>

              <h2>{item.value}</h2>
            </div>
          </div>
        ))}
      </div>

      {/* MOST RENTED VEHICLE */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Most Rented Vehicle</h2>
        </div>

        {dashboard.mostRentedVehicle ? (
          <div className="vehicle-info">
            <div>
              <h3>
                {dashboard.mostRentedVehicle.name}
              </h3>

              <p>
                Vehicle ID:{" "}
                {dashboard.mostRentedVehicle.id}
              </p>
            </div>

            <div className="rental-count">
              <strong>
                {dashboard.mostRentedVehicle.rentals}
              </strong>

              <span>Rentals</span>
            </div>
          </div>
        ) : (
          <div className="vehicle-info">
            <div>
              <h3>No rental data available</h3>
              <p>
                Vehicle rental information will appear
                here.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* SYSTEM STATUS */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Dashboard Status</h2>
        </div>

        <div className="vehicle-info">
          <div>
            <h3>Backend Connected</h3>
            <p>
              Dashboard data is being loaded from
              MongoDB through the Node.js API.
            </p>
          </div>

          <div className="rental-count">
            <strong>✓</strong>
            <span>Connected</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default AdminDashboard;