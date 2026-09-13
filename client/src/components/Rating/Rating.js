import React, { useState } from "react";
import "./Rating.css";

function Rating() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const vehicleId = "CAR1001";

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/ratings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vehicleId: vehicleId,
            customerId: "CUSTOMER001",
            rating: rating,
            review: review,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to submit rating"
        );
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Rating error:", err);

      setError(
        err.message || "Unable to submit rating."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rating-container">
      <div className="rating-card">

        <h1>Rate Your Rental</h1>

        <p className="rating-subtitle">
          Share your experience with the vehicle
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit}>

            {/* VEHICLE DETAILS */}
            <div className="vehicle-rating-info">
              <h2>Hyundai Creta</h2>

              <p>
                Vehicle ID: {vehicleId}
              </p>
            </div>

            {/* RATING */}
            <div className="stars-section">

              <p>
                How would you rate this vehicle?
              </p>

              <div className="stars">

                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={
                      star <= (hover || rating)
                        ? "star active"
                        : "star"
                    }
                    onClick={() =>
                      setRating(star)
                    }
                    onMouseEnter={() =>
                      setHover(star)
                    }
                    onMouseLeave={() =>
                      setHover(0)
                    }
                  >
                    ★
                  </button>
                ))}

              </div>

              <span className="rating-text">

                {rating === 1 && "Poor"}

                {rating === 2 && "Fair"}

                {rating === 3 && "Good"}

                {rating === 4 && "Very Good"}

                {rating === 5 && "Excellent"}

              </span>

            </div>

            {/* REVIEW */}
            <div className="review-section">

              <label>
                Write a review
              </label>

              <textarea
                value={review}
                onChange={(e) =>
                  setReview(e.target.value)
                }
                placeholder="Tell us about your rental experience..."
                rows="5"
              />

            </div>

            {/* ERROR */}
            {error && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "12px",
                  backgroundColor: "#ffebee",
                  color: "#c62828",
                  borderRadius: "8px",
                }}
              >
                {error}
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              className="submit-rating"
              disabled={loading}
            >
              {loading
                ? "Submitting..."
                : "Submit Rating"}
            </button>

          </form>
        ) : (

          /* SUCCESS */
          <div className="rating-success">

            <div className="success-icon">
              ✓
            </div>

            <h2>
              Thank You!
            </h2>

            <p>
              Your rating and review have been
              submitted successfully.
            </p>

            <div className="submitted-rating">

              {"★".repeat(rating)}
              {"☆".repeat(5 - rating)}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default Rating;