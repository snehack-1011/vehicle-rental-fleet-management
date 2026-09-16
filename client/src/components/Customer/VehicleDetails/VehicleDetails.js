import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchFeedback } from "../../../services/api";
import "./VehicleDetails.css";

const VehicleDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const vehicle = location.state?.vehicle;

    const searchDates = location.state?.searchDates || {
        startDate: "",
        endDate: ""
    };

    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        if (vehicle?.id) {
            fetchFeedback().then((allFeedback) => {
                const vehicleReviews = allFeedback.filter(fb => fb.vehicleId === vehicle.id);
                setReviews(vehicleReviews);
            }).catch(console.error);
        }
    }, [vehicle]);

    if (!vehicle) {
        return (
            <div className="details-error">
                <h2>No vehicle selected</h2>
                <button onClick={() => navigate("/vehicles")}>
                    Back to Vehicles
                </button>
            </div>
        );
    }

    return (
        <div className="vehicle-details-page">
            <div className="vehicle-details-container">

                <button
                    className="back-button"
                    onClick={() => navigate("/vehicles")}
                >
                    ← Back to Vehicles
                </button>

                <div className="vehicle-details-card">

                    <div className="vehicle-details-image">
                        <img src={vehicle.image} alt={vehicle.model} />
                    </div>

                    <div className="vehicle-details-content">

                        <span className="details-id">{vehicle.id}</span>

                        <h1>{vehicle.model}</h1>

                        <p className="details-meta">
                            {vehicle.type} • {vehicle.fuelType} • {vehicle.transmission}
                        </p>

                        <div className="details-grid">
                            <div>
                                <span>Location</span>
                                <strong>{vehicle.location}</strong>
                            </div>

                            <div>
                                <span>Seats</span>
                                <strong>{vehicle.seats}</strong>
                            </div>

                            <div>
                                <span>Condition</span>
                                <strong>{vehicle.condition}</strong>
                            </div>

                            <div>
                                <span>Rating</span>
                                <strong>★ {vehicle.rating}</strong>
                            </div>

                            <div>
                                <span>Distance</span>
                                <strong>{vehicle.distanceKm} km</strong>
                            </div>

                            <div>
                                <span>Status</span>
                                <strong className="details-status">
                                    {vehicle.status}
                                </strong>
                            </div>
                        </div>

                        <div className="details-price">
                            <span>Rental Price</span>

                            <strong>
                                ₹{vehicle.pricePerDay.toLocaleString("en-IN")}
                                <small>/day</small>
                            </strong>
                        </div>

                        <button
                            className="details-reserve-button"
                            onClick={() =>
                                navigate("/booking", {
                                    state: {
                                        vehicle,
                                        searchDates
                                    }
                                })
                            }
                        >
                            Reserve This Vehicle
                        </button>

                    </div>
                </div>

                <div className="vehicle-reviews-section" style={{marginTop: "30px", background: "white", padding: "25px", borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)"}}>
                    <h2 style={{margin: "0 0 15px 0", fontSize: "20px"}}>Customer Reviews</h2>
                    {reviews.length === 0 ? (
                        <p style={{color: "#64748b", fontStyle: "italic"}}>No reviews yet for this vehicle.</p>
                    ) : (
                        <div style={{display: "flex", flexDirection: "column", gap: "15px"}}>
                            {reviews.map((fb, idx) => (
                                <div key={idx} style={{padding: "15px", border: "1px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc"}}>
                                    <div style={{display: "flex", justifyContent: "space-between"}}>
                                        <strong>{fb.customerEmail}</strong>
                                        <span style={{color: "#f59e0b"}}>{"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)}</span>
                                    </div>
                                    <p style={{margin: "8px 0 0 0", color: "#334155"}}>"{fb.review}"</p>
                                    <small style={{color: "#94a3b8", display: "block", marginTop: "8px"}}>{new Date(fb.timestamp).toLocaleDateString()}</small>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default VehicleDetails;