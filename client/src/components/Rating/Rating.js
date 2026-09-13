import React, { useState } from "react";
import "./Rating.css";

function Rating() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }

    setSubmitted(true);
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

            <div className="vehicle-rating-info">
              <h2>Hyundai Creta</h2>
              <p>Vehicle ID: CAR1001</p>
            </div>

            <div className="stars-section">

              <p>How would you rate this vehicle?</p>

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
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
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

            <div className="review-section">

              <label>Write a review</label>

              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Tell us about your rental experience..."
                rows="5"
              />

            </div>

            <button type="submit" className="submit-rating">
              Submit Rating
            </button>

          </form>
        ) : (

          <div className="rating-success">

            <div className="success-icon">✓</div>

            <h2>Thank You!</h2>

            <p>
              Your rating and review have been submitted successfully.
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