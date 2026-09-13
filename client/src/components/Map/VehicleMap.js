import React, { useState } from "react";
import "./VehicleMap.css";

function VehicleMap() {
  const [vehicle, setVehicle] = useState({
    id: "CAR1001",
    model: "Hyundai Creta",
    type: "SUV",
    location: "Hyderabad",
    status: "AVAILABLE",
    latitude: 17.3850,
    longitude: 78.4867,
    timestamp: new Date().toLocaleString(),
  });

  const [message, setMessage] = useState("");

  const simulateLocation = () => {
    const newLatitude =
      vehicle.latitude + (Math.random() - 0.5) * 0.02;

    const newLongitude =
      vehicle.longitude + (Math.random() - 0.5) * 0.02;

    setVehicle({
      ...vehicle,
      latitude: newLatitude,
      longitude: newLongitude,
      timestamp: new Date().toLocaleString(),
    });

    setMessage("Vehicle location updated successfully.");
  };

  const getMapPosition = () => {
    const minLat = 17.30;
    const maxLat = 17.50;

    const minLng = 78.35;
    const maxLng = 78.60;

    let left =
      ((vehicle.longitude - minLng) /
        (maxLng - minLng)) *
      100;

    let top =
      100 -
      ((vehicle.latitude - minLat) /
        (maxLat - minLat)) *
      100;

    left = Math.max(5, Math.min(95, left));
    top = Math.max(5, Math.min(95, top));

    return {
      left: `${left}%`,
      top: `${top}%`,
    };
  };

  const markerPosition = getMapPosition();

  return (
    <div className="vehicle-map-page">

      <div className="map-header">
        <div>
          <h1>Vehicle Location Tracking</h1>
          <p>
            Track the simulated current location of the vehicle.
          </p>
        </div>

        <button
          className="simulate-button"
          onClick={simulateLocation}
        >
          Simulate Location
        </button>
      </div>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      <div className="vehicle-map-layout">

        {/* VEHICLE DETAILS */}

        <div className="vehicle-details-card">

          <h2>Vehicle</h2>

          <div className="vehicle-info">
            <div className="vehicle-icon">🚗</div>

            <h2>{vehicle.model}</h2>

            <p>
              <strong>Vehicle ID:</strong> {vehicle.id}
            </p>

            <p>
              <strong>Type:</strong> {vehicle.type}
            </p>

            <p>
              <strong>Location:</strong> {vehicle.location}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              <span className="status">
                {vehicle.status}
              </span>
            </p>

          </div>

        </div>

        {/* MAP */}

        <div className="map-card">

          <h2>Vehicle Map</h2>

          <div className="map-area">

            <div className="road road-1"></div>
            <div className="road road-2"></div>
            <div className="road road-3"></div>
            <div className="road road-4"></div>

            <div className="city-name">
              Hyderabad
            </div>

            <div
              className="vehicle-marker"
              style={{
                left: markerPosition.left,
                top: markerPosition.top,
              }}
            >
              🚗
              <span>CAR1001</span>
            </div>

          </div>

        </div>

      </div>

      {/* LOCATION DETAILS */}

      <div className="location-details-card">

        <h2>Vehicle Location Details</h2>

        <table>

          <thead>
            <tr>
              <th>Vehicle ID</th>
              <th>Vehicle</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Status</th>
              <th>Last Updated</th>
            </tr>
          </thead>

          <tbody>
            <tr>

              <td>{vehicle.id}</td>

              <td>{vehicle.model}</td>

              <td>
                {vehicle.latitude.toFixed(6)}
              </td>

              <td>
                {vehicle.longitude.toFixed(6)}
              </td>

              <td>
                <span className="status">
                  {vehicle.status}
                </span>
              </td>

              <td>{vehicle.timestamp}</td>

            </tr>
          </tbody>

        </table>

      </div>

    </div>
  );
}

export default VehicleMap;