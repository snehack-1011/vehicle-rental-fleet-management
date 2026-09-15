import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Authentication.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        setMessage(
            "Password reset request submitted. Backend integration will be added later."
        );
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <div className="auth-brand">
                    <div className="auth-logo">🚗</div>
                    <h2>DriveSelect</h2>
                </div>

                <div className="auth-heading">
                    <h1>Reset your password</h1>
                    <p>
                        Enter your registered email address to request a password reset.
                    </p>
                </div>

                {message && (
                    <div
                        style={{
                            background: "#ecfdf5",
                            color: "#15803d",
                            padding: "12px",
                            borderRadius: "8px",
                            marginBottom: "16px"
                        }}
                    >
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label>Email Address</label>

                        <input
                            type="email"
                            placeholder="Enter your registered email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="auth-button">
                        Send Reset Request
                    </button>
                </form>

                <p className="auth-switch">
                    Remember your password?{" "}
                    <Link to="/login">Back to Sign In</Link>
                </p>

            </div>
        </div>
    );
};

export default ForgotPassword;