import React, { useEffect, useState } from "react";
import {
    fetchCustomerReservations,
    cancelCustomerReservation,
    startCustomerRental,
    returnCustomerRental
} from "../../../services/api";
import "./Profile.css";


const Profile = () => {
    const [customer, setCustomer] = useState({
        name: "Customer",
        email: "",
        phone: ""
    });

    const [rentals, setRentals] = useState([]);
    const [ratings, setRatings] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedCustomer = JSON.parse(
            localStorage.getItem("loggedInCustomer")
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
        setRatings({
            ...ratings,
            [id]: rating
        });
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
                        {customer.name.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <h2>{customer.name}</h2>
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
                                                {rental.startDate}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Return</span>
                                            <strong>
                                                {rental.endDate}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Rental Duration</span>
                                            <strong>
                                                {rental.rentalDays || "-"} day
                                                {rental.rentalDays !== 1
                                                    ? "s"
                                                    : ""}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Estimated Amount</span>
                                            <strong>
                                                ₹
                                                {Number(
                                                    rental.estimatedBasePrice || 0
                                                ).toLocaleString("en-IN")}
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

                                        {rental.status === "RETURNED" && (
                                            <div className="rating-box">

                                                <span>Rate Vehicle</span>

                                                <div>
                                                    {[1, 2, 3, 4, 5].map(
                                                        (star) => (
                                                            <button
                                                                key={star}
                                                                className={
                                                                    (ratings[rental.id] ||
                                                                        0) >= star
                                                                        ? "rating-star active-star"
                                                                        : "rating-star"
                                                                }
                                                                onClick={() =>
                                                                    rateVehicle(
                                                                        rental.id,
                                                                        star
                                                                    )
                                                                }
                                                            >
                                                                ★
                                                            </button>
                                                        )
                                                    )}
                                                </div>

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