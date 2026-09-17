import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";
const API_URL = "http://localhost:5000";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [period, setPeriod] = useState("daily");
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submittedReview, setSubmittedReview] = useState(null);

  const dailyRevenue = [
    { day: "Mon", amount: 40 },
    { day: "Tue", amount: 60 },
    { day: "Wed", amount: 45 },
    { day: "Thu", amount: 80 },
    { day: "Fri", amount: 70 },
    { day: "Sat", amount: 90 },
    { day: "Sun", amount: 65 },
  ];

  const monthlyRevenue = [
    { day: "Jan", amount: 45 },
    { day: "Feb", amount: 65 },
    { day: "Mar", amount: 55 },
    { day: "Apr", amount: 80 },
    { day: "May", amount: 70 },
    { day: "Jun", amount: 90 },
  ];

  const revenueData =
    period === "daily" ? dailyRevenue : monthlyRevenue;

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (rating === 0 || review.trim() === "") {
      alert("Please select a rating and write a review.");
      return;
    }
    setSubmittedReview({ rating, review });
    setReview("");
    setRating(0);
  };

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch(`${API_URL}/api/admin/dashboard`);
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error("Failed to fetch dashboard", err);
      }
    };
    
    const fetchFeedbacks = async () => {
      try {
        const response = await fetch(`${API_URL}/api/feedback`);
        const data = await response.json();
        setFeedbacks(data.feedbacks || []);
      } catch (err) {
        console.error("Failed to fetch feedbacks", err);
      }
    };

    fetchDashboard();
    fetchFeedbacks();
  }, []);

  const downloadInvoice = () => {
    window.print();
  };

  return (
    <div className="dashboard">

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h1 style={{ margin: 0 }}>Fleet Manager Dashboard</h1>
          <p className="dashboard-subtitle" style={{ margin: "4px 0 0 0" }}>
            Overview of your vehicle rental fleet
          </p>
        </div>
        <Link to="/map" style={{ background: "#10b981", color: "#fff", padding: "10px 18px", borderRadius: "6px", textDecoration: "none", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "8px" }}>
          📍 View Live Vehicle Map
        </Link>
      </div>

      {/* FLEET STATUS */}
      <div className="stats-container">

        <div className="stat-card">
          <h3>Total Vehicles</h3>
          <p>{dashboardData?.totalVehicles || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Available</h3>
          <p>{dashboardData?.availableVehicles || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Reserved</h3>
          <p>{dashboardData?.reservedVehicles || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Rented</h3>
          <p>{dashboardData?.rentedVehicles || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Maintenance</h3>
          <p>{dashboardData?.maintenanceVehicles || 0}</p>
        </div>

      </div>

      {/* REVENUE */}
      <div className="revenue-section">

        <div className="section-header">
          <div>
            <h2>Revenue Overview</h2>
            <p>Track rental revenue</p>
          </div>

          <div className="period-buttons">
            <button
              className={period === "daily" ? "active-btn" : ""}
              onClick={() => setPeriod("daily")}
            >
              Daily
            </button>

            <button
              className={period === "monthly" ? "active-btn" : ""}
              onClick={() => setPeriod("monthly")}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="chart">

          {revenueData.map((item, index) => (
            <div className="bar-container" key={index}>

              <div
                className="bar"
                style={{ height: `${item.amount}%` }}
                title={`Revenue: ₹${item.amount * 1000}`}
              ></div>

              <span>{item.day}</span>

            </div>
          ))}

        </div>

      </div>

      {/* PAYMENT SUMMARY + INVOICE */}
      <div className="bottom-grid">

        <div className="payment-card">

          <h2>Payment Summary</h2>

          <div className="payment-row">
            <span>Total Revenue</span>
            <strong>₹{(dashboardData?.monthlyRevenue || 0).toLocaleString("en-IN")}</strong>
          </div>

          <div className="payment-row">
            <span>Paid Amount</span>
            <strong>₹{((dashboardData?.monthlyRevenue || 0) * 0.8).toLocaleString("en-IN")}</strong>
          </div>

          <div className="payment-row">
            <span>Pending Amount</span>
            <strong>₹{((dashboardData?.monthlyRevenue || 0) * 0.2).toLocaleString("en-IN")}</strong>
          </div>

          <div className="payment-row">
            <span>Transactions</span>
            <strong>{dashboardData?.rentedVehicles || 0}</strong>
          </div>

        </div>

        <div className="invoice-card">

          <h2>Latest Invoice</h2>

          <div className="invoice-info">
            <p><strong>Invoice:</strong> INV-001</p>
            <p><strong>Customer:</strong> Rahul Kumar</p>
            <p><strong>Vehicle:</strong> Toyota Innova</p>
            <p><strong>Rental Days:</strong> 3</p>
            <p><strong>Amount:</strong> ₹7,500</p>
            <p>
              <strong>Status:</strong>
              <span className="paid"> Paid</span>
            </p>
          </div>

          <button
            className="invoice-button"
            onClick={downloadInvoice}
          >
            Download / Print Invoice
          </button>

        </div>

      </div>

      {/* RATINGS AND REVIEWS */}
      <div className="review-section" style={{marginBottom: "40px"}}>

        <h2>Live Customer Feedback</h2>

        {feedbacks.length === 0 ? (
          <p style={{color: "#666", fontStyle: "italic"}}>No feedback received yet.</p>
        ) : (
          <div style={{display: "flex", flexDirection: "column", gap: "15px"}}>
            {feedbacks.map((fb) => (
              <div key={fb._id} className="vehicle-review" style={{display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "8px", background: "#f8fafc", border: "1px solid #e2e8f0"}}>
                <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                  <div>
                    <h3 style={{margin: 0, fontSize: "16px"}}>{fb.customerEmail}</h3>
                    <p style={{margin: 0, fontSize: "12px", color: "#64748b"}}>Vehicle ID: {fb.vehicleId}</p>
                  </div>
                  <span className="rating-number" style={{color: "#f59e0b", fontSize: "18px"}}>
                    {"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)}
                  </span>
                </div>
                <p style={{margin: "5px 0 0 0", color: "#334155", fontSize: "14px"}}>"{fb.review}"</p>
                <small style={{color: "#94a3b8", fontSize: "11px"}}>{new Date(fb.timestamp).toLocaleString()}</small>
              </div>
            ))}
          </div>
        )}

      </div>



    </div>
  );
}

export default Dashboard;