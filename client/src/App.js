import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";

import Login from "./components/Authentication/Login";
import Register from "./components/Authentication/Register";
import BrowseVehicles from "./components/Customer/BrowseVehicles/BrowseVehicles";
import BookingForm from "./components/Customer/BookingForm/BookingForm";
import BookingConfirmation from "./components/Customer/BookingConfirmation/BookingConfirmation";
import Profile from "./components/Customer/Profile/Profile";
import Navbar from "./components/Navbar/Navbar";
import ForgotPassword from "./components/Authentication/ForgotPassword";
import VehicleDetails from "./components/Customer/VehicleDetails/VehicleDetails";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppContent = () => {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/forgot-password";

  return (
    <>
      {!hideNavbar && <Navbar />}

      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route path="/login" element={<Login />} />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/vehicles"
          element={
            <ProtectedRoute>
              <BrowseVehicles />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <BookingForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/booking-confirmation"
          element={
            <ProtectedRoute>
              <BookingConfirmation />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/vehicle-details"
          element={
            <ProtectedRoute>
              <VehicleDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;