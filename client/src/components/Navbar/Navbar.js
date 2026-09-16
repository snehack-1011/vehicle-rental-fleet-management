import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("loggedInCustomer");

        navigate("/login");
    };

    return (
        <nav className="main-navbar">
            <div className="navbar-container">
                <div
                    className="navbar-brand"
                    onClick={() => navigate("/vehicles")}
                >
                    <div className="brand-icon">🚗</div>

                    <div className="brand-text">
                        <span className="brand-name">DriveSelect</span>
                        <span className="brand-subtitle">Vehicle Rental</span>
                    </div>
                </div>

                <div className="navbar-links">
                    <NavLink
                        to="/vehicles"
                        className={({ isActive }) =>
                            isActive ? "nav-link active-nav-link" : "nav-link"
                        }
                    >
                        Browse Vehicles
                    </NavLink>

                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            isActive ? "nav-link active-nav-link" : "nav-link"
                        }
                    >
                        My Rentals
                    </NavLink>

                    <button
                        className="logout-button"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;