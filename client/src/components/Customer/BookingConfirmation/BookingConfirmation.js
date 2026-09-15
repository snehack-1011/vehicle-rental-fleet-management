import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./BookingConfirmation.css";

const BookingConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const reservation = location.state?.reservation;
    const vehicle = location.state?.vehicle;

    if (!reservation || !vehicle) {
        return (
            <div className="confirmation-page">
                <div className="confirmation-card">
                    <h2>No booking information found</h2>
                    <button onClick={() => navigate("/vehicles")}>
                        Browse Vehicles
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="confirmation-page">
            <div className="confirmation-card">
                <div className="success-icon">✓</div>

                <span className="confirmation-label">
                    Reservation Created
                </span>

                <h1>Booking request received</h1>

                <p className="confirmation-subtitle">
                    Your reservation details have been prepared successfully.
                </p>

                <div className="confirmation-vehicle">
                    <img src={vehicle.image} alt={vehicle.model} />

                    <div>
                        <span>{vehicle.id}</span>
                        <h2>{vehicle.model}</h2>
                        <p>
                            {vehicle.type} • {vehicle.location}
                        </p>
                    </div>
                </div>

                <div className="confirmation-details">
                    <div>
                        <span>Pick-up Date</span>
                        <strong>{reservation.startDate}</strong>
                    </div>

                    <div>
                        <span>Return Date</span>
                        <strong>{reservation.endDate}</strong>
                    </div>

                    <div>
                        <span>Rental Duration</span>
                        <strong>
                            {reservation.rentalDays} day
                            {reservation.rentalDays !== 1 ? "s" : ""}
                        </strong>
                    </div>

                    <div>
                        <span>Price / Day</span>
                        <strong>
                            ₹{vehicle.pricePerDay.toLocaleString("en-IN")}
                        </strong>
                    </div>
                </div>

                <div className="confirmation-total">
                    <span>Estimated Base Amount</span>

                    <strong>
                        ₹
                        {reservation.estimatedBasePrice.toLocaleString(
                            "en-IN"
                        )}
                    </strong>
                </div>

                <div className="confirmation-note">
                    Final booking confirmation, availability verification,
                    double-booking validation and final pricing will later be
                    provided by the backend.
                </div>

                <div className="confirmation-actions">
                    <button
                        className="secondary-action"
                        onClick={() => navigate("/vehicles")}
                    >
                        Browse More Vehicles
                    </button>

                    <button
                        className="primary-action"
                        onClick={() => navigate("/profile")}
                    >
                        View My Rentals
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation;