import React, { useEffect, useState } from "react";
import {
    fetchCustomerReservations,
    cancelCustomerReservation,
    startCustomerRental,
    returnCustomerRental,
    submitFeedback
} from "../../../services/api";
import "./Profile.css";


const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    } catch (e) {
        return dateStr;
    }
};

const getRentalDays = (rental) => {
    if (rental.rentalDays && Number(rental.rentalDays) > 0) {
        return Number(rental.rentalDays);
    }
    if (rental.startDate && rental.endDate) {
        const start = new Date(rental.startDate);
        const end = new Date(rental.endDate);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 ? diffDays : 1;
        }
    }
    return 0;
};

const getRentalAmount = (rental) => {
    if (rental.priceDetails?.totalPrice !== undefined && rental.priceDetails?.totalPrice !== null) {
        return Number(rental.priceDetails.totalPrice);
    }
    if (rental.priceDetails?.basePrice !== undefined && rental.priceDetails?.basePrice !== null) {
        return Number(rental.priceDetails.basePrice);
    }
    if (rental.estimatedBasePrice !== undefined && rental.estimatedBasePrice !== null) {
        return Number(rental.estimatedBasePrice);
    }
    if (rental.totalPrice !== undefined && rental.totalPrice !== null) {
        return Number(rental.totalPrice);
    }
    if (rental.amount !== undefined && rental.amount !== null) {
        return Number(rental.amount);
    }
    return 0;
};

const Profile = () => {
    const [customer, setCustomer] = useState({
        name: "Customer",
        email: "",
        phone: ""
    });

    const [rentals, setRentals] = useState([]);
    const [ratings, setRatings] = useState({});
    const [reviews, setReviews] = useState({});
    const [submittedFeedback, setSubmittedFeedback] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedCustomer = JSON.parse(
            localStorage.getItem("user")
        );

        if (savedCustomer) {
            setCustomer(savedCustomer);
        }

        loadReservations();
    }, []);

    const loadReservations = async () => {
        setLoading(true);

        const data = await fetchCustomerReservations();

        setRentals(data || []);
        setLoading(false);
    };

    const cancelReservation = async (id) => {
        try {
            await cancelCustomerReservation(id);

            setRentals((currentRentals) =>
                currentRentals.map((rental) =>
                    rental.id === id
                        ? { ...rental, status: "CANCELLED" }
                        : rental
                )
            );
        } catch (error) {
            alert("Unable to cancel reservation. Please try again.");
        }
    };

    const startRental = async (reservationId) => {
        try {
            const result = await startCustomerRental(reservationId);

            setRentals((currentRentals) =>
                currentRentals.map((rental) =>
                    rental.id === reservationId
                        ? {
                            ...rental,
                            status: "RENTED",
                            rentalId:
                                result?.data?.rentalId ||
                                result?.data?.id ||
                                rental.rentalId
                        }
                        : rental
                )
            );
        } catch (error) {
            alert(
                "Unable to start rental. Backend rental service is not available yet."
            );
        }
    };

    const endRental = async (rentalId) => {
        try {
            await returnCustomerRental(rentalId);

            setRentals((currentRentals) =>
                currentRentals.map((rental) =>
                    rental.rentalId === rentalId
                        ? {
                            ...rental,
                            status: "RETURNED"
                        }
                        : rental
                )
            );
        } catch (error) {
            alert(
                "Unable to end rental. Backend rental service is not available yet."
            );
        }
    };

    const rateVehicle = (id, rating) => {
        setRatings({ ...ratings, [id]: rating });
    };

    const handleReviewChange = (id, text) => {
        setReviews({ ...reviews, [id]: text });
    };

    const handleSubmitFeedback = async (rental) => {
        if (!ratings[rental.id] || !reviews[rental.id]) {
            alert("Please provide both a star rating and a text review.");
            return;
        }

        try {
            await submitFeedback({
                reservationId: rental.id,
                vehicleId: rental.vehicleId,
                customerEmail: customer.email,
                rating: ratings[rental.id],
                review: reviews[rental.id]
            });
            setSubmittedFeedback({ ...submittedFeedback, [rental.id]: true });
            alert("Thank you! Your feedback has been submitted.");
        } catch (error) {
            alert("Unable to submit feedback. Please try again.");
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-container">

                <div className="profile-heading">
                    <span>Customer Portal</span>
                    <h1>My Account</h1>
                    <p>
                        Manage your profile, reservations and rental history.
                    </p>
                </div>

                <section className="profile-card">
                    <div className="profile-avatar">
                        {(customer.fullName || customer.name || "C").charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <h2>{customer.fullName || customer.name || "Customer"}</h2>
                        <p>{customer.email || "Email not available"}</p>
                        <p>{customer.phone || "Phone not available"}</p>
                    </div>
                </section>

                <section className="rentals-section">

                    <div className="rentals-heading">
                        <div>
                            <span>Your Rentals</span>
                            <h2>Reservation & Rental History</h2>
                        </div>

                        <div className="rental-count">
                            {rentals.length} records
                        </div>
                    </div>

                    {loading ? (
                        <div className="profile-empty-state">
                            <h3>Loading reservations...</h3>
                        </div>
                    ) : rentals.length === 0 ? (
                        <div className="profile-empty-state">
                            <h3>No rentals yet</h3>
                            <p>
                                Your reservations will appear here after you
                                book a vehicle.
                            </p>
                        </div>
                    ) : (
                        <div className="rental-list">

                            {rentals.map((rental) => (

                                <div
                                    className="rental-card"
                                    key={rental.id}
                                >

                                    <div className="rental-card-top">

                                        <div>
                                            <span className="reservation-id">
                                                {rental.id}
                                            </span>

                                            <h3>
                                                {rental.vehicleModel ||
                                                    rental.vehicleId}
                                            </h3>

                                            <p>{rental.vehicleId}</p>
                                        </div>

                                        <span
                                            className={`status-badge status-${(
                                                rental.status || "RESERVED"
                                            ).toLowerCase()}`}
                                        >
                                            {rental.status || "RESERVED"}
                                        </span>

                                    </div>

                                    <div className="rental-details-grid">

                                        <div>
                                            <span>Pick-up</span>
                                            <strong>
                                                {formatDate(rental.startDate)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Return</span>
                                            <strong>
                                                {formatDate(rental.endDate)}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Rental Duration</span>
                                            <strong>
                                                {getRentalDays(rental) > 0
                                                    ? `${getRentalDays(rental)} day${getRentalDays(rental) !== 1 ? "s" : ""}`
                                                    : "-"}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Estimated Amount</span>
                                            <strong>
                                                ₹
                                                {getRentalAmount(rental).toLocaleString("en-IN")}
                                            </strong>
                                        </div>

                                    </div>

                                    <div className="rental-actions">

                                        {(rental.status || "RESERVED") ===
                                            "RESERVED" && (
                                                <button
                                                    className="cancel-button"
                                                    onClick={() =>
                                                        cancelReservation(rental.id)
                                                    }
                                                >
                                                    Cancel Reservation
                                                </button>
                                            )}

                                        {rental.status === "RESERVED" && (
                                            <button
                                                className="start-rental-button"
                                                onClick={() => startRental(rental.id)}
                                            >
                                                Start Rental
                                            </button>
                                        )}

                                        {rental.status === "RENTED" && rental.rentalId && (
                                            <button
                                                className="end-rental-button"
                                                onClick={() => endRental(rental.rentalId)}
                                            >
                                                End Rental
                                            </button>
                                        )}

                                        {rental.status === "RETURNED" && !submittedFeedback[rental.id] && (
                                            <div className="rating-box">
                                                <span>Rate Vehicle</span>
                                                <div>
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            className={(ratings[rental.id] || 0) >= star ? "rating-star active-star" : "rating-star"}
                                                            onClick={() => rateVehicle(rental.id, star)}
                                                        >
                                                            ★
                                                        </button>
                                                    ))}
                                                </div>
                                                
                                                <textarea 
                                                    className="review-textarea"
                                                    placeholder="Write your review here..."
                                                    value={reviews[rental.id] || ""}
                                                    onChange={(e) => handleReviewChange(rental.id, e.target.value)}
                                                />

                                                <button 
                                                    className="submit-feedback-btn"
                                                    onClick={() => handleSubmitFeedback(rental)}
                                                >
                                                    Submit Feedback
                                                </button>
                                            </div>
                                        )}

                                        {rental.status === "RETURNED" && submittedFeedback[rental.id] && (
                                            <div className="rating-box" style={{textAlign: "center", padding: "10px", background: "#ecfdf5", color: "#047857", borderRadius: "8px"}}>
                                                <strong>Feedback Submitted ✓</strong>
                                            </div>
                                        )}

                                    </div>

                                </div>
                            ))}

                        </div>
                    )}

                </section>
            </div>
        </div>
    );
};

export default Profile;