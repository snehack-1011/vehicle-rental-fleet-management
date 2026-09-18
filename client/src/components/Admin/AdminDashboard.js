import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DonutChart from "../Charts/DonutChart";
import BarChart from "../Charts/BarChart";
import ProgressRing from "../Charts/ProgressRing";
import "./AdminDashboard.css";

const API_URL = "http://localhost:5000";

function AdminDashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [, setDashboard] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("overview");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [viewingVehicle, setViewingVehicle] = useState(null);

  const emptyForm = {
    id: "",
    model: "",
    type: "HATCHBACK",
    location: "Bengaluru",
    status: "AVAILABLE",
    pricePerDay: "",
    seats: 5,
    fuelType: "PETROL",
    transmission: "AUTOMATIC",
    condition: "Excellent",
    image: "https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=3269&auto=format&fit=crop"
  };

  const [formData, setFormData] = useState(emptyForm);

  // LOAD DASHBOARD METRICS
  const loadDashboard = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/dashboard`);
      const data = await response.json();
      if (response.ok) {
        setDashboard(data.dashboard || data);
      }
    } catch (err) {
      console.error("Error loading dashboard metrics:", err);
    }
  };

  // LOAD ALL VEHICLES
  const loadVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/vehicles`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load vehicles");
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

  // FORM HANDLERS
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const openAddModal = () => {
    setEditingVehicle(null);
    setFormData({
      ...emptyForm,
      id: `V${String(vehicles.length + 1).padStart(3, '0')}`
    });
    setMessage("");
    setError("");
    setShowModal(true);
  };

  const openEditModal = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      id: vehicle.id || vehicle._id || "",
      model: vehicle.model || "",
      type: vehicle.type || "HATCHBACK",
      location: vehicle.location || "Bengaluru",
      status: vehicle.status || "AVAILABLE",
      pricePerDay: vehicle.pricePerDay || "",
      seats: vehicle.seats || 5,
      fuelType: vehicle.fuelType || "PETROL",
      transmission: vehicle.transmission || "AUTOMATIC",
      condition: vehicle.condition || "Excellent",
      image: vehicle.image || "https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=3269&auto=format&fit=crop"
    });
    setMessage("");
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!formData.model.trim()) {
      setError("Vehicle model is required.");
      return;
    }

    if (!formData.pricePerDay) {
      setError("Price per day is required.");
      return;
    }

    try {
      const isEditing = Boolean(editingVehicle);
      const vehicleId = editingVehicle?.id || editingVehicle?._id;
      const url = isEditing
        ? `${API_URL}/api/vehicles/${encodeURIComponent(vehicleId)}`
        : `${API_URL}/api/vehicles`;

      const method = isEditing ? "PUT" : "POST";
      const payload = {
        ...formData,
        id: formData.id.trim(),
        model: formData.model.trim(),
        location: formData.location.trim(),
        pricePerDay: Number(formData.pricePerDay),
        seats: Number(formData.seats || 5)
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Failed to ${isEditing ? "update" : "add"} vehicle`);
      }

      setMessage(isEditing ? "Vehicle updated successfully." : "Vehicle added successfully.");
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

  const handleDelete = async (vehicle) => {
    const deleteId = vehicle.id || vehicle._id;
    const vehicleName = vehicle.model || vehicle.id || "this vehicle";

    if (!deleteId) {
      setError("Vehicle ID not found. Cannot delete.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${vehicleName}?`)) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await fetch(`${API_URL}/api/vehicles/${encodeURIComponent(deleteId)}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to delete vehicle");
      }

      setMessage(`${vehicleName} deleted successfully.`);
      await loadVehicles();
      await loadDashboard();
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const toggleSaleStatus = async (vehicle) => {
    const currentStatus = vehicle.status;
    const newStatus = currentStatus === "FOR_SALE" ? "AVAILABLE" : "FOR_SALE";
    
    try {
      const response = await fetch(`${API_URL}/api/vehicles/${encodeURIComponent(vehicle.id || vehicle._id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      setMessage(`Vehicle marked as ${newStatus === "FOR_SALE" ? "FOR SALE" : "RENTAL AVAILABLE"}`);
      await loadVehicles();
      await loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  // FILTERED LISTS
  const rentalVehicles = vehicles.filter(v => v.status !== "FOR_SALE");
  const saleVehicles = vehicles.filter(v => v.status === "FOR_SALE");

  const filterList = (list) => {
    return list.filter((vehicle) => {
      const searchText = search.toLowerCase();
      const matchesSearch =
        !search ||
        String(vehicle.id || vehicle._id || "").toLowerCase().includes(searchText) ||
        String(vehicle.model || "").toLowerCase().includes(searchText) ||
        String(vehicle.location || "").toLowerCase().includes(searchText);

      const matchesStatus = !statusFilter || vehicle.status === statusFilter;
      const matchesType = !typeFilter || vehicle.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  };

  const filteredRentalVehicles = filterList(rentalVehicles);
  const filteredSaleVehicles = filterList(saleVehicles);

  const getStatusBadgeClass = (status) => {
    return `status-badge status-${String(status || "").toLowerCase().replace(/_/g, "-")}`;
  };

  // Metric counts
  const totalCount = vehicles.length;
  const availableCount = vehicles.filter(v => v.status === "AVAILABLE").length;
  const rentedCount = vehicles.filter(v => v.status === "RENTED").length;
  const reservedCount = vehicles.filter(v => v.status === "RESERVED").length;
  const maintenanceCount = vehicles.filter(v => v.status === "MAINTENANCE" || v.status === "DAMAGED").length;
  const saleCount = saleVehicles.length;

  // Donut chart data
  const donutData = [
    { label: "Available", value: availableCount, color: "#10b981" },
    { label: "Rented", value: rentedCount, color: "#2563eb" },
    { label: "Reserved", value: reservedCount, color: "#f59e0b" },
    { label: "Maintenance", value: maintenanceCount, color: "#ef4444" },
    { label: "For Sale", value: saleCount, color: "#8b5cf6" }
  ].filter(item => item.value > 0);

  // Bar chart data by type
  const typesMap = {};
  vehicles.forEach(v => {
    const t = v.type || "OTHER";
    typesMap[t] = (typesMap[t] || 0) + 1;
  });

  const barData = Object.keys(typesMap).map(key => ({
    label: key,
    value: typesMap[key],
    color: key === "SUV" ? "#2563eb" : key === "SEDAN" ? "#10b981" : key === "LUXURY" ? "#8b5cf6" : key === "ELECTRIC" ? "#06b6d4" : "#f59e0b"
  }));

  return (
    <div className="admin-dashboard-container">
      {/* HEADER BANNER */}
      <div className="admin-header">
        <div>
          <span className="admin-badge">SYSTEM ADMINISTRATION</span>
          <h1>Admin Fleet Control Center</h1>
          <p>Manage vehicle inventory, classify rental vs sale vehicles, and monitor system health.</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link to="/map" className="map-btn">
            📍 View Live Vehicle Map
          </Link>
          <button className="add-vehicle-btn" onClick={openAddModal}>
            + Add New Vehicle
          </button>
        </div>
      </div>

      {/* NAV TABS */}
      <div className="admin-nav-tabs">
        <button 
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Dashboard Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === "rental" ? "active" : ""}`}
          onClick={() => setActiveTab("rental")}
        >
          🚗 Rental Fleet ({rentalVehicles.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === "sale" ? "active" : ""}`}
          onClick={() => setActiveTab("sale")}
        >
          🏷️ Vehicles Listed for Sale ({saleVehicles.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          📈 Visual Analytics
        </button>
      </div>

      <div className="admin-main-content">
        {/* MESSAGES */}
        {message && <div className="admin-message">{message}</div>}
        {error && <div className="admin-error">{error}</div>}

        {/* OVERVIEW & METRICS */}
        {(activeTab === "overview" || activeTab === "analytics") && (
          <>
            <div className="admin-metrics-grid">
              <div className="metric-card">
                <span className="metric-title">Total Fleet Vehicles</span>
                <strong className="metric-num">{totalCount}</strong>
                <span className="metric-sub">Total Inventory</span>
              </div>
              <div className="metric-card">
                <span className="metric-title">Vehicles Available</span>
                <strong className="metric-num font-green">{availableCount}</strong>
                <span className="metric-sub">Ready for Rental</span>
              </div>
              <div className="metric-card">
                <span className="metric-title">Currently Rented</span>
                <strong className="metric-num font-blue">{rentedCount}</strong>
                <span className="metric-sub">On Active Trips</span>
              </div>
              <div className="metric-card">
                <span className="metric-title">Reserved Vehicles</span>
                <strong className="metric-num font-amber">{reservedCount}</strong>
                <span className="metric-sub">Upcoming Bookings</span>
              </div>
              <div className="metric-card">
                <span className="metric-title">Under Maintenance</span>
                <strong className="metric-num font-red">{maintenanceCount}</strong>
                <span className="metric-sub">In Repair / Service</span>
              </div>
              <div className="metric-card">
                <span className="metric-title">Listed for Sale</span>
                <strong className="metric-num font-purple">{saleCount}</strong>
                <span className="metric-sub">For Sale Marketplace</span>
              </div>
            </div>

            {/* CHARTS */}
            <div className="admin-charts-grid">
              <DonutChart data={donutData} title="Fleet Status Breakdown" centerText={`${totalCount}`} />
              <BarChart data={barData} title="Vehicle Categories" subtitle="Distribution by vehicle type" valueSuffix=" Vehicles" />
              <div className="admin-card">
                <h3>Operational Summary</h3>
                <p style={{ fontSize: "13px", color: "var(--text-sub)", marginBottom: "20px" }}>Revenue estimates & fleet utilization</p>
                <ProgressRing 
                  percentage={totalCount > 0 ? ((rentedCount + reservedCount) / totalCount) * 100 : 0}
                  label="Fleet Utilization"
                  sublabel={`${rentedCount + reservedCount} of ${totalCount} active`}
                  color="#2563eb"
                />
              </div>
            </div>
          </>
        )}

        {/* SEARCH & FILTERS BAR */}
        {(activeTab === "rental" || activeTab === "sale" || activeTab === "overview") && (
          <div className="admin-card filters-card">
            <div className="vehicle-filters">
              <input
                className="vehicle-search"
                type="text"
                placeholder="Search by ID, model, or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select className="vehicle-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="AVAILABLE">Available</option>
                <option value="RENTED">Rented</option>
                <option value="RESERVED">Reserved</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="FOR_SALE">For Sale</option>
              </select>
              <select className="vehicle-filter" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="">All Types</option>
                <option value="HATCHBACK">Hatchback</option>
                <option value="SEDAN">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="LUXURY">Luxury</option>
                <option value="ELECTRIC">Electric</option>
              </select>
            </div>
          </div>
        )}

        {/* TABLE 1: VEHICLES AVAILABLE FOR RENTAL */}
        {(activeTab === "overview" || activeTab === "rental") && (
          <div className="admin-card">
            <div className="section-header">
              <div>
                <h2>Vehicles Available for Rental</h2>
                <p className="section-desc">Fleet vehicles designated for customer rentals and bookings.</p>
              </div>
              <span className="count-badge">{filteredRentalVehicles.length} Rental Vehicles</span>
            </div>

            {loading ? (
              <div className="empty-state">Loading rental fleet...</div>
            ) : filteredRentalVehicles.length === 0 ? (
              <div className="empty-state">No rental vehicles found matching search.</div>
            ) : (
              <div className="table-responsive">
                <table className="vehicle-table">
                  <thead>
                    <tr>
                      <th>Vehicle ID</th>
                      <th>Model & Image</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Daily Rate</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRentalVehicles.map((vehicle) => (
                      <tr key={vehicle._id || vehicle.id}>
                        <td><span className="vehicle-id">{vehicle.id || vehicle._id}</span></td>
                        <td>
                          <div className="model-cell">
                            {vehicle.image && <img src={vehicle.image} alt={vehicle.model} className="thumb-img" />}
                            <div>
                              <strong>{vehicle.model}</strong>
                              <span className="sub-info">{vehicle.transmission} • {vehicle.fuelType}</span>
                            </div>
                          </div>
                        </td>
                        <td>{vehicle.type}</td>
                        <td>{vehicle.location}</td>
                        <td>
                          <span className={getStatusBadgeClass(vehicle.status)}>{vehicle.status}</span>
                        </td>
                        <td><strong>₹{Number(vehicle.pricePerDay || 0).toLocaleString("en-IN")}</strong></td>
                        <td>
                          <div className="action-buttons">
                            <button className="view-btn" onClick={() => { setViewingVehicle(vehicle); setShowViewModal(true); }}>View</button>
                            <button className="edit-btn" onClick={() => openEditModal(vehicle)}>Edit</button>
                            <button className="sale-toggle-btn" onClick={() => toggleSaleStatus(vehicle)} title="List vehicle for sale">🏷️ List for Sale</button>
                            <button className="delete-btn" onClick={() => handleDelete(vehicle)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TABLE 2: VEHICLES AVAILABLE FOR SALE */}
        {(activeTab === "overview" || activeTab === "sale") && (
          <div className="admin-card sale-card-section">
            <div className="section-header">
              <div>
                <h2>Vehicles Available for Sale</h2>
                <p className="section-desc">Vehicles currently listed in the sale marketplace.</p>
              </div>
              <span className="count-badge badge-purple">{filteredSaleVehicles.length} Vehicles for Sale</span>
            </div>

            {loading ? (
              <div className="empty-state">Loading sale inventory...</div>
            ) : filteredSaleVehicles.length === 0 ? (
              <div className="empty-state">
                <p>No vehicles are currently listed for sale.</p>
                <small>Use the "List for Sale" button in the Rental Fleet table to mark a vehicle for sale.</small>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="vehicle-table">
                  <thead>
                    <tr>
                      <th>Vehicle ID</th>
                      <th>Model & Specs</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th>Condition</th>
                      <th>Sale Price / Value</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSaleVehicles.map((vehicle) => (
                      <tr key={vehicle._id || vehicle.id}>
                        <td><span className="vehicle-id">{vehicle.id || vehicle._id}</span></td>
                        <td>
                          <div className="model-cell">
                            {vehicle.image && <img src={vehicle.image} alt={vehicle.model} className="thumb-img" />}
                            <div>
                              <strong>{vehicle.model}</strong>
                              <span className="sub-info">{vehicle.transmission} • {vehicle.fuelType}</span>
                            </div>
                          </div>
                        </td>
                        <td>{vehicle.type}</td>
                        <td>{vehicle.location}</td>
                        <td><span className="condition-tag">{vehicle.condition || "Good"}</span></td>
                        <td><strong className="font-purple">₹{Number((vehicle.pricePerDay || 2000) * 150).toLocaleString("en-IN")}</strong></td>
                        <td>
                          <div className="action-buttons">
                            <button className="view-btn" onClick={() => { setViewingVehicle(vehicle); setShowViewModal(true); }}>View</button>
                            <button className="edit-btn" onClick={() => openEditModal(vehicle)}>Edit</button>
                            <button className="rental-revert-btn" onClick={() => toggleSaleStatus(vehicle)} title="Move back to rental fleet">🚗 Move to Rental</button>
                            <button className="delete-btn" onClick={() => handleDelete(vehicle)}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>{editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}</h3>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Vehicle ID</label>
                <input type="text" name="id" value={formData.id} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Vehicle Model Name</label>
                <input type="text" name="model" value={formData.model} onChange={handleChange} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select name="type" value={formData.type} onChange={handleChange}>
                    <option value="HATCHBACK">Hatchback</option>
                    <option value="SEDAN">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="LUXURY">Luxury</option>
                    <option value="ELECTRIC">Electric</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="AVAILABLE">Available for Rental</option>
                    <option value="RENTED">Rented</option>
                    <option value="RESERVED">Reserved</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="FOR_SALE">Listed for Sale</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Price per Day (₹)</label>
                  <input type="number" name="pricePerDay" value={formData.pricePerDay} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input type="text" name="image" value={formData.image} onChange={handleChange} />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="save-btn">{editingVehicle ? "Update Vehicle" : "Add Vehicle"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {showViewModal && viewingVehicle && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Vehicle Details</h3>
            <div className="view-details-grid">
              {viewingVehicle.image && <img src={viewingVehicle.image} alt={viewingVehicle.model} className="detail-img" />}
              <div className="detail-info">
                <p><strong>ID:</strong> {viewingVehicle.id || viewingVehicle._id}</p>
                <p><strong>Model:</strong> {viewingVehicle.model}</p>
                <p><strong>Type:</strong> {viewingVehicle.type}</p>
                <p><strong>Location:</strong> {viewingVehicle.location}</p>
                <p><strong>Status:</strong> {viewingVehicle.status}</p>
                <p><strong>Daily Rate:</strong> ₹{viewingVehicle.pricePerDay}</p>
                <p><strong>Fuel:</strong> {viewingVehicle.fuelType || "PETROL"}</p>
                <p><strong>Transmission:</strong> {viewingVehicle.transmission || "AUTOMATIC"}</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;