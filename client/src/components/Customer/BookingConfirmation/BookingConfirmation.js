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
    const amountToPay = reservation.priceDetails?.totalPrice || reservation.estimatedBasePrice || 0;
    const upiLink = `upi://pay?pa=fleetconnect@upi&pn=FleetConnect&am=${amountToPay}&cu=INR`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiLink)}`;

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
                            {reservation.rentalDays ? `${reservation.rentalDays} days` : 'Calculated'}
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
                    <span>Total Amount (Inc. base, fees)</span>

                    <strong>
                        ₹
                        {(reservation.priceDetails?.totalPrice || reservation.estimatedBasePrice || 0).toLocaleString(
                            "en-IN"
                        )}
                    </strong>
                </div>

                <div className="confirmation-note" style={{marginBottom: "15px"}}>
                    Final booking confirmation, availability verification,
                    double-booking validation and final pricing are processed by the backend.
                </div>

                <div className="payment-section" style={{
                    background: "#f8fafc", 
                    padding: "20px", 
                    borderRadius: "10px", 
                    border: "1px solid #e2e8f0", 
                    textAlign: "center",
                    marginBottom: "25px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px"
                }}>
                    <h3 style={{margin: "0 0 5px 0", color: "#1e293b", fontSize: "16px"}}>Pay via UPI</h3>
                    <p style={{margin: 0, color: "#64748b", fontSize: "13px"}}>Scan the QR code below using Google Pay, PhonePe, or Paytm to complete your payment.</p>
                    <div style={{background: "white", padding: "10px", borderRadius: "10px", display: "inline-block", border: "1px solid #e2e8f0", marginTop: "10px"}}>
                        <img src={qrCodeUrl} alt="UPI Payment QR Code" style={{width: "150px", height: "150px"}} />
                    </div>
                    <p style={{margin: "5px 0 0 0", color: "#334155", fontWeight: "600"}}>Amount: ₹{amountToPay.toLocaleString("en-IN")}</p>
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