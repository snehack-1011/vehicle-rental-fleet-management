import React from "react";
import "./AdminDashboard.css";

function AdminDashboard() {
  const dashboardData = [
    {
      title: "Total Vehicles",
      value: "120",
      icon: "🚗",
    },
    {
      title: "Available",
      value: "72",
      icon: "✅",
    },
    {
      title: "Reserved",
      value: "18",
      icon: "📅",
    },
    {
      title: "Currently Rented",
      value: "20",
      icon: "🔑",
    },
    {
      title: "Under Maintenance",
      value: "10",
      icon: "🔧",
    },
    {
      title: "Daily Revenue",
      value: "₹45,500",
      icon: "💰",
    },
    {
      title: "Monthly Revenue",
      value: "₹8,75,000",
      icon: "📈",
    },
    {
      title: "Maintenance Cost",
      value: "₹1,25,000",
      icon: "🛠️",
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Vehicle Rental & Fleet Management System</p>
        </div>

        <button className="admin-profile">
          Admin
        </button>
      </div>

      <div className="dashboard-cards">
        {dashboardData.map((item, index) => (
          <div className="dashboard-card" key={index}>
            <div className="card-icon">{item.icon}</div>

            <div>
              <p className="card-title">{item.title}</p>
              <h2>{item.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Most Rented Vehicle</h2>
        </div>

        <div className="vehicle-info">
          <div>
            <h3>Hyundai Creta</h3>
            <p>Vehicle ID: CAR1001</p>
            <p>Type: SUV</p>
          </div>

          <div className="rental-count">
            <strong>28</strong>
            <span>Rentals</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Recent Vehicle Activity</h2>
        </div>

        <table className="activity-table">
          <thead>
            <tr>
              <th>Vehicle ID</th>
              <th>Vehicle</th>
              <th>Status</th>
              <th>Location</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>CAR1001</td>
              <td>Hyundai Creta</td>
              <td>
                <span className="status available">Available</span>
              </td>
              <td>Hyderabad</td>
            </tr>

            <tr>
              <td>CAR1002</td>
              <td>Honda City</td>
              <td>
                <span className="status rented">Rented</span>
              </td>
              <td>Bengaluru</td>
            </tr>

            <tr>
              <td>CAR1003</td>
              <td>Tata Nexon EV</td>
              <td>
                <span className="status maintenance">Maintenance</span>
              </td>
              <td>Mysuru</td>
            </tr>

            <tr>
              <td>CAR1004</td>
              <td>Toyota Innova</td>
              <td>
                <span className="status reserved">Reserved</span>
              </td>
              <td>Chennai</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;