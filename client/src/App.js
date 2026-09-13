import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import Login from './components/Authentication/Login';
import Register from './components/Authentication/Register';
import AdminDashboard from './components/Admin/AdminDashboard';
import Billing from './components/Billing/Billing';
import Rating from './components/Rating/Rating';
import VehicleMap from './components/Map/VehicleMap';
import Navigation from './components/Navigation/Navigation';

function App() {
  return (
    <BrowserRouter>

      <Navigation />

      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        <Route
          path="/billing"
          element={<Billing />}
        />

        <Route
          path="/rating"
          element={<Rating />}
        />

        <Route
          path="/map"
          element={<VehicleMap />}
        />

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;