import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./VehicleDetails.css";

const VehicleDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const vehicle = location.state?.vehicle;

    const searchDates = location.state?.searchDates || {
        startDate: "",
        endDate: ""
    };

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
            </div>
        </div>
    );
};

export default VehicleDetails;