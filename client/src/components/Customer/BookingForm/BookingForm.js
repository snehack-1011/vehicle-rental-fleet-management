import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createReservation } from "../../../services/api";
import "./BookingForm.css";

const BookingForm = () => {
    const location = useLocation();
    const navigate = useNavigate();


    const today = new Date().toISOString().split("T")[0];

    // rest of your existing code...

    // Selected vehicle coming from BrowseVehicles.js
    const vehicle = location.state?.vehicle;

    // Search dates coming from BrowseVehicles.js
    const searchDates = location.state?.searchDates || {};

    const [startDate, setStartDate] = useState(
        searchDates.startDate || ""
    );

    const [endDate, setEndDate] = useState(
        searchDates.endDate || ""
    );

    const [error, setError] = useState("");

    // Calculate number of rental days dynamically
    const rentalDays = useMemo(() => {
        if (!startDate || !endDate) {
            return 0;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        const difference = end - start;

        if (difference < 0) {
            return 0;
        }

        const days =
            Math.ceil(difference / (1000 * 60 * 60 * 24)) + 1;

        return days;
    }, [startDate, endDate]);

    // Frontend estimate only.
    // Final price will later come from backend pricing API.
    const estimatedBasePrice =
        vehicle && rentalDays > 0
            ? vehicle.pricePerDay * rentalDays
            : 0;

    const handleReservation = async (e) => {
        e.preventDefault();

        setError("");

        if (!vehicle) {
            setError("Vehicle information is unavailable.");
            return;
        }

        if (!startDate || !endDate) {
            setError("Select both pick-up and return dates.");
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            setError("Return date cannot be before the pick-up date.");
            return;
        }

        // The backend identifies the customer from the JWT (sent by api.js).
        // Do NOT send userId or customerEmail in the body — the backend is the source of truth.
        const reservationData = {
            vehicleId: vehicle.id,
            vehicleModel: vehicle.model,
            startDate,
            endDate,
            rentalDays,
            estimatedBasePrice
        };

        const response =
            await createReservation(reservationData);

        const savedReservation =
            response?.data || reservationData;

        navigate("/booking-confirmation", {
            state: {
                reservation: savedReservation,
                vehicle
            }
        });
    };

    if (!vehicle) {
        return (
            <div className="booking-error-page">
                <div className="booking-error-card">
                    <h2>No vehicle selected</h2>

                    <p>
                        Select a vehicle before continuing with the
                        reservation.
                    </p>

                    <button onClick={() => navigate("/vehicles")}>
                        Browse Vehicles
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-page">
            <div className="booking-container">

                <div className="booking-heading">
                    <span>Reservation</span>

                    <h1>Complete your booking</h1>

                    <p>
                        Review the selected vehicle and choose your rental
                        period.
                    </p>
                </div>

                <div className="booking-layout">

                    {/* LEFT SIDE */}
                    <div className="booking-form-card">

                        <h2>Rental Details</h2>

                        {error && (
                            <div className="booking-error-message">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleReservation}>

                            <div className="booking-field-row">

                                <div className="booking-field">
                                    <label>Pick-up Date</label>

                                    <input
                                        type="date"
                                        value={startDate}
                                        min={today}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        required
                                    />

                                </div>

                                <div className="booking-field">
                                    <label>Return Date</label>

                                    <input
                                        type="date"
                                        value={endDate}
                                        min={startDate || today}
                                        onChange={(e) =>
                                            setEndDate(e.target.value)
                                        }
                                        required
                                    />
                                </div>

                            </div>

                            <div className="booking-information-box">

                                <div>
                                    <span>Rental Duration</span>

                                    <strong>
                                        {rentalDays > 0
                                            ? `${rentalDays} day${rentalDays > 1 ? "s" : ""
                                            }`
                                            : "Select dates"}
                                    </strong>
                                </div>

                                <div>
                                    <span>Vehicle Status</span>

                                    <strong className="available-text">
                                        {vehicle.status}
                                    </strong>
                                </div>

                            </div>

                            <div className="booking-note">

                                <strong>Availability Check</strong>

                                <p>
                                    Final vehicle availability and double-booking
                                    validation will be confirmed by the backend
                                    reservation system.
                                </p>

                            </div>

                            <button
                                type="submit"
                                className="confirm-booking-button"
                            >
                                Continue Reservation
                            </button>

                        </form>

                    </div>

                    {/* RIGHT SIDE */}
                    <div className="booking-summary-card">

                        <div className="booking-vehicle-image">
                            <img
                                src={vehicle.image}
                                alt={vehicle.model}
                            />
                        </div>

                        <div className="booking-summary-content">

                            <span className="booking-vehicle-id">
                                {vehicle.id}
                            </span>

                            <h2>{vehicle.model}</h2>

                            <p className="booking-vehicle-meta">
                                {vehicle.type} • {vehicle.fuelType} •{" "}
                                {vehicle.transmission}
                            </p>

                            <div className="booking-summary-details">

                                <div>
                                    <span>Location</span>
                                    <strong>{vehicle.location}</strong>
                                </div>

                                <div>
                                    <span>Seats</span>
                                    <strong>{vehicle.seats}</strong>
                                </div>

                                <div>
                                    <span>Rating</span>
                                    <strong>★ {vehicle.rating}</strong>
                                </div>

                                <div>
                                    <span>Condition</span>
                                    <strong>{vehicle.condition}</strong>
                                </div>

                            </div>

                            <div className="booking-price-section">

                                <div>
                                    <span>Price per day</span>

                                    <strong>
                                        ₹
                                        {vehicle.pricePerDay.toLocaleString(
                                            "en-IN"
                                        )}
                                    </strong>
                                </div>

                                {rentalDays > 0 && (
                                    <div className="estimated-total">

                                        <span>Estimated Base Amount</span>

                                        <strong>
                                            ₹
                                            {estimatedBasePrice.toLocaleString(
                                                "en-IN"
                                            )}
                                        </strong>

                                    </div>
                                )}

                            </div>

                            <p className="price-disclaimer">
                                Final amount may include pricing adjustments,
                                insurance, additional-driver charges or other
                                applicable fees calculated by the backend.
                            </p>

                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
};

export default BookingForm;