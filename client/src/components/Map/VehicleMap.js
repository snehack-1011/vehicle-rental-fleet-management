import React, { useState } from "react";
import "./VehicleMap.css";

function VehicleMap() {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const vehicles = [
    {
      id: "CAR1001",
      name: "Hyundai Creta",
      latitude: 12.9716,
      longitude: 77.5946,
      location: "Bengaluru",
      status: "Available",
      timestamp: "10:30 AM",
    },
    {
      id: "CAR1002",
      name: "Honda City",
      latitude: 12.2958,
      longitude: 76.6394,
      location: "Mysuru",
      status: "Rented",
      timestamp: "10:25 AM",
    },
    {
      id: "CAR1003",
      name: "Tata Nexon EV",
      latitude: 13.0827,
      longitude: 80.2707,
      location: "Chennai",
      status: "Rented",
      timestamp: "10:20 AM",
    },
    {
      id: "CAR1004",
      name: "Toyota Innova",
      latitude: 17.385,
      longitude: 78.4867,
      location: "Hyderabad",
      status: "Reserved",
      timestamp: "10:15 AM",
    },
  ];

  return (
    <div className="vehicle-map-container">

      <div className="map-header">
        <h1>Vehicle Location Tracking</h1>
        <p>Monitor vehicle locations and current status</p>
      </div>

      <div className="map-content">

        <div className="vehicle-list">
          <h2>Vehicles</h2>

          {vehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className={`vehicle-item ${
                selectedVehicle?.id === vehicle.id ? "selected" : ""
              }`}
              onClick={() => setSelectedVehicle(vehicle)}
            >
              <div className="vehicle-icon">🚗</div>

              <div className="vehicle-details">
                <h3>{vehicle.name}</h3>
                <p>{vehicle.id}</p>

                <span
                  className={`map-status ${vehicle.status.toLowerCase()}`}
                >
                  {vehicle.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="map-area">

          <div className="map-placeholder">

            <div className="map-title">
              📍 Vehicle Map
            </div>

            {vehicles.map((vehicle, index) => (
              <button
                key={vehicle.id}
                className={`map-marker marker-${index + 1}`}
                onClick={() => setSelectedVehicle(vehicle)}
                title={vehicle.name}
              >
                🚗
              </button>
            ))}

            <div className="map-road road-one"></div>
            <div className="map-road road-two"></div>
            <div className="map-road road-three"></div>

          </div>

          {selectedVehicle && (
            <div className="selected-vehicle">

              <div>
                <h2>{selectedVehicle.name}</h2>
                <p>Vehicle ID: {selectedVehicle.id}</p>
              </div>

              <div className="location-info">

                <p>
                  <strong>Location:</strong>{" "}
                  {selectedVehicle.location}
                </p>

                <p>
                  <strong>Latitude:</strong>{" "}
                  {selectedVehicle.latitude}
                </p>

                <p>
                  <strong>Longitude:</strong>{" "}
                  {selectedVehicle.longitude}
                </p>

                <p>
                  <strong>Last Updated:</strong>{" "}
                  {selectedVehicle.timestamp}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {selectedVehicle.status}
                </p>

              </div>

            </div>
          )}

        </div>
      </div>

      <div className="location-table-section">

        <h2>Vehicle Location Details</h2>

        <table className="location-table">

          <thead>
            <tr>
              <th>Vehicle ID</th>
              <th>Vehicle</th>
              <th>Location</th>
              <th>Latitude</th>
              <th>Longitude</th>
              <th>Status</th>
              <th>Last Updated</th>
            </tr>
          </thead>

          <tbody>

            {vehicles.map((vehicle) => (
              <tr key={vehicle.id}>

                <td>{vehicle.id}</td>
                <td>{vehicle.name}</td>
                <td>{vehicle.location}</td>
                <td>{vehicle.latitude}</td>
                <td>{vehicle.longitude}</td>

                <td>
                  <span
                    className={`map-status ${vehicle.status.toLowerCase()}`}
                  >
                    {vehicle.status}
                  </span>
                </td>

                <td>{vehicle.timestamp}</td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default VehicleMap;