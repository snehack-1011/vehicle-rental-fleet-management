import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
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

function App() {
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <Router>
      <div className="App" style={{ fontFamily: 'sans-serif' }}>
        <nav style={{ padding: '15px 30px', backgroundColor: '#111827', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '18px', letterSpacing: '1px' }}>🚗 FleetConnect</div>
          
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {!user ? (
              <>
                <Link to="/login" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500' }}>Login</Link>
                <Link to="/register" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500' }}>Register</Link>
              </>
            ) : (
              <>
                {user.role === 'CUSTOMER' && (
                  <>
                    <Link to="/customer" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500' }}>Rent Vehicles</Link>
                    <Link to="/profile" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500' }}>My Account & Rentals</Link>
                  </>
                )}
                {user.role === 'FLEET_MANAGER' && (
                  <>
                    <Link to="/fleet" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500' }}>Fleet Dashboard</Link>
                    <Link to="/map" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500' }}>Vehicle Map</Link>
                  </>
                )}
                {user.role === 'ADMIN' && (
                  <>
                    <Link to="/admin" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500' }}>Admin Dashboard</Link>
                    <Link to="/map" style={{ color: '#fff', textDecoration: 'none', fontWeight: '500' }}>Vehicle Map</Link>
                  </>
                )}
                <button 
                  onClick={handleLogout} 
                  style={{ background: '#be123c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>

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
      </div>
    </Router>
  );
}

export default App;