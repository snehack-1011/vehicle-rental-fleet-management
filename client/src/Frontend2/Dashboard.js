import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DonutChart from "../components/Charts/DonutChart";
import BarChart from "../components/Charts/BarChart";
import ProgressRing from "../components/Charts/ProgressRing";
import "./Dashboard.css";

const API_URL = "http://localhost:5000";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Current Rentals Filters
  const [rentalSearch, setRentalSearch] = useState("");
  const [rentalStatusFilter, setRentalStatusFilter] = useState("ALL");

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        const [dashRes, vehRes, resRes, fbRes] = await Promise.allSettled([
          fetch(`${API_URL}/api/admin/dashboard`).then(res => res.json()),
          fetch(`${API_URL}/api/vehicles`).then(res => res.json()),
          fetch(`${API_URL}/api/reservations`).then(res => res.json()),
          fetch(`${API_URL}/api/feedback`).then(res => res.json())
        ]);

        if (dashRes.status === "fulfilled") {
          setDashboardData(dashRes.value.dashboard || dashRes.value);
        }

        if (vehRes.status === "fulfilled") {
          const vList = Array.isArray(vehRes.value) 
            ? vehRes.value 
            : Array.isArray(vehRes.value?.vehicles) 
            ? vehRes.value.vehicles 
            : [];
          setVehicles(vList);
        }

        if (resRes.status === "fulfilled") {
          const rList = Array.isArray(resRes.value?.data)
            ? resRes.value.data
            : Array.isArray(resRes.value)
            ? resRes.value
            : [];
          setReservations(rList);
        }

        if (fbRes.status === "fulfilled") {
          setFeedbacks(fbRes.value.feedbacks || fbRes.value || []);
        }
      } catch (err) {
        console.error("Error fetching fleet manager dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Compute stats dynamically from vehicles & dashboardData
  const totalVehiclesCount = vehicles.length || dashboardData?.totalVehicles || 0;
  const availableVehiclesCount = vehicles.filter(v => v.status === "AVAILABLE").length || dashboardData?.availableVehicles || 0;
  const rentedVehiclesCount = vehicles.filter(v => v.status === "RENTED").length || dashboardData?.rentedVehicles || 0;
  const reservedVehiclesCount = vehicles.filter(v => v.status === "RESERVED").length || dashboardData?.reservedVehicles || 0;
  const maintenanceVehiclesCount = vehicles.filter(v => v.status === "MAINTENANCE" || v.status === "DAMAGED").length || dashboardData?.maintenanceVehicles || 0;
  const forSaleVehiclesCount = vehicles.filter(v => v.status === "FOR_SALE").length || dashboardData?.forSaleVehicles || 0;

  // Chart 1: Donut breakdown by status
  const donutData = [
    { label: "Available", value: availableVehiclesCount, color: "#10b981" },
    { label: "Rented", value: rentedVehiclesCount, color: "#2563eb" },
    { label: "Reserved", value: reservedVehiclesCount, color: "#f59e0b" },
    { label: "Maintenance", value: maintenanceVehiclesCount, color: "#ef4444" },
    { label: "For Sale", value: forSaleVehiclesCount, color: "#8b5cf6" }
  ].filter(item => item.value > 0);

  // Chart 2: Vehicle Type Distribution (Hatchback, Sedan, SUV, Luxury, Electric)
  const typesMap = {};
  vehicles.forEach(v => {
    const t = v.type || "OTHER";
    typesMap[t] = (typesMap[t] || 0) + 1;
  });

  const barData = Object.keys(typesMap).map(typeKey => ({
    label: typeKey,
    value: typesMap[typeKey],
    color: typeKey === "SUV" ? "#2563eb" : typeKey === "SEDAN" ? "#10b981" : typeKey === "LUXURY" ? "#8b5cf6" : typeKey === "ELECTRIC" ? "#06b6d4" : "#f59e0b"
  }));

  // Utilization & Availability percentages
  const utilizationPct = totalVehiclesCount > 0 ? ((rentedVehiclesCount + reservedVehiclesCount) / totalVehiclesCount) * 100 : 0;
  const availabilityPct = totalVehiclesCount > 0 ? (availableVehiclesCount / totalVehiclesCount) * 100 : 0;

  // Map reservations to customer & vehicle details
  const currentRentalsList = reservations.map(res => {
    const customer = res.userId || {};
    const vehicle = vehicles.find(v => v.id === res.vehicleId || v._id === res.vehicleId) || {};
    
    return {
      id: res.id || res._id,
      customerName: customer.fullName || customer.email?.split("@")[0] || "Valued Customer",
      customerEmail: customer.email || "N/A",
      customerPhone: customer.phone || "N/A",
      vehicleModel: vehicle.model || res.vehicleId || "Vehicle",
      vehicleReg: res.vehicleId || vehicle.id || "N/A",
      startDate: res.startDate ? new Date(res.startDate).toLocaleDateString("en-IN") : "N/A",
      endDate: res.endDate ? new Date(res.endDate).toLocaleDateString("en-IN") : "N/A",
      status: res.status || "RESERVED",
      totalPrice: res.priceDetails?.totalPrice || (vehicle.pricePerDay ? vehicle.pricePerDay * 2 : 3500)
    };
  });

  // Filter rentals list
  const filteredRentals = currentRentalsList.filter(item => {
    const searchLower = rentalSearch.toLowerCase();
    const matchesSearch = !rentalSearch || 
      item.customerName.toLowerCase().includes(searchLower) ||
      item.customerEmail.toLowerCase().includes(searchLower) ||
      item.vehicleModel.toLowerCase().includes(searchLower) ||
      item.vehicleReg.toLowerCase().includes(searchLower);

    const matchesStatus = rentalStatusFilter === "ALL" || item.status === rentalStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "RENTED": return "badge-rented";
      case "RESERVED": return "badge-reserved";
      case "RETURNED": return "badge-returned";
      case "CANCELLED": return "badge-maintenance";
      default: return "badge-default";
    }
  };

  return (
    <div className="fleet-dashboard-container">
      {/* HEADER BANNER */}
      <div className="fleet-header">
        <div>
          <span className="fleet-badge">FLEET MANAGER PORTAL</span>
          <h1>Fleet Operations Dashboard</h1>
          <p>Real-time telemetry, rental tracking, customer activity, and fleet analytics.</p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <Link to="/map" className="map-view-btn">
            📍 View Live Vehicle Map
          </Link>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="fleet-nav-tabs">
        <button 
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview & Metrics
        </button>
        <button 
          className={`tab-btn ${activeTab === "rentals" ? "active" : ""}`}
          onClick={() => setActiveTab("rentals")}
        >
          👥 Current Customer Rentals ({reservations.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          📈 Charts & Visualizations
        </button>
        <button 
          className={`tab-btn ${activeTab === "feedback" ? "active" : ""}`}
          onClick={() => setActiveTab("feedback")}
        >
          ⭐ Customer Reviews ({feedbacks.length})
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="fleet-main-content">
        {loading ? (
          <div className="fleet-loading-container">
            <div className="loading-spinner"></div>
            <p>Loading real-time fleet analytics and customer rentals...</p>
          </div>
        ) : (
          <>
            {/* OVERVIEW TAB */}
            {(activeTab === "overview" || activeTab === "analytics") && (
              <>
                {/* STATS CARDS GRID */}
                <div className="fleet-stats-grid">
                  <div className="fleet-card stat-card">
                    <div className="stat-icon-wrapper icon-total">🚗</div>
                    <div className="stat-data">
                      <span className="stat-label">Total Vehicles</span>
                      <span className="stat-value">{totalVehiclesCount}</span>
                      <span className="stat-sub font-blue">Fleet Capacity</span>
                    </div>
                  </div>

                  <div className="fleet-card stat-card">
                    <div className="stat-icon-wrapper icon-available">✅</div>
                    <div className="stat-data">
                      <span className="stat-label">Available</span>
                      <span className="stat-value font-green">{availableVehiclesCount}</span>
                      <span className="stat-sub">Ready to Rent</span>
                    </div>
                  </div>

                  <div className="fleet-card stat-card">
                    <div className="stat-icon-wrapper icon-rented">🔑</div>
                    <div className="stat-data">
                      <span className="stat-label">Rented</span>
                      <span className="stat-value font-blue">{rentedVehiclesCount}</span>
                      <span className="stat-sub">On the Road</span>
                    </div>
                  </div>

                  <div className="fleet-card stat-card">
                    <div className="stat-icon-wrapper icon-reserved">⏳</div>
                    <div className="stat-data">
                      <span className="stat-label">Reserved</span>
                      <span className="stat-value font-amber">{reservedVehiclesCount}</span>
                      <span className="stat-sub">Upcoming Rentals</span>
                    </div>
                  </div>

                  <div className="fleet-card stat-card">
                    <div className="stat-icon-wrapper icon-maintenance">🔧</div>
                    <div className="stat-data">
                      <span className="stat-label">Maintenance</span>
                      <span className="stat-value font-red">{maintenanceVehiclesCount}</span>
                      <span className="stat-sub font-red">In Service / Inspection</span>
                    </div>
                  </div>

                  <div className="fleet-card stat-card">
                    <div className="stat-icon-wrapper icon-sale">🏷️</div>
                    <div className="stat-data">
                      <span className="stat-label">For Sale</span>
                      <span className="stat-value font-purple">{forSaleVehiclesCount}</span>
                      <span className="stat-sub">Listed for Sale</span>
                    </div>
                  </div>
                </div>

                {/* CHARTS ROW */}
                <div className="fleet-charts-grid">
                  {/* CHART 1: DONUT */}
                  <DonutChart 
                    data={donutData} 
                    title="Fleet Status Distribution" 
                    centerText={`${totalVehiclesCount}`}
                  />

                  {/* CHART 2: BAR */}
                  <BarChart 
                    data={barData.length > 0 ? barData : [
                      { label: "SUV", value: 6, color: "#2563eb" },
                      { label: "SEDAN", value: 4, color: "#10b981" },
                      { label: "HATCHBACK", value: 5, color: "#f59e0b" },
                      { label: "LUXURY", value: 4, color: "#8b5cf6" },
                      { label: "ELECTRIC", value: 3, color: "#06b6d4" }
                    ]} 
                    title="Vehicle Category Breakdown"
                    subtitle="Distribution by vehicle segment"
                    valueSuffix=" Vehicles"
                  />

                  {/* CHART 3: PROGRESS RINGS */}
                  <div className="fleet-card progress-grid-card">
                    <h3>Operational Metrics</h3>
                    <p className="card-sub-desc">Real-time utilization and fleet availability rates</p>
                    <div className="progress-stack">
                      <ProgressRing 
                        percentage={utilizationPct} 
                        label="Active Utilization Rate" 
                        sublabel={`${rentedVehiclesCount + reservedVehiclesCount} of ${totalVehiclesCount} vehicles active`}
                        color="#2563eb"
                      />
                      <ProgressRing 
                        percentage={availabilityPct} 
                        label="Fleet Readiness" 
                        sublabel={`${availableVehiclesCount} of ${totalVehiclesCount} vehicles available`}
                        color="#10b981"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* RENTALS TAB & TABLE */}
            {(activeTab === "overview" || activeTab === "rentals") && (
              <div className="fleet-card rentals-card">
                <div className="section-header">
                  <div>
                    <h2>Current Customer Rentals</h2>
                    <p className="section-desc">
                      List of customers who have currently booked or rented vehicles in the fleet.
                    </p>
                  </div>
                  <div className="rentals-controls">
                    <input 
                      type="text" 
                      placeholder="Search customer, vehicle, registration..." 
                      className="rentals-search-input"
                      value={rentalSearch}
                      onChange={(e) => setRentalSearch(e.target.value)}
                    />
                    <select 
                      className="status-filter-select"
                      value={rentalStatusFilter}
                      onChange={(e) => setRentalStatusFilter(e.target.value)}
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="RENTED">Active Rented</option>
                      <option value="RESERVED">Reserved</option>
                      <option value="RETURNED">Returned</option>
                    </select>
                  </div>
                </div>

                {filteredRentals.length === 0 ? (
                  <div className="empty-rentals-state">
                    <div className="empty-icon">🚗</div>
                    <h4>No active rentals found</h4>
                    <p>There are no customer rentals matching your filter criteria.</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="fleet-table">
                      <thead>
                        <tr>
                          <th>Customer</th>
                          <th>Vehicle Information</th>
                          <th>Rental Dates</th>
                          <th>Status</th>
                          <th>Total Fee</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRentals.map((rental) => (
                          <tr key={rental.id}>
                            <td>
                              <div className="customer-cell">
                                <div className="avatar-circle">
                                  {rental.customerName[0]?.toUpperCase() || "C"}
                                </div>
                                <div>
                                  <span className="customer-name">{rental.customerName}</span>
                                  <span className="customer-email">{rental.customerEmail}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="vehicle-cell">
                                <span className="vehicle-name">{rental.vehicleModel}</span>
                                <span className="vehicle-id-tag">Reg ID: {rental.vehicleReg}</span>
                              </div>
                            </td>
                            <td>
                              <div className="date-cell">
                                <span>📅 Start: <strong>{rental.startDate}</strong></span>
                                <span>🏁 End: <strong>{rental.endDate}</strong></span>
                              </div>
                            </td>
                            <td>
                              <span className={`status-badge ${getStatusBadgeClass(rental.status)}`}>
                                {rental.status}
                              </span>
                            </td>
                            <td>
                              <strong className="amount-text">
                                ₹{Number(rental.totalPrice || 0).toLocaleString("en-IN")}
                              </strong>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* FEEDBACK TAB */}
            {(activeTab === "overview" || activeTab === "feedback") && (
              <div className="fleet-card feedback-card-wrapper">
                <div className="section-header">
                  <div>
                    <h2>Live Customer Feedback</h2>
                    <p className="section-desc">Ratings and reviews submitted by customers after completing rentals.</p>
                  </div>
                </div>

                {feedbacks.length === 0 ? (
                  <div className="empty-rentals-state">
                    <p>No customer reviews submitted yet.</p>
                  </div>
                ) : (
                  <div className="feedback-grid">
                    {feedbacks.map((fb, idx) => (
                      <div key={fb._id || idx} className="feedback-card">
                        <div className="feedback-header">
                          <div>
                            <strong>{fb.customerEmail || "Customer"}</strong>
                            <span className="feedback-sub">Vehicle: {fb.vehicleId}</span>
                          </div>
                          <div className="stars-rating">
                            {"★".repeat(fb.rating || 5)}{"☆".repeat(5 - (fb.rating || 5))}
                          </div>
                        </div>
                        <p className="feedback-text">"{fb.review}"</p>
                        <span className="feedback-date">
                          {fb.timestamp ? new Date(fb.timestamp).toLocaleString("en-IN") : "Recent"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;