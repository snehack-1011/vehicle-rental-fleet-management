import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Authentication.css";

const Login = () => {
    const navigate = useNavigate();

    const [credentials, setCredentials] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const users =
            JSON.parse(localStorage.getItem("registeredUsers")) || [];

        const matchedUser = users.find(
            (user) =>
                user.email === credentials.email &&
                user.password === credentials.password
        );

        if (!matchedUser) {
            alert("Invalid email or password");
            return;
        }

        localStorage.setItem(
            "loggedInCustomer",
            JSON.stringify({
                name: matchedUser.name,
                email: matchedUser.email,
                phone: matchedUser.phone
            })
        );

        localStorage.setItem(
            "token",
            "temporary-customer-token"
        );

        navigate("/vehicles");
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-brand">
                    <div className="auth-logo">🚗</div>
                    <h2>DriveSelect</h2>
                </div>

                <div className="auth-heading">
                    <h1>Welcome back</h1>
                    <p>Sign in to continue your vehicle rental journey.</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label>Email Address</label>

                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={credentials.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label>Password</label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="forgot-password">
                        <button
                            type="button"
                            onClick={() => navigate("/forgot-password")}
                        >
                            Forgot password?
                        </button>



                    </div>

                    <button type="submit" className="auth-button">
                        Sign In
                    </button>
                </form>

                <p className="auth-switch">
                    Don't have an account?{" "}
                    <Link to="/register">Create account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;