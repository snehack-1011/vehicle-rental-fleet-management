import React, { useState } from "react";
import "./Dashboard.css";

function Dashboard() {
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

    setSubmittedReview({
      rating: rating,
      review: review,
    });

    setReview("");
    setRating(0);
  };

  const downloadInvoice = () => {
    window.print();
  };

  return (
    <div className="dashboard">

      {/* HEADER */}
      <h1>Fleet Manager Dashboard</h1>
      <p className="dashboard-subtitle">
        Overview of your vehicle rental fleet
      </p>

      {/* FLEET STATUS */}
      <div className="stats-container">

        <div className="stat-card">
          <h3>Total Vehicles</h3>
          <p>50</p>
        </div>

        <div className="stat-card">
          <h3>Available</h3>
          <p>20</p>
        </div>

        <div className="stat-card">
          <h3>Reserved</h3>
          <p>10</p>
        </div>

        <div className="stat-card">
          <h3>Rented</h3>
          <p>15</p>
        </div>

        <div className="stat-card">
          <h3>Maintenance</h3>
          <p>5</p>
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
            <strong>₹1,25,000</strong>
          </div>

          <div className="payment-row">
            <span>Paid Amount</span>
            <strong>₹1,05,000</strong>
          </div>

          <div className="payment-row">
            <span>Pending Amount</span>
            <strong>₹20,000</strong>
          </div>

          <div className="payment-row">
            <span>Transactions</span>
            <strong>48</strong>
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
      <div className="review-section">

        <h2>Vehicle Ratings & Reviews</h2>

        <div className="vehicle-review">

          <div>
            <h3>Toyota Innova</h3>
            <p>Current Rating: ⭐⭐⭐⭐⭐</p>
          </div>

          <span className="rating-number">4.8 / 5</span>

        </div>

        <form onSubmit={handleReviewSubmit}>

          <label>Give your rating</label>

          <div className="stars">

            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={star <= rating ? "selected-star" : ""}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}

          </div>

          <textarea
            placeholder="Write your review..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
          ></textarea>

          <button type="submit" className="review-button">
            Submit Review
          </button>

        </form>

        {submittedReview && (
          <div className="submitted-review">

            <h3>Your Review</h3>

            <p>
              Rating: {"⭐".repeat(submittedReview.rating)}
            </p>

            <p>{submittedReview.review}</p>

          </div>
        )}

      </div>

    </div>
  );
}

export default Dashboard;