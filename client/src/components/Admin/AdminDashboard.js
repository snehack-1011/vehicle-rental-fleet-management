import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

const API_URL = "http://localhost:5000";

function AdminDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [dashboard, setDashboard] = useState({});

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [editingVehicle, setEditingVehicle] = useState(null);
  const [viewingVehicle, setViewingVehicle] = useState(null);

  const emptyForm = {
    id: "",
    model: "",
    type: "HATCHBACK",
    location: "Hyderabad",
    status: "AVAILABLE",
    pricePerDay: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  const loadDashboard = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/dashboard`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load dashboard"
        );
      }

      setDashboard(data.dashboard || data);
    } catch (err) {
      console.error(err);
    }
  };

  // =====================================================
  // LOAD VEHICLES
  // =====================================================

  const loadVehicles = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/vehicles`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load vehicles"
        );
      }

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.vehicles)
        ? data.vehicles
        : [];

      setVehicles(list);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadVehicles();
  }, []);

  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // =====================================================
  // OPEN ADD
  // =====================================================

  const openAddModal = () => {
    setEditingVehicle(null);
    setFormData(emptyForm);
    setMessage("");
    setError("");
    setShowModal(true);
  };

  // =====================================================
  // OPEN EDIT
  // =====================================================

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);

    setFormData({
      id: vehicle.id || vehicle._id || "",
      model: vehicle.model || "",
      type: vehicle.type || "HATCHBACK",
      location: vehicle.location || "Hyderabad",
      status: vehicle.status || "AVAILABLE",
      pricePerDay: vehicle.pricePerDay || "",
    });

    setMessage("");
    setError("");
    setShowModal(true);
  };

  // =====================================================
  // ADD / EDIT VEHICLE
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!formData.model.trim()) {
      setError("Vehicle model is required.");
      return;
    }

    if (!formData.location.trim()) {
      setError("Location is required.");
      return;
    }

    if (!formData.pricePerDay) {
      setError("Price per day is required.");
      return;
    }

    try {
      const isEditing = Boolean(editingVehicle);

      const vehicleId =
        editingVehicle?.id ||
        editingVehicle?._id;

      const url = isEditing
        ? `${API_URL}/api/vehicles/${encodeURIComponent(
            vehicleId
          )}`
        : `${API_URL}/api/vehicles`;

      const method = isEditing ? "PUT" : "POST";

      const payload = {
        ...formData,
        id: formData.id.trim(),
        model: formData.model.trim(),
        location: formData.location.trim(),
        pricePerDay: Number(formData.pricePerDay),
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${isEditing ? "update" : "add"} vehicle`
        );
      }

      setMessage(
        isEditing
          ? "Vehicle updated successfully."
          : "Vehicle added successfully."
      );

      setShowModal(false);
      setEditingVehicle(null);
      setFormData(emptyForm);

      await loadVehicles();
      await loadDashboard();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (vehicle) => {
    const deleteId =
      vehicle.id ||
      vehicle._id;

    const vehicleName =
      vehicle.model ||
      vehicle.id ||
      "this vehicle";

    if (!deleteId) {
      setError(
        "Vehicle ID not found. Cannot delete."
      );
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${vehicleName}?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/api/vehicles/${encodeURIComponent(
          deleteId
        )}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete vehicle"
        );
      }

      setMessage(
        `${vehicleName} deleted successfully.`
      );

      await loadVehicles();
      await loadDashboard();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredVehicles = vehicles.filter(
    (vehicle) => {
      const searchText =
        search.toLowerCase();

      const matchesSearch =
        !search ||
        String(
          vehicle.id ||
            vehicle._id ||
            ""
        )
          .toLowerCase()
          .includes(searchText) ||
        String(
          vehicle.model || ""
        )
          .toLowerCase()
          .includes(searchText) ||
        String(
          vehicle.location || ""
        )
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        !statusFilter ||
        vehicle.status ===
          statusFilter;

      const matchesType =
        !typeFilter ||
        vehicle.type ===
          typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    }
  );

  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {
    return `status-badge status-${String(
      status || ""
    )
      .toLowerCase()
      .replace(/_/g, "-")}`;
  };

  // =====================================================
  // METRIC VALUE
  // =====================================================

  const value = (
    primary,
    secondary
  ) => {
    if (
      primary !== undefined &&
      primary !== null
    ) {
      return primary;
    }

    return secondary || 0;
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="admin-dashboard">

      {/* HEADER */}

      <div className="admin-header">

        <div>
          <h1>
            Admin Dashboard
          </h1>

          <p>
            Manage vehicles and monitor
            fleet operations.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link
            to="/map"
            style={{
              background: "#10b981",
              color: "#fff",
              padding: "10px 18px",
              borderRadius: "6px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            📍 View Live Vehicle Map
          </Link>

          <button
            className="add-vehicle-btn"
            onClick={openAddModal}
          >
            + Add Vehicle
          </button>
        </div>

      </div>


      {/* MESSAGE */}

      {message && (
        <div className="admin-message">
          {message}
        </div>
      )}

      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}


      {/* MAIN METRICS */}

      <div className="dashboard-metrics">

        <div className="metric-card">
          <span>Total Vehicles</span>
          <strong>
            {value(
              dashboard.totalVehicles,
              vehicles.length
            )}
          </strong>
        </div>

        <div className="metric-card">
          <span>Available</span>
          <strong>
            {value(
              dashboard.availableVehicles,
              vehicles.filter(
                (v) =>
                  v.status ===
                  "AVAILABLE"
              ).length
            )}
          </strong>
        </div>

        <div className="metric-card">
          <span>Reserved</span>
          <strong>
            {value(
              dashboard.reservedVehicles,
              vehicles.filter(
                (v) =>
                  v.status ===
                  "RESERVED"
              ).length
            )}
          </strong>
        </div>

        <div className="metric-card">
          <span>Currently Rented</span>
          <strong>
            {value(
              dashboard.rentedVehicles,
              vehicles.filter(
                (v) =>
                  v.status ===
                  "RENTED"
              ).length
            )}
          </strong>
        </div>

        <div className="metric-card">
          <span>Maintenance</span>
          <strong>
            {value(
              dashboard.maintenanceVehicles,
              vehicles.filter(
                (v) =>
                  v.status ===
                  "MAINTENANCE"
              ).length
            )}
          </strong>
        </div>

      </div>


      {/* SECONDARY METRICS */}

      <div className="secondary-metrics">

        <div className="metric-card">
          <span>Daily Revenue</span>
          <strong>
            ₹
            {Number(
              dashboard.dailyRevenue || 0
            ).toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="metric-card">
          <span>Monthly Revenue</span>
          <strong>
            ₹
            {Number(
              dashboard.monthlyRevenue || 0
            ).toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="metric-card">
          <span>Maintenance Cost</span>
          <strong>
            ₹
            {Number(
              dashboard.maintenanceCost || 0
            ).toLocaleString("en-IN")}
          </strong>
        </div>

        <div className="metric-card">
          <span>Most Rented Vehicle</span>
          <strong>
            {dashboard.mostRentedVehicle ||
              "—"}
          </strong>
        </div>

      </div>


      {/* VEHICLE MANAGEMENT */}

      <div className="vehicle-management">

        <div className="vehicle-management-header">

          <div>
            <h2>
              Vehicle Management
            </h2>

            <p>
              Add, edit, view and delete
              fleet vehicles.
            </p>
          </div>

          <span className="vehicle-count">
            {filteredVehicles.length} Vehicles
          </span>

        </div>


        {/* FILTERS */}

        <div className="vehicle-filters">

          <input
            className="vehicle-search"
            type="text"
            placeholder="Search by ID, model or location..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

          <select
            className="vehicle-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="">
              All Status
            </option>

            <option value="AVAILABLE">
              Available
            </option>

            <option value="RESERVED">
              Reserved
            </option>

            <option value="RENTED">
              Rented
            </option>

            <option value="MAINTENANCE">
              Maintenance
            </option>

            <option value="DAMAGED">
              Damaged
            </option>

            <option value="INSPECTION">
              Inspection
            </option>

          </select>


          <select
            className="vehicle-filter"
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value
              )
            }
          >

            <option value="">
              All Types
            </option>

            <option value="HATCHBACK">
              Hatchback
            </option>

            <option value="SEDAN">
              Sedan
            </option>

            <option value="SUV">
              SUV
            </option>

            <option value="LUXURY">
              Luxury
            </option>

            <option value="ELECTRIC">
              Electric
            </option>

          </select>

        </div>


        {/* TABLE */}

        <div className="vehicle-table-wrapper">

          {loading ? (

            <div className="empty-state">
              <h3>
                Loading vehicles...
              </h3>
            </div>

          ) : filteredVehicles.length ===
            0 ? (

            <div className="empty-state">
              <h3>
                No vehicles found
              </h3>

              <p>
                Add a vehicle or change
                your filters.
              </p>
            </div>

          ) : (

            <table className="vehicle-table">

              <thead>

                <tr>
                  <th>Vehicle ID</th>
                  <th>Model</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Price / Day</th>
                  <th>Actions</th>
                </tr>

              </thead>


              <tbody>

                {filteredVehicles.map(
                  (vehicle) => {

                    const vehicleId =
                      vehicle.id ||
                      vehicle._id ||
                      "-";

                    return (

                      <tr
                        key={
                          vehicle._id ||
                          vehicle.id
                        }
                      >

                        <td>
                          <span className="vehicle-id">
                            {vehicleId}
                          </span>
                        </td>

                        <td>
                          {vehicle.model ||
                            "-"}
                        </td>

                        <td>
                          {vehicle.type ||
                            "-"}
                        </td>

                        <td>
                          {vehicle.location ||
                            "-"}
                        </td>

                        <td>
                          <span
                            className={getStatusClass(
                              vehicle.status
                            )}
                          >
                            {vehicle.status ||
                              "-"}
                          </span>
                        </td>

                        <td>
                          ₹
                          {Number(
                            vehicle.pricePerDay ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </td>

                        <td>

                          <div className="action-buttons">

                            <button
                              className="view-btn"
                              onClick={() => {
                                setViewingVehicle(
                                  vehicle
                                );
                                setShowViewModal(
                                  true
                                );
                              }}
                            >
                              View
                            </button>

                            <button
                              className="edit-btn"
                              onClick={() =>
                                openEditModal(
                                  vehicle
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() =>
                                handleDelete(
                                  vehicle
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>

                    );
                  }
                )}

              </tbody>

            </table>

          )}

        </div>

      </div>


      {/* ADD / EDIT MODAL */}

      {showModal && (

        <div className="modal-overlay">

          <div className="modal">

            <div className="modal-header">

              <div>
                <h2>
                  {editingVehicle
                    ? "Edit Vehicle"
                    : "Add Vehicle"}
                </h2>
              </div>

              <button
                className="close-btn"
                onClick={() =>
                  setShowModal(false)
                }
              >
                ×
              </button>

            </div>


            <form
              className="vehicle-form"
              onSubmit={handleSubmit}
            >

              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Vehicle ID
                  </label>

                  <input
                    name="id"
                    value={
                      formData.id
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Example: CAR1001"
                    disabled={
                      Boolean(
                        editingVehicle
                      )
                    }
                  />

                </div>


                <div className="form-group">

                  <label>
                    Model
                  </label>

                  <input
                    name="model"
                    value={
                      formData.model
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Example: Hyundai Creta"
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    Type
                  </label>

                  <select
                    name="type"
                    value={
                      formData.type
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="HATCHBACK">
                      HATCHBACK
                    </option>

                    <option value="SEDAN">
                      SEDAN
                    </option>

                    <option value="SUV">
                      SUV
                    </option>

                    <option value="LUXURY">
                      LUXURY
                    </option>

                    <option value="ELECTRIC">
                      ELECTRIC
                    </option>

                  </select>

                </div>


                <div className="form-group">

                  <label>
                    Location
                  </label>

                  <input
                    name="location"
                    value={
                      formData.location
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Example: Hyderabad"
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    Status
                  </label>

                  <select
                    name="status"
                    value={
                      formData.status
                    }
                    onChange={
                      handleChange
                    }
                  >

                    <option value="AVAILABLE">
                      AVAILABLE
                    </option>

                    <option value="RESERVED">
                      RESERVED
                    </option>

                    <option value="RENTED">
                      RENTED
                    </option>

                    <option value="MAINTENANCE">
                      MAINTENANCE
                    </option>

                    <option value="DAMAGED">
                      DAMAGED
                    </option>

                    <option value="INSPECTION">
                      INSPECTION
                    </option>

                  </select>

                </div>


                <div className="form-group">

                  <label>
                    Price Per Day
                  </label>

                  <input
                    type="number"
                    name="pricePerDay"
                    value={
                      formData.pricePerDay
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="2500"
                    min="0"
                    required
                  />

                </div>

              </div>


              <div className="modal-footer">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                >
                  {editingVehicle
                    ? "Update Vehicle"
                    : "Add Vehicle"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* VIEW MODAL */}

      {showViewModal &&
        viewingVehicle && (

          <div className="modal-overlay">

            <div className="modal">

              <div className="modal-header">

                <h2>
                  Vehicle Details
                </h2>

                <button
                  className="close-btn"
                  onClick={() =>
                    setShowViewModal(false)
                  }
                >
                  ×
                </button>

              </div>


              <div className="vehicle-details">

                <div className="detail-row">
                  <span>
                    Vehicle ID
                  </span>
                  <strong>
                    {viewingVehicle.id ||
                      viewingVehicle._id ||
                      "-"}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>
                    Model
                  </span>
                  <strong>
                    {viewingVehicle.model ||
                      "-"}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>
                    Type
                  </span>
                  <strong>
                    {viewingVehicle.type ||
                      "-"}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>
                    Location
                  </span>
                  <strong>
                    {viewingVehicle.location ||
                      "-"}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>
                    Status
                  </span>
                  <strong>
                    {viewingVehicle.status ||
                      "-"}
                  </strong>
                </div>

                <div className="detail-row">
                  <span>
                    Price Per Day
                  </span>
                  <strong>
                    ₹
                    {Number(
                      viewingVehicle.pricePerDay ||
                        0
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>

              </div>


              <div className="modal-footer">

                <button
                  className="cancel-btn"
                  onClick={() =>
                    setShowViewModal(false)
                  }
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}

export default AdminDashboard;