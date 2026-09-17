import React, { useEffect, useState } from "react";
import "./Rating.css";

const API_URL = "http://localhost:5000";

function Rating() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const [reviews, setReviews] = useState([]);

  const [loadingVehicles, setLoadingVehicles] =
    useState(true);

  const [loadingReviews, setLoadingReviews] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const customerId = "CUSTOMER001";

  // =========================================
  // LOAD VEHICLES
  // =========================================

  const loadVehicles = async () => {
    try {
      setLoadingVehicles(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/vehicles`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load vehicles"
        );
      }

      const vehicleList =
        Array.isArray(data)
          ? data
          : Array.isArray(data.vehicles)
          ? data.vehicles
          : [];

      setVehicles(vehicleList);

      if (vehicleList.length > 0) {
        const firstVehicle =
          vehicleList[0];

        const vehicleId =
          firstVehicle.id ||
          firstVehicle._id;

        setSelectedVehicleId(
          String(vehicleId)
        );

        setSelectedVehicle(
          firstVehicle
        );
      }
    } catch (err) {
      console.error(
        "Vehicle loading error:",
        err
      );

      setError(err.message);
    } finally {
      setLoadingVehicles(false);
    }
  };

  // =========================================
  // LOAD ALL REVIEWS
  // =========================================

  const loadReviews = async (
    vehicleId
  ) => {
    if (!vehicleId) {
      setReviews([]);
      return;
    }

    try {
      setLoadingReviews(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/ratings/${encodeURIComponent(
          vehicleId
        )}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to load reviews"
        );
      }

      const reviewList =
        Array.isArray(data)
          ? data
          : Array.isArray(data.ratings)
          ? data.ratings
          : [];

      // IMPORTANT:
      // This stores ALL reviews returned
      // from MongoDB.
      setReviews(reviewList);
    } catch (err) {
      console.error(
        "Review loading error:",
        err
      );

      setReviews([]);
      setError(err.message);
    } finally {
      setLoadingReviews(false);
    }
  };

  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {
    loadVehicles();
  }, []);

  // =========================================
  // LOAD REVIEWS WHEN VEHICLE CHANGES
  // =========================================

  useEffect(() => {
    if (selectedVehicleId) {
      loadReviews(
        selectedVehicleId
      );
    }
  }, [selectedVehicleId]);

  // =========================================
  // VEHICLE CHANGE
  // =========================================

  const handleVehicleChange = (
    event
  ) => {
    const vehicleId =
      event.target.value;

    setSelectedVehicleId(
      vehicleId
    );

    const vehicle =
      vehicles.find(
        (item) =>
          String(
            item.id ||
              item._id
          ) ===
          String(vehicleId)
      );

    setSelectedVehicle(
      vehicle || null
    );

    setRating(0);
    setReview("");
    setMessage("");
    setError("");
  };

  // =========================================
  // SUBMIT REVIEW
  // =========================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!selectedVehicleId) {
      setError(
        "Please select a vehicle."
      );
      return;
    }

    if (rating < 1) {
      setError(
        "Please select a rating from 1 to 5 stars."
      );
      return;
    }

    if (!review.trim()) {
      setError(
        "Please write a review."
      );
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API_URL}/api/ratings`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            vehicleId:
              selectedVehicleId,

            customerId:
              customerId,

            rating:
              Number(rating),

            review:
              review.trim(),
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to submit review"
        );
      }

      setMessage(
        "Review submitted successfully."
      );

      // Clear only the input fields
      setRating(0);
      setReview("");

      // IMPORTANT:
      // Fetch ALL reviews again.
      // Previous reviews are NOT deleted.
      await loadReviews(
        selectedVehicleId
      );
    } catch (err) {
      console.error(
        "Submit review error:",
        err
      );

      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================
  // RATING SUMMARY
  // =========================================

  const totalReviews =
    reviews.length;

  const averageRating =
    totalReviews > 0
      ? (
          reviews.reduce(
            (sum, item) =>
              sum +
              Number(
                item.rating || 0
              ),
            0
          ) / totalReviews
        ).toFixed(1)
      : "0.0";

  // =========================================
  // GET RATING COUNT
  // =========================================

  const getRatingCount = (
    value
  ) => {
    return reviews.filter(
      (item) =>
        Number(item.rating) ===
        value
    ).length;
  };

  // =========================================
  // GET RATING PERCENTAGE
  // =========================================

  const getRatingPercentage = (
    value
  ) => {
    if (totalReviews === 0) {
      return 0;
    }

    return Math.round(
      (getRatingCount(value) /
        totalReviews) *
        100
    );
  };

  // =========================================
  // FORMAT DATE
  // =========================================

  const formatDate = (
    value
  ) => {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "-";
    }

    return date.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================================
  // DISPLAY STARS
  // =========================================

  const renderStars = (
    value,
    interactive = false
  ) => {
    return (
      <div
        className={
          interactive
            ? "rating-input-stars"
            : "review-stars"
        }
      >
        {[1, 2, 3, 4, 5].map(
          (star) => (
            <button
              key={star}
              type="button"
              className={
                star <= value
                  ? "star active"
                  : "star"
              }
              onClick={
                interactive
                  ? () =>
                      setRating(
                        star
                      )
                  : undefined
              }
              disabled={
                !interactive
              }
            >
              ★
            </button>
          )
        )}
      </div>
    );
  };

  // =========================================
  // PAGE
  // =========================================

  return (
    <div className="rating-page">

      {/* HEADER */}

      <div className="rating-header">
        <div>
          <h1>
            Vehicle Ratings & Reviews
          </h1>

          <p>
            Share your experience and
            view customer feedback.
          </p>
        </div>
      </div>

      {/* SUCCESS MESSAGE */}

      {message && (
        <div className="rating-success">
          {message}
        </div>
      )}

      {/* ERROR MESSAGE */}

      {error && (
        <div className="rating-error">
          {error}
        </div>
      )}

      {/* VEHICLE SELECTION */}

      <div className="rating-selection-card">

        <div>
          <h2>
            Select Vehicle
          </h2>

          <p>
            Select a vehicle to view
            its reviews.
          </p>
        </div>

        <div className="rating-select">

          <label>
            Vehicle
          </label>

          <select
            value={
              selectedVehicleId
            }
            onChange={
              handleVehicleChange
            }
            disabled={
              loadingVehicles
            }
          >

            {loadingVehicles ? (
              <option value="">
                Loading vehicles...
              </option>
            ) : vehicles.length ===
              0 ? (
              <option value="">
                No vehicles available
              </option>
            ) : (
              vehicles.map(
                (vehicle) => {
                  const vehicleId =
                    vehicle.id ||
                    vehicle._id;

                  return (
                    <option
                      key={
                        vehicleId
                      }
                      value={
                        vehicleId
                      }
                    >
                      {
                        vehicleId
                      }{" "}
                      -{" "}
                      {
                        vehicle.model ||
                        "Vehicle"
                      }
                    </option>
                  );
                }
              )
            )}

          </select>
        </div>
      </div>

      {/* SELECTED VEHICLE */}

      {selectedVehicle && (
        <div className="selected-vehicle-card">

          <div>
            <span>
              Vehicle
            </span>

            <strong>
              {
                selectedVehicle.model ||
                "-"
              }
            </strong>
          </div>

          <div>
            <span>
              Vehicle ID
            </span>

            <strong>
              {
                selectedVehicle.id ||
                selectedVehicle._id ||
                "-"
              }
            </strong>
          </div>

          <div>
            <span>
              Type
            </span>

            <strong>
              {
                selectedVehicle.type ||
                "-"
              }
            </strong>
          </div>

          <div>
            <span>
              Location
            </span>

            <strong>
              {
                selectedVehicle.location ||
                "-"
              }
            </strong>
          </div>

          <div>
            <span>
              Status
            </span>

            <strong>
              {
                selectedVehicle.status ||
                "-"
              }
            </strong>
          </div>

        </div>
      )}

      {/* FORM + SUMMARY */}

      <div className="rating-grid">

        {/* WRITE REVIEW */}

        <div className="rating-form-card">

          <h2>
            Write a Review
          </h2>

          <p className="card-description">
            Tell us about your rental
            experience.
          </p>

          <form
            onSubmit={
              handleSubmit
            }
          >

            <div className="rating-field">

              <label>
                Your Rating
              </label>

              {renderStars(
                rating,
                true
              )}

              <span className="rating-help">

                {rating === 0
                  ? "Select 1 to 5 stars"
                  : `${rating} out of 5`}

              </span>

            </div>

            <div className="rating-field">

              <label>
                Your Review
              </label>

              <textarea
                value={review}
                onChange={(event) =>
                  setReview(
                    event.target.value
                  )
                }
                placeholder="Write your experience..."
                rows="6"
              />

            </div>

            <button
              type="submit"
              className="submit-rating-btn"
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Submit Review"}
            </button>

          </form>
        </div>

        {/* RATING SUMMARY */}

        <div className="rating-summary-card">

          <h2>
            Rating Summary
          </h2>

          <div className="average-rating">

            <strong>
              {averageRating}
            </strong>

            {renderStars(
              Math.round(
                Number(
                  averageRating
                )
              )
            )}

            <span>
              {totalReviews}{" "}
              {totalReviews === 1
                ? "review"
                : "reviews"}
            </span>

          </div>

          <div className="rating-distribution">

            {[5, 4, 3, 2, 1].map(
              (value) => (
                <div
                  className="distribution-row"
                  key={value}
                >

                  <span>
                    {value} ★
                  </span>

                  <div className="distribution-bar">

                    <div
                      className="distribution-fill"
                      style={{
                        width:
                          `${getRatingPercentage(
                            value
                          )}%`,
                      }}
                    />

                  </div>

                  <span>
                    {
                      getRatingCount(
                        value
                      )
                    }
                  </span>

                </div>
              )
            )}

          </div>
        </div>
      </div>

      {/* ALL REVIEWS */}

      <div className="all-reviews-card">

        <div className="reviews-header">

          <div>

            <h2>
              Customer Reviews
            </h2>

            <p>
              All reviews for{" "}
              <strong>
                {
                  selectedVehicle?.model ||
                  "this vehicle"
                }
              </strong>
            </p>

          </div>

          <button
            className="refresh-reviews-btn"
            onClick={() =>
              loadReviews(
                selectedVehicleId
              )
            }
            disabled={
              loadingReviews
            }
          >
            {loadingReviews
              ? "Loading..."
              : "Refresh"}
          </button>

        </div>

        {/* LOADING */}

        {loadingReviews ? (

          <div className="reviews-empty">
            Loading reviews...
          </div>

        ) : reviews.length ===
          0 ? (

          /* NO REVIEWS */

          <div className="reviews-empty">

            <div className="empty-review-icon">
              ★
            </div>

            <h3>
              No reviews yet
            </h3>

            <p>
              Be the first customer to
              review this vehicle.
            </p>

          </div>

        ) : (

          /* SHOW ALL REVIEWS */

          <div className="reviews-list">

            {reviews.map(
              (item, index) => (

                <div
                  className="review-item"
                  key={
                    item._id ||
                    `${item.customerId}-${item.createdAt}-${index}`
                  }
                >

                  <div className="review-top">

                    <div>

                      <div className="review-customer">
                        {
                          item.customerId ||
                          "Customer"
                        }
                      </div>

                      {renderStars(
                        Number(
                          item.rating ||
                            0
                        )
                      )}

                    </div>

                    <span className="review-date">
                      {formatDate(
                        item.createdAt
                      )}
                    </span>

                  </div>

                  <p className="review-text">

                    {
                      item.review ||
                      "No review provided."
                    }

                  </p>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default Rating;