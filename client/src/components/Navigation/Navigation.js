import React from "react";
import { Link } from "react-router-dom";
import "./Navigation.css";

function Navigation() {
  return (
    <nav className="navigation">

      <div className="nav-logo">
        Vehicle Rental
      </div>

      <div className="nav-links">

        <Link to="/login">
          Login
        </Link>

        <Link to="/register">
          Register
        </Link>

        <Link to="/admin">
          Admin
        </Link>

        <Link to="/billing">
          Billing
        </Link>

        <Link to="/rating">
          Rating
        </Link>

        <Link to="/map">
          Vehicle Map
        </Link>

      </div>

    </nav>
  );
}

export default Navigation;