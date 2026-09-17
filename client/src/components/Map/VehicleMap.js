import React, {
  useEffect,
  useState,
} from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";
import "./VehicleMap.css";


const API_URL =
  "http://localhost:5000";


// ======================================================
// DEFAULT HYDERABAD LOCATION
// ======================================================

const DEFAULT_LATITUDE = 17.385;

const DEFAULT_LONGITUDE = 78.4867;


// ======================================================
// FIX LEAFLET MARKER ICON
// ======================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


// ======================================================
// MAP CENTER
// ======================================================

function MapCenter({
  latitude,
  longitude,
}) {
  const map = useMap();

  useEffect(() => {
    if (
      latitude !== undefined &&
      longitude !== undefined
    ) {
      map.setView(
        [
          Number(latitude),
          Number(longitude),
        ],
        14
      );
    }
  }, [
    latitude,
    longitude,
    map,
  ]);

  return null;
}


// ======================================================
// REVERSE GEOCODING
// ======================================================

const getAddress = async (
  latitude,
  longitude
) => {
  try {
    const response =
      await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=en`,
        {
          headers: {
            Accept:
              "application/json",
          },
        }
      );

    if (!response.ok) {
      return "Address not available";
    }

    const data =
      await response.json();

    return (
      data.display_name ||
      "Address not available"
    );

  } catch (error) {

    console.error(
      "Address lookup error:",
      error
    );

    return "Address not available";
  }
};


// ======================================================
// GET VEHICLE ID
// ======================================================

const getVehicleId = (
  vehicle
) => {
  return String(
    vehicle.id ||
      vehicle._id
  );
};


// ======================================================
// MAIN COMPONENT
// ======================================================

function VehicleMap() {

  const [
    vehicles,
    setVehicles,
  ] = useState([]);

  const [
    locations,
    setLocations,
  ] = useState([]);

  const [
    addresses,
    setAddresses,
  ] = useState({});

  const [
    selectedVehicleId,
    setSelectedVehicleId,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    addressLoading,
    setAddressLoading,
  ] = useState(false);

  const [
    updatingVehicleId,
    setUpdatingVehicleId,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");


// ======================================================
// LOAD VEHICLES
// ======================================================

  const loadVehicles =
    async () => {

      try {

        const response =
          await fetch(
            `${API_URL}/api/vehicles`
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load vehicles"
          );
        }

        const vehicleList =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data.vehicles
              )
            ? data.vehicles
            : [];

        setVehicles(
          vehicleList
        );

        if (
          vehicleList.length >
          0
        ) {

          setSelectedVehicleId(
            getVehicleId(
              vehicleList[0]
            )
          );

        }

        return vehicleList;

      } catch (err) {

        console.error(
          "Vehicle loading error:",
          err
        );

        setError(
          err.message
        );

        return [];

      }
    };


// ======================================================
// LOAD LOCATIONS
// ======================================================

  const loadLocations =
    async () => {

      try {

        let response =
          await fetch(
            `${API_URL}/api/locations/latest`
          );

        let data =
          await response.json();

        if (!response.ok || !data.locations) {
          response =
            await fetch(
              `${API_URL}/api/locations`
            );
          data =
            await response.json();
        }

        const locationList =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data.locations
              )
            ? data.locations
            : [];

        setLocations(
          (prevLocations) => {
            const locMap = new Map();
            prevLocations.forEach((loc) => locMap.set(String(loc.vehicleId), loc));
            locationList.forEach((loc) => locMap.set(String(loc.vehicleId), loc));
            return Array.from(locMap.values());
          }
        );

        return locationList;

      } catch (err) {

        console.error(
          "Location loading error:",
          err
        );

        return [];

      }
    };


// ======================================================
// GET LATEST LOCATION FOR VEHICLE
// ======================================================

  const getLatestLocation =
    (vehicleId) => {

      const vehicleLocations =
        locations
          .filter(
            (location) =>
              String(
                location.vehicleId
              ) ===
              String(
                vehicleId
              )
          )
          .sort(
            (
              first,
              second
            ) => {

              return (
                new Date(
                  second.timestamp ||
                    0
                ) -
                new Date(
                  first.timestamp ||
                    0
                )
              );

            }
          );

      if (
        vehicleLocations.length >
        0
      ) {
        return vehicleLocations[0];
      }

      return null;
    };


// ======================================================
// GET POSITION FOR VEHICLE
// ======================================================

  const getVehiclePosition =
    (
      vehicle,
      index
    ) => {

      const vehicleId =
        getVehicleId(
          vehicle
        );

      const latestLocation =
        getLatestLocation(
          vehicleId
        );

      if (
        latestLocation &&
        latestLocation.latitude !==
          undefined &&
        latestLocation.longitude !==
          undefined
      ) {

        return {
          latitude:
            Number(
              latestLocation.latitude
            ),

          longitude:
            Number(
              latestLocation.longitude
            ),

          timestamp:
            latestLocation.timestamp,

          tracked: true,
        };
      }


      // ------------------------------------------
      // CITY-AWARE DEFAULT POSITIONS
      // ------------------------------------------

      const CITY_COORDINATES = {
        bengaluru: { latitude: 12.9716, longitude: 77.5946 },
        bangalore: { latitude: 12.9716, longitude: 77.5946 },
        hyderabad: { latitude: 17.3850, longitude: 78.4867 },
        mumbai: { latitude: 19.0760, longitude: 72.8777 },
        delhi: { latitude: 28.6139, longitude: 77.2090 },
        chennai: { latitude: 13.0827, longitude: 80.2707 },
        pune: { latitude: 18.5204, longitude: 73.8567 }
      };

      const cityKey = (vehicle?.location || "").toLowerCase().trim();
      const baseCity = CITY_COORDINATES[cityKey] || { latitude: 17.3850, longitude: 78.4867 };

      const latOffset = ((index % 5) - 2) * 0.008;
      const lngOffset = (Math.floor(index / 5) % 3 - 1) * 0.008;

      return {
        latitude: baseCity.latitude + latOffset,
        longitude: baseCity.longitude + lngOffset,
        timestamp: null,
        tracked: false,
      };
    };


// ======================================================
// LOAD ADDRESSES FOR VEHICLES
// ======================================================

  const loadAddresses =
    async (
      vehicleList,
      locationList
    ) => {

      if (
        vehicleList.length ===
        0
      ) {
        return;
      }

      try {

        setAddressLoading(
          true
        );

        const newAddresses =
          {};

        for (
          let index = 0;
          index <
          vehicleList.length;
          index++
        ) {

          const vehicle =
            vehicleList[index];

          const vehicleId =
            getVehicleId(
              vehicle
            );


          // Find latest saved location

          const vehicleLocations =
            locationList
              .filter(
                (location) =>
                  String(
                    location.vehicleId
                  ) ===
                  String(
                    vehicleId
                  )
              )
              .sort(
                (
                  first,
                  second
                ) =>
                  new Date(
                    second.timestamp ||
                      0
                  ) -
                  new Date(
                    first.timestamp ||
                      0
                  )
              );


          let latitude;

          let longitude;


          if (
            vehicleLocations.length >
            0
          ) {

            latitude =
              Number(
                vehicleLocations[0]
                  .latitude
              );

            longitude =
              Number(
                vehicleLocations[0]
                  .longitude
              );

          } else {

            const defaultPosition =
              getVehiclePosition(
                vehicle,
                index
              );

            latitude =
              defaultPosition.latitude;

            longitude =
              defaultPosition.longitude;
          }


          const address =
            await getAddress(
              latitude,
              longitude
            );


          newAddresses[
            vehicleId
          ] = address;


          // Small delay between
          // address requests

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                1000
              )
          );

        }


        setAddresses(
          newAddresses
        );

      } catch (err) {

        console.error(
          "Address loading error:",
          err
        );

      } finally {

        setAddressLoading(
          false
        );
      }
    };


// ======================================================
// INITIAL LOAD & AUTOMATIC POLLING
// ======================================================

  useEffect(() => {

    let isMounted = true;

    const loadData =
      async () => {

        setLoading(true);

        const vehicleList =
          await loadVehicles();

        const locationList =
          await loadLocations();

        if (isMounted) {
          await loadAddresses(
            vehicleList,
            locationList
          );
          setLoading(false);
        }
      };

    loadData();

    // Auto GPS Polling Interval (every 5 seconds)
    const pollingInterval = setInterval(async () => {
      if (isMounted) {
        await loadLocations();
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(pollingInterval);
    };

  }, []);


// ======================================================
// SIMULATE LOCATION
// ======================================================

  const simulateLocation =
    async (
      vehicle
    ) => {

      try {

        setMessage("");
        setError("");

        const vehicleId =
          getVehicleId(
            vehicle
          );

        setUpdatingVehicleId(
          vehicleId
        );


        // ------------------------------------------
        // Current position
        // ------------------------------------------

        const vehicleIndex =
          vehicles.findIndex(
            (item) =>
              getVehicleId(
                item
              ) ===
              vehicleId
          );

        const currentPosition =
          getVehiclePosition(
            vehicle,
            vehicleIndex
          );


        let latitude =
          currentPosition.latitude;

        let longitude =
          currentPosition.longitude;


        // ------------------------------------------
        // Move vehicle slightly
        // ------------------------------------------

        latitude +=
          (Math.random() -
            0.5) *
          0.006;

        longitude +=
          (Math.random() -
            0.5) *
          0.006;


        const timestamp =
          new Date();


        // ------------------------------------------
        // Get address
        // ------------------------------------------

        const address =
          await getAddress(
            latitude,
            longitude
          );


        // ------------------------------------------
        // Save location
        // ------------------------------------------

        const response =
          await fetch(
            `${API_URL}/api/locations`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                vehicleId:
                  vehicleId,

                latitude:
                  latitude,

                longitude:
                  longitude,

                timestamp:
                  timestamp,
              }),
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          throw new Error(
            data.message ||
              "Failed to save location"
          );

        }


        // ------------------------------------------
        // Update frontend
        // ------------------------------------------

        const newLocation = {
          vehicleId:
            vehicleId,

          latitude:
            latitude,

          longitude:
            longitude,

          timestamp:
            timestamp,
        };


        setLocations(
          (
            currentLocations
          ) => [
            ...currentLocations,
            newLocation,
          ]
        );


        setAddresses(
          (
            currentAddresses
          ) => ({
            ...currentAddresses,

            [vehicleId]:
              address,
          })
        );


        setSelectedVehicleId(
          vehicleId
        );


        setMessage(
          `${vehicle.model || "Vehicle"} location updated successfully.`
        );

      } catch (err) {

        console.error(
          "Location update error:",
          err
        );

        setError(
          err.message
        );

      } finally {

        setUpdatingVehicleId(
          ""
        );
      }
    };


// ======================================================
// REFRESH
// ======================================================

  const refreshMap =
    async () => {

      setMessage("");
      setError("");
      setLoading(true);

      const vehicleList =
        await loadVehicles();

      const locationList =
        await loadLocations();

      await loadAddresses(
        vehicleList,
        locationList
      );

      setLoading(false);

      setMessage(
        "Vehicle map refreshed successfully."
      );
    };


// ======================================================
// FORMAT DATE
// ======================================================

  const formatDate =
    (value) => {

      if (!value) {
        return "Not tracked yet";
      }

      const date =
        new Date(value);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return "Not available";
      }

      return date.toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    };


// ======================================================
// STATUS CLASS
// ======================================================

  const getStatusClass =
    (status) => {

      if (!status) {
        return "status-default";
      }

      return `status-${String(
        status
      )
        .toLowerCase()
        .replace(
          /_/g,
          "-"
        )}`;
    };


// ======================================================
// SELECTED VEHICLE
// ======================================================

  const selectedVehicle =
    vehicles.find(
      (vehicle) =>
        getVehicleId(
          vehicle
        ) ===
        String(
          selectedVehicleId
        )
    ) || null;


// ======================================================
// SELECTED VEHICLE POSITION
// ======================================================

  const selectedIndex =
    selectedVehicle
      ? vehicles.indexOf(
          selectedVehicle
        )
      : 0;

  const selectedPosition =
    selectedVehicle
      ? getVehiclePosition(
          selectedVehicle,
          selectedIndex
        )
      : {
          latitude:
            DEFAULT_LATITUDE,

          longitude:
            DEFAULT_LONGITUDE,
        };


// ======================================================
// MAP CENTER
// ======================================================

  const mapCenter = [
    selectedPosition.latitude,
    selectedPosition.longitude,
  ];


// ======================================================
// UI
// ======================================================

  return (
    <div className="vehicle-map-page">

      {/* =========================================
          HEADER
      ========================================== */}

      <div className="map-header">

        <div>

          <h1>
            Vehicle Location Tracking
          </h1>

          <p>
            Monitor the current location
            of vehicles in the fleet.
          </p>

        </div>


        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="live-tracking-badge">
            <span className="live-dot">●</span> Live Tracking
          </div>

          <button
            className="refresh-map-btn"
            onClick={
              refreshMap
            }
            disabled={
              loading ||
              addressLoading
            }
          >
            {loading ||
            addressLoading
              ? "Refreshing..."
              : "Refresh Map"}
          </button>
        </div>

      </div>


      {/* =========================================
          MESSAGES
      ========================================== */}

      {message && (
        <div className="map-success">
          {message}
        </div>
      )}


      {error && (
        <div className="map-error">
          {error}
        </div>
      )}


      {/* =========================================
          VEHICLE SELECTOR
      ========================================== */}

      <div className="map-selection-card">

        <div>

          <h2>
            Select Vehicle
          </h2>

          <p>
            Select a vehicle to focus
            on its current location.
          </p>

        </div>


        <div className="map-select">

          <label>
            Vehicle
          </label>

          <select
            value={
              selectedVehicleId
            }
            onChange={(event) =>
              setSelectedVehicleId(
                event.target.value
              )
            }
          >

            {loading ? (

              <option value="">
                Loading vehicles...
              </option>

            ) : vehicles.length ===
              0 ? (

              <option value="">
                No vehicles available
              </option>

            ) : (

              vehicles.map(
                (vehicle) => {

                  const vehicleId =
                    getVehicleId(
                      vehicle
                    );

                  return (
                    <option
                      key={
                        vehicleId
                      }
                      value={
                        vehicleId
                      }
                    >
                      {
                        vehicleId
                      }{" "}
                      -{" "}
                      {
                        vehicle.model ||
                        "Vehicle"
                      }
                    </option>
                  );

                }
              )

            )}

          </select>

        </div>

      </div>


      {/* =========================================
          SELECTED VEHICLE DETAILS
      ========================================== */}

      {selectedVehicle && (

        <div className="map-vehicle-details">

          <div>

            <span>
              Vehicle
            </span>

            <strong>
              {
                selectedVehicle.model ||
                "-"
              }
            </strong>

          </div>


          <div>

            <span>
              Vehicle ID
            </span>

            <strong>
              {
                getVehicleId(
                  selectedVehicle
                )
              }
            </strong>

          </div>


          <div>

            <span>
              Type
            </span>

            <strong>
              {
                selectedVehicle.type ||
                "-"
              }
            </strong>

          </div>


          <div>

            <span>
              Status
            </span>

            <strong
              className={
                getStatusClass(
                  selectedVehicle.status
                )
              }
            >
              {
                selectedVehicle.status ||
                "-"
              }
            </strong>

          </div>


          <div>

            <span>
              Current Address
            </span>

            <strong>
              {
                addresses[
                  getVehicleId(
                    selectedVehicle
                  )
                ] ||
                "Finding address..."
              }
            </strong>

          </div>

        </div>

      )}


      {/* =========================================
          MAP
      ========================================== */}

      <div className="map-card">

        <div className="map-card-header">

          <div>

            <h2>
              Fleet Map
            </h2>

            <p>
              All vehicles are displayed
              using their current or
              simulated location.
            </p>

          </div>


          <div className="vehicle-count">

            {vehicles.length}

            <span>
              Vehicles
            </span>

          </div>

        </div>


        <div className="map-container">

          <MapContainer
            center={
              mapCenter
            }
            zoom={14}
            scrollWheelZoom={
              true
            }
            style={{
              height:
                "100%",
              width:
                "100%",
            }}
          >

            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />


            <MapCenter
              latitude={
                selectedPosition.latitude
              }
              longitude={
                selectedPosition.longitude
              }
            />


            {/* ===================================
                ALL VEHICLE MARKERS
            ==================================== */}

            {vehicles.map(
              (
                vehicle,
                index
              ) => {

                const vehicleId =
                  getVehicleId(
                    vehicle
                  );

                const position =
                  getVehiclePosition(
                    vehicle,
                    index
                  );

                const address =
                  addresses[
                    vehicleId
                  ] ||
                  "Address not available";


                return (

                  <Marker
                    key={
                      vehicleId
                    }
                    position={[
                      position.latitude,
                      position.longitude,
                    ]}
                  >

                    <Popup>

                      <div className="map-popup">

                        <h3>
                          {
                            vehicle.model ||
                            "Vehicle"
                          }
                        </h3>


                        <p>
                          <strong>
                            Vehicle ID:
                          </strong>{" "}
                          {
                            vehicleId
                          }
                        </p>


                        <p>
                          <strong>
                            Type:
                          </strong>{" "}
                          {
                            vehicle.type ||
                            "-"
                          }
                        </p>


                        <p>
                          <strong>
                            Status:
                          </strong>{" "}
                          {
                            vehicle.status ||
                            "-"
                          }
                        </p>


                        <p>
                          <strong>
                            Address:
                          </strong>
                        </p>

                        <p className="popup-address">
                          {
                            address
                          }
                        </p>


                        <p>
                          <strong>
                            Latitude:
                          </strong>{" "}
                          {
                            position.latitude.toFixed(
                              6
                            )
                          }
                        </p>


                        <p>
                          <strong>
                            Longitude:
                          </strong>{" "}
                          {
                            position.longitude.toFixed(
                              6
                            )
                          }
                        </p>


                        <p>
                          <strong>
                            Last Updated:
                          </strong>{" "}
                          {
                            formatDate(
                              position.timestamp
                            )
                          }
                        </p>


                        {!position.tracked && (

                          <p className="simulated-label">
                            Initial simulated
                            location
                          </p>

                        )}


                        <button
                          className="popup-location-btn"
                          onClick={() =>
                            simulateLocation(
                              vehicle
                            )
                          }
                          disabled={
                            updatingVehicleId ===
                            vehicleId
                          }
                        >

                          {updatingVehicleId ===
                          vehicleId
                            ? "Updating..."
                            : "Simulate Location"}

                        </button>

                      </div>

                    </Popup>

                  </Marker>

                );
              }
            )}

          </MapContainer>

        </div>

      </div>


      {/* =========================================
          CURRENT LOCATION CARD
      ========================================== */}

      {selectedVehicle && (

        <div className="current-location-card">

          <div className="current-location-header">

            <div>

              <h2>
                Current Location
              </h2>

              <p>
                {
                  selectedVehicle.model
                }{" "}
                —{" "}
                {
                  getVehicleId(
                    selectedVehicle
                  )
                }
              </p>

            </div>


            <button
              className="simulate-btn"
              onClick={() =>
                simulateLocation(
                  selectedVehicle
                )
              }
              disabled={
                updatingVehicleId ===
                getVehicleId(
                  selectedVehicle
                )
              }
            >

              {updatingVehicleId ===
              getVehicleId(
                selectedVehicle
              )
                ? "Updating..."
                : "Simulate Location"}

            </button>

          </div>


          <div className="location-address">

            <span>
              Current Address
            </span>

            <strong>

              {
                addresses[
                  getVehicleId(
                    selectedVehicle
                  )
                ] ||
                "Finding current address..."
              }

            </strong>

          </div>


          <div className="location-information">

            <div className="location-box">

              <span>
                Latitude
              </span>

              <strong>
                {
                  selectedPosition.latitude.toFixed(
                    6
                  )
                }
              </strong>

            </div>


            <div className="location-box">

              <span>
                Longitude
              </span>

              <strong>
                {
                  selectedPosition.longitude.toFixed(
                    6
                  )
                }
              </strong>

            </div>


            <div className="location-box">

              <span>
                Last Updated
              </span>

              <strong>
                {
                  formatDate(
                    selectedPosition.timestamp
                  )
                }
              </strong>

            </div>


            <div className="location-box">

              <span>
                Vehicle Status
              </span>

              <strong
                className={
                  getStatusClass(
                    selectedVehicle.status
                  )
                }
              >
                {
                  selectedVehicle.status ||
                  "-"
                }
              </strong>

            </div>

          </div>

        </div>

      )}


      {/* =========================================
          FLEET LOCATION STATUS
      ========================================== */}

      <div className="map-history-card">

        <div className="map-history-header">

          <div>

            <h2>
              Fleet Location Status
            </h2>

            <p>
              Current location information
              for all vehicles.
            </p>

          </div>

        </div>


        <div className="map-table-wrapper">

          <table className="map-table">

            <thead>

              <tr>

                <th>
                  Vehicle ID
                </th>

                <th>
                  Vehicle
                </th>

                <th>
                  Type
                </th>

                <th>
                  Status
                </th>

                <th>
                  Current Address
                </th>

                <th>
                  Latitude
                </th>

                <th>
                  Longitude
                </th>

                <th>
                  Last Updated
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {vehicles.length ===
              0 ? (

                <tr>

                  <td
                    colSpan="9"
                    className="empty-map-row"
                  >
                    No vehicles found.
                  </td>

                </tr>

              ) : (

                vehicles.map(
                  (
                    vehicle,
                    index
                  ) => {

                    const vehicleId =
                      getVehicleId(
                        vehicle
                      );

                    const position =
                      getVehiclePosition(
                        vehicle,
                        index
                      );

                    const address =
                      addresses[
                        vehicleId
                      ] ||
                      "Finding address...";


                    return (

                      <tr
                        key={
                          vehicleId
                        }
                      >

                        <td>

                          <strong>
                            {
                              vehicleId
                            }
                          </strong>

                        </td>


                        <td>
                          {
                            vehicle.model ||
                            "-"
                          }
                        </td>


                        <td>
                          {
                            vehicle.type ||
                            "-"
                          }
                        </td>


                        <td>

                          <span
                            className={`table-status ${getStatusClass(
                              vehicle.status
                            )}`}
                          >
                            {
                              vehicle.status ||
                              "-"
                            }
                          </span>

                        </td>


                        <td className="address-cell">

                          {
                            address
                          }

                        </td>


                        <td>
                          {
                            position.latitude.toFixed(
                              6
                            )
                          }
                        </td>


                        <td>
                          {
                            position.longitude.toFixed(
                              6
                            )
                          }
                        </td>


                        <td>
                          {
                            formatDate(
                              position.timestamp
                            )
                          }
                        </td>


                        <td>

                          <button
                            className="table-location-btn"
                            onClick={() => {

                              setSelectedVehicleId(
                                vehicleId
                              );

                              simulateLocation(
                                vehicle
                              );

                            }}
                            disabled={
                              updatingVehicleId ===
                              vehicleId
                            }
                          >

                            {updatingVehicleId ===
                            vehicleId
                              ? "Updating..."
                              : "Update"}

                          </button>

                        </td>

                      </tr>

                    );

                  }
                )

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =========================================
          LOCATION HISTORY
      ========================================== */}

      <div className="map-history-card">

        <div className="map-history-header">

          <div>

            <h2>
              Location History
            </h2>

            <p>
              Previously recorded vehicle
              locations.
            </p>

          </div>

        </div>


        <div className="map-table-wrapper">

          <table className="map-table">

            <thead>

              <tr>

                <th>
                  Vehicle ID
                </th>

                <th>
                  Address
                </th>

                <th>
                  Latitude
                </th>

                <th>
                  Longitude
                </th>

                <th>
                  Date & Time
                </th>

              </tr>

            </thead>


            <tbody>

              {locations.length ===
              0 ? (

                <tr>

                  <td
                    colSpan="5"
                    className="empty-map-row"
                  >
                    No location history
                    available.
                  </td>

                </tr>

              ) : (

                [...locations]
                  .sort(
                    (
                      first,
                      second
                    ) =>
                      new Date(
                        second.timestamp ||
                          0
                      ) -
                      new Date(
                        first.timestamp ||
                          0
                      )
                  )
                  .map(
                    (
                      location,
                      index
                    ) => {

                      const address =
                        addresses[
                          String(
                            location.vehicleId
                          )
                        ] ||
                        "Address available after refresh";


                      return (

                        <tr
                          key={
                            location._id ||
                            `${location.vehicleId}-${location.timestamp}-${index}`
                          }
                        >

                          <td>

                            <strong>
                              {
                                location.vehicleId
                              }
                            </strong>

                          </td>


                          <td className="address-cell">

                            {
                              address
                            }

                          </td>


                          <td>
                            {
                              Number(
                                location.latitude
                              ).toFixed(
                                6
                              )
                            }
                          </td>


                          <td>
                            {
                              Number(
                                location.longitude
                              ).toFixed(
                                6
                              )
                            }
                          </td>


                          <td>
                            {
                              formatDate(
                                location.timestamp
                              )
                            }
                          </td>

                        </tr>

                      );

                    }
                  )

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}


export default VehicleMap;