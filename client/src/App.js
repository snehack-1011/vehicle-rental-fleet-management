import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Authentication/Login';
import Register from './components/Authentication/Register';
import BrowseVehicles from './components/Customer/BrowseVehicles/BrowseVehicles';
import VehicleDetails from './components/Customer/VehicleDetails/VehicleDetails';
import BookingForm from './components/Customer/BookingForm/BookingForm';
import BookingConfirmation from './components/Customer/BookingConfirmation/BookingConfirmation';
import Profile from './components/Customer/Profile/Profile';
import AdminDashboard from './components/Admin/AdminDashboard';
import FleetDashboard from './Frontend2/Dashboard';
import VehicleMap from './components/Map/VehicleMap';
import Header from './components/Header/Header';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <div className="App">
            <Header />
            <main className="app-main-content">
              <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/customer" element={<BrowseVehicles />} />
                <Route path="/vehicle-details" element={<VehicleDetails />} />
                <Route path="/booking" element={<BookingForm />} />
                <Route path="/booking-confirmation" element={<BookingConfirmation />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/fleet" element={<FleetDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/map" element={<VehicleMap />} />
              </Routes>
            </main>
          </div>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;