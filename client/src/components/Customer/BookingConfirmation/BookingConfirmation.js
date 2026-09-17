import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QRCodeSVG from "./QRCodeSVG";
import "./BookingConfirmation.css";

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

const calculateDays = (startDate, endDate, rentalDays) => {
    if (rentalDays && Number(rentalDays) > 0) return Number(rentalDays);
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
};

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

                <div style={{
                    background: "#f0fdf4",
                    color: "#166534",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: "500",
                    border: "1px solid #bbf7d0",
                    marginBottom: "20px",
                    textAlign: "center"
                }}>
                    ✉ Booking confirmed! A confirmation email has been sent to your registered email address.
                </div>

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
                        <strong>{formatDate(reservation.startDate)}</strong>
                    </div>

                    <div>
                        <span>Return Date</span>
                        <strong>{formatDate(reservation.endDate)}</strong>
                    </div>

                    <div>
                        <span>Rental Duration</span>
                        <strong>
                            {`${calculateDays(reservation.startDate, reservation.endDate, reservation.rentalDays)} day${calculateDays(reservation.startDate, reservation.endDate, reservation.rentalDays) !== 1 ? 's' : ''}`}
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
                        <QRCodeSVG value={upiLink} size={150} />
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