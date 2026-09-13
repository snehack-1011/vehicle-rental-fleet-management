import React, { useEffect, useState } from "react";
import "./Billing.css";

const API_URL = "http://localhost:5000";

function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [showView, setShowView] = useState(false);

  const [editingInvoice, setEditingInvoice] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const emptyForm = {
    invoiceNumber: "",
    customerName: "",
    vehicleId: "",
    vehicleName: "",
    startDate: "",
    returnDate: "",
    location: "",
    baseRental: "",
    weekendCharges: 0,
    peakSeasonCharges: 0,
    insurance: 0,
    additionalDriver: 0,
    lateFee: 0,
    damageCharges: 0,
    total: 0,
    notes: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  // -----------------------------
  // LOAD INVOICES
  // -----------------------------
  const loadInvoices = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/invoices`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load invoices"
        );
      }

      setInvoices(
        Array.isArray(data)
          ? data
          : Array.isArray(data.invoices)
          ? data.invoices
          : []
      );
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  // -----------------------------
  // LOAD VEHICLES FROM ADMIN
  // -----------------------------
  const loadVehicles = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/vehicles`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load vehicles"
        );
      }

      const vehicleList = Array.isArray(data)
        ? data
        : Array.isArray(data.vehicles)
        ? data.vehicles
        : [];

      setVehicles(vehicleList);
    } catch (err) {
      console.error("Vehicle loading error:", err);
      setError(err.message);
    }
  };

  // -----------------------------
  // INITIAL LOAD
  // -----------------------------
  useEffect(() => {
    loadInvoices();
    loadVehicles();
  }, []);

  // -----------------------------
  // FORM INPUT
  // -----------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // -----------------------------
  // VEHICLE SELECTION
  // -----------------------------
  const handleVehicleChange = (e) => {
    const selectedId = e.target.value;

    const selectedVehicle = vehicles.find(
      (vehicle) =>
        String(vehicle.id || vehicle._id) ===
        String(selectedId)
    );

    if (!selectedVehicle) {
      setFormData((prev) => ({
        ...prev,
        vehicleId: "",
        vehicleName: "",
        location: "",
      }));

      return;
    }

    // Maintenance vehicles cannot be rented
    if (
      String(selectedVehicle.status).toUpperCase() ===
      "MAINTENANCE"
    ) {
      setError(
        `${selectedVehicle.model} is currently under maintenance and cannot be rented.`
      );

      setFormData((prev) => ({
        ...prev,
        vehicleId: "",
        vehicleName: "",
        location: "",
      }));

      return;
    }

    setError("");

    setFormData((prev) => ({
      ...prev,

      vehicleId:
        selectedVehicle.id ||
        selectedVehicle._id,

      vehicleName:
        selectedVehicle.model || "",

      location:
        selectedVehicle.location || "",
    }));
  };

  // -----------------------------
  // CALCULATE TOTAL
  // -----------------------------
  const calculateTotal = () => {
    return (
      Number(formData.baseRental || 0) +
      Number(formData.weekendCharges || 0) +
      Number(formData.peakSeasonCharges || 0) +
      Number(formData.insurance || 0) +
      Number(formData.additionalDriver || 0) +
      Number(formData.lateFee || 0) +
      Number(formData.damageCharges || 0)
    );
  };

  // -----------------------------
  // OPEN ADD FORM
  // -----------------------------
  const openAddForm = () => {
    setEditingInvoice(null);

    setFormData({
      ...emptyForm,
      invoiceNumber:
        "INV" +
        String(
          invoices.length + 1
        ).padStart(4, "0"),
    });

    setMessage("");
    setError("");
    setShowForm(true);
  };

  // -----------------------------
  // OPEN EDIT FORM
  // -----------------------------
  const openEditForm = (invoice) => {
    setEditingInvoice(invoice);

    setFormData({
      invoiceNumber:
        invoice.invoiceNumber || "",

      customerName:
        invoice.customerName || "",

      vehicleId:
        invoice.vehicleId || "",

      vehicleName:
        invoice.vehicleName || "",

      startDate:
        invoice.startDate || "",

      returnDate:
        invoice.returnDate || "",

      location:
        invoice.location || "",

      baseRental:
        invoice.baseRental || 0,

      weekendCharges:
        invoice.weekendCharges || 0,

      peakSeasonCharges:
        invoice.peakSeasonCharges || 0,

      insurance:
        invoice.insurance || 0,

      additionalDriver:
        invoice.additionalDriver || 0,

      lateFee:
        invoice.lateFee || 0,

      damageCharges:
        invoice.damageCharges || 0,

      total:
        invoice.total || 0,

      notes:
        invoice.notes || "",
    });

    setMessage("");
    setError("");
    setShowForm(true);
  };

  // -----------------------------
  // SAVE INVOICE
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.customerName.trim()) {
      setError("Please enter customer name.");
      return;
    }

    if (!formData.vehicleId) {
      setError("Please select a vehicle.");
      return;
    }

    if (!formData.startDate) {
      setError("Please select rental start date.");
      return;
    }

    if (!formData.returnDate) {
      setError("Please select return date.");
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.returnDate);

    if (end <= start) {
      setError(
        "Return date must be after start date."
      );
      return;
    }

    const finalTotal = calculateTotal();

    const invoiceData = {
      ...formData,

      baseRental:
        Number(formData.baseRental || 0),

      weekendCharges:
        Number(formData.weekendCharges || 0),

      peakSeasonCharges:
        Number(formData.peakSeasonCharges || 0),

      insurance:
        Number(formData.insurance || 0),

      additionalDriver:
        Number(formData.additionalDriver || 0),

      lateFee:
        Number(formData.lateFee || 0),

      damageCharges:
        Number(formData.damageCharges || 0),

      total: finalTotal,
    };

    try {
      let response;

      if (editingInvoice) {
        const id =
          editingInvoice.invoiceNumber ||
          editingInvoice._id;

        response = await fetch(
          `${API_URL}/api/invoices/${encodeURIComponent(
            id
          )}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              invoiceData
            ),
          }
        );
      } else {
        response = await fetch(
          `${API_URL}/api/invoices`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              invoiceData
            ),
          }
        );
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to save invoice"
        );
      }

      setMessage(
        editingInvoice
          ? "Invoice updated successfully."
          : "Invoice created successfully."
      );

      setShowForm(false);
      setEditingInvoice(null);

      await loadInvoices();
    } catch (err) {
      console.error(err);

      setError(err.message);
    }
  };

  // -----------------------------
  // DELETE INVOICE
  // -----------------------------
  const handleDelete = async (invoice) => {
    const id =
      invoice.invoiceNumber ||
      invoice._id;

    if (!id) {
      setError(
        "Invoice ID not found."
      );
      return;
    }

    const confirmDelete =
      window.confirm(
        `Are you sure you want to delete ${invoice.invoiceNumber || "this invoice"}?`
      );

    if (!confirmDelete) {
      return;
    }

    try {
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_URL}/api/invoices/${encodeURIComponent(
          id
        )}`,
        {
          method: "DELETE",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to delete invoice"
        );
      }

      setMessage(
        "Invoice deleted successfully."
      );

      await loadInvoices();
    } catch (err) {
      console.error(err);

      setError(err.message);
    }
  };

  // -----------------------------
  // VIEW INVOICE
  // -----------------------------
  const openView = (invoice) => {
    setSelectedInvoice(invoice);
    setShowView(true);
  };

  // -----------------------------
  // PRINT INVOICE
  // -----------------------------
  const printInvoice = (invoice) => {
    const printWindow =
      window.open(
        "",
        "_blank",
        "width=800,height=700"
      );

    if (!printWindow) {
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${invoice.invoiceNumber}</title>

          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
            }

            h1 {
              margin-bottom: 5px;
            }

            .header {
              margin-bottom: 30px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th,
            td {
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
            }

            th {
              background: #f5f5f5;
            }

            .total {
              font-size: 20px;
              font-weight: bold;
              margin-top: 20px;
            }
          </style>
        </head>

        <body>

          <div class="header">
            <h1>Vehicle Rental Invoice</h1>

            <p>
              Invoice Number:
              ${invoice.invoiceNumber || "-"}
            </p>

            <p>
              Customer:
              ${invoice.customerName || "-"}
            </p>

            <p>
              Vehicle:
              ${invoice.vehicleName || "-"}
            </p>

            <p>
              Vehicle ID:
              ${invoice.vehicleId || "-"}
            </p>

            <p>
              Location:
              ${invoice.location || "-"}
            </p>

            <p>
              Rental:
              ${invoice.startDate || "-"}
              to
              ${invoice.returnDate || "-"}
            </p>
          </div>

          <table>

            <tr>
              <th>Charge</th>
              <th>Amount</th>
            </tr>

            <tr>
              <td>Base Rental</td>
              <td>₹${Number(
                invoice.baseRental || 0
              ).toLocaleString()}</td>
            </tr>

            <tr>
              <td>Weekend Charges</td>
              <td>₹${Number(
                invoice.weekendCharges || 0
              ).toLocaleString()}</td>
            </tr>

            <tr>
              <td>Peak Season Charges</td>
              <td>₹${Number(
                invoice.peakSeasonCharges || 0
              ).toLocaleString()}</td>
            </tr>

            <tr>
              <td>Insurance</td>
              <td>₹${Number(
                invoice.insurance || 0
              ).toLocaleString()}</td>
            </tr>

            <tr>
              <td>Additional Driver</td>
              <td>₹${Number(
                invoice.additionalDriver || 0
              ).toLocaleString()}</td>
            </tr>

            <tr>
              <td>Late Return Fee</td>
              <td>₹${Number(
                invoice.lateFee || 0
              ).toLocaleString()}</td>
            </tr>

            <tr>
              <td>Damage Charges</td>
              <td>₹${Number(
                invoice.damageCharges || 0
              ).toLocaleString()}</td>
            </tr>

          </table>

          <div class="total">
            Total:
            ₹${Number(
              invoice.total || 0
            ).toLocaleString()}
          </div>

          <p>
            ${invoice.notes || ""}
          </p>

        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  // -----------------------------
  // FILTER INVOICES
  // -----------------------------
  const filteredInvoices =
    invoices.filter((invoice) => {
      const text = search.toLowerCase();

      return (
        String(
          invoice.invoiceNumber || ""
        )
          .toLowerCase()
          .includes(text) ||

        String(
          invoice.customerName || ""
        )
          .toLowerCase()
          .includes(text) ||

        String(
          invoice.vehicleName || ""
        )
          .toLowerCase()
          .includes(text) ||

        String(
          invoice.vehicleId || ""
        )
          .toLowerCase()
          .includes(text)
      );
    });

  // -----------------------------
  // SUMMARY
  // -----------------------------
  const totalRevenue =
    invoices.reduce(
      (sum, invoice) =>
        sum +
        Number(
          invoice.total || 0
        ),
      0
    );

  const latestInvoice =
    invoices.length > 0
      ? invoices[
          invoices.length - 1
        ]
      : null;

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
    <div className="billing-page">

      <div className="billing-header">

        <div>
          <h1>Billing & Invoices</h1>

          <p>
            Manage rental invoices and
            billing information.
          </p>
        </div>

        <button
          className="add-invoice-btn"
          onClick={openAddForm}
        >
          + Create Invoice
        </button>

      </div>

      {/* SUMMARY CARDS */}

      <div className="billing-summary">

        <div className="billing-card">
          <span>Total Invoices</span>

          <strong>
            {invoices.length}
          </strong>
        </div>

        <div className="billing-card">
          <span>Total Revenue</span>

          <strong>
            ₹
            {totalRevenue.toLocaleString()}
          </strong>
        </div>

        <div className="billing-card">
          <span>Latest Invoice</span>

          <strong>
            {latestInvoice
              ? latestInvoice.invoiceNumber
              : "-"}
          </strong>
        </div>

      </div>

      {/* MESSAGES */}

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* INVOICE SECTION */}

      <div className="billing-section">

        <div className="billing-section-header">

          <div>
            <h2>Invoice History</h2>

            <p>
              All rental billing records
            </p>
          </div>

          <input
            type="text"
            placeholder="Search invoice, customer or vehicle..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="invoice-search"
          />

        </div>

        {filteredInvoices.length === 0 ? (

          <div className="empty-invoices">
            <h3>No invoices found</h3>

            <p>
              Create an invoice to see it
              here.
            </p>
          </div>

        ) : (

          <div className="billing-table-wrapper">

            <table className="billing-table">

              <thead>

                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Vehicle</th>
                  <th>Rental Period</th>
                  <th>Location</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {filteredInvoices.map(
                  (invoice) => (

                    <tr
                      key={
                        invoice._id ||
                        invoice.invoiceNumber
                      }
                    >

                      <td>
                        <strong>
                          {invoice.invoiceNumber ||
                            "-"}
                        </strong>
                      </td>

                      <td>
                        {invoice.customerName ||
                          "-"}
                      </td>

                      <td>
                        <strong>
                          {invoice.vehicleName ||
                            "-"}
                        </strong>

                        <small>
                          {invoice.vehicleId ||
                            "-"}
                        </small>
                      </td>

                      <td>
                        {invoice.startDate ||
                          "-"}
                        <br />
                        to{" "}
                        {invoice.returnDate ||
                          "-"}
                      </td>

                      <td>
                        {invoice.location ||
                          "-"}
                      </td>

                      <td>
                        <strong>
                          ₹
                          {Number(
                            invoice.total ||
                              0
                          ).toLocaleString()}
                        </strong>
                      </td>

                      <td>

                        <div className="invoice-actions">

                          <button
                            className="view-btn"
                            onClick={() =>
                              openView(invoice)
                            }
                          >
                            View
                          </button>

                          <button
                            className="edit-btn"
                            onClick={() =>
                              openEditForm(
                                invoice
                              )
                            }
                          >
                            Edit
                          </button>

                          <button
                            className="print-btn"
                            onClick={() =>
                              printInvoice(
                                invoice
                              )
                            }
                          >
                            Print
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() =>
                              handleDelete(
                                invoice
                              )
                            }
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* CREATE / EDIT MODAL */}

      {showForm && (

        <div className="billing-modal-overlay">

          <div className="billing-modal">

            <div className="modal-header">

              <div>
                <h2>
                  {editingInvoice
                    ? "Edit Invoice"
                    : "Create Invoice"}
                </h2>

                <p>
                  Add rental billing details
                </p>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowForm(false)
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="billing-form"
            >

              {/* BASIC DETAILS */}

              <div className="form-section">

                <h3>
                  Invoice Details
                </h3>

                <div className="form-grid">

                  <div className="form-group">

                    <label>
                      Invoice Number
                    </label>

                    <input
                      type="text"
                      name="invoiceNumber"
                      value={
                        formData.invoiceNumber
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Customer Name
                    </label>

                    <input
                      type="text"
                      name="customerName"
                      value={
                        formData.customerName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter customer name"
                      required
                    />

                  </div>

                </div>

              </div>

              {/* VEHICLE */}

              <div className="form-section">

                <h3>
                  Vehicle Details
                </h3>

                <div className="form-grid">

                  <div className="form-group">

                    <label>
                      Select Vehicle
                    </label>

                    <select
                      value={
                        formData.vehicleId
                      }
                      onChange={
                        handleVehicleChange
                      }
                      required
                    >

                      <option value="">
                        Select Vehicle
                      </option>

                      {vehicles.map(
                        (vehicle) => {

                          const id =
                            vehicle.id ||
                            vehicle._id;

                          const disabled =
                            String(
                              vehicle.status
                            ).toUpperCase() ===
                            "MAINTENANCE";

                          return (
                            <option
                              key={id}
                              value={id}
                              disabled={
                                disabled
                              }
                            >
                              {id} -{" "}
                              {vehicle.model ||
                                "Vehicle"}{" "}
                              {disabled
                                ? "(Maintenance)"
                                : ""}
                            </option>
                          );
                        }
                      )}

                    </select>

                  </div>

                  <div className="form-group">

                    <label>
                      Vehicle ID
                    </label>

                    <input
                      type="text"
                      value={
                        formData.vehicleId
                      }
                      readOnly
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Vehicle Model
                    </label>

                    <input
                      type="text"
                      value={
                        formData.vehicleName
                      }
                      readOnly
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Location
                    </label>

                    <input
                      type="text"
                      value={
                        formData.location
                      }
                      readOnly
                    />

                  </div>

                </div>

              </div>

              {/* DATES */}

              <div className="form-section">

                <h3>
                  Rental Period
                </h3>

                <div className="form-grid">

                  <div className="form-group">

                    <label>
                      Start Date
                    </label>

                    <input
                      type="date"
                      name="startDate"
                      value={
                        formData.startDate
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Return Date
                    </label>

                    <input
                      type="date"
                      name="returnDate"
                      value={
                        formData.returnDate
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />

                  </div>

                </div>

              </div>

              {/* PRICING */}

              <div className="form-section">

                <h3>
                  Pricing
                </h3>

                <div className="form-grid">

                  <div className="form-group">

                    <label>
                      Base Rental
                    </label>

                    <input
                      type="number"
                      name="baseRental"
                      min="0"
                      value={
                        formData.baseRental
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Weekend Charges
                    </label>

                    <input
                      type="number"
                      name="weekendCharges"
                      min="0"
                      value={
                        formData.weekendCharges
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Peak Season Charges
                    </label>

                    <input
                      type="number"
                      name="peakSeasonCharges"
                      min="0"
                      value={
                        formData.peakSeasonCharges
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Insurance
                    </label>

                    <input
                      type="number"
                      name="insurance"
                      min="0"
                      value={
                        formData.insurance
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Additional Driver
                    </label>

                    <input
                      type="number"
                      name="additionalDriver"
                      min="0"
                      value={
                        formData.additionalDriver
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Late Return Fee
                    </label>

                    <input
                      type="number"
                      name="lateFee"
                      min="0"
                      value={
                        formData.lateFee
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                  <div className="form-group">

                    <label>
                      Damage Charges
                    </label>

                    <input
                      type="number"
                      name="damageCharges"
                      min="0"
                      value={
                        formData.damageCharges
                      }
                      onChange={
                        handleChange
                      }
                    />

                  </div>

                </div>

                <div className="invoice-total">

                  <span>
                    Total Amount
                  </span>

                  <strong>
                    ₹
                    {calculateTotal().toLocaleString()}
                  </strong>

                </div>

              </div>

              {/* NOTES */}

              <div className="form-section">

                <h3>
                  Notes
                </h3>

                <textarea
                  name="notes"
                  value={
                    formData.notes
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Additional notes..."
                  rows="4"
                />

              </div>

              {/* BUTTONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() =>
                    setShowForm(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                >
                  {editingInvoice
                    ? "Update Invoice"
                    : "Create Invoice"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* VIEW MODAL */}

      {showView &&
        selectedInvoice && (

          <div className="billing-modal-overlay">

            <div className="billing-modal view-modal">

              <div className="modal-header">

                <div>
                  <h2>
                    Invoice Details
                  </h2>

                  <p>
                    {
                      selectedInvoice.invoiceNumber
                    }
                  </p>
                </div>

                <button
                  className="modal-close"
                  onClick={() =>
                    setShowView(false)
                  }
                >
                  ×
                </button>

              </div>

              <div className="invoice-view">

                <div className="invoice-info-grid">

                  <div>
                    <span>
                      Customer
                    </span>

                    <strong>
                      {
                        selectedInvoice.customerName ||
                        "-"
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Vehicle
                    </span>

                    <strong>
                      {
                        selectedInvoice.vehicleName ||
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
                        selectedInvoice.vehicleId ||
                        "-"
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Location
                    </span>

                    <strong>
                      {
                        selectedInvoice.location ||
                        "-"
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Start Date
                    </span>

                    <strong>
                      {
                        selectedInvoice.startDate ||
                        "-"
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Return Date
                    </span>

                    <strong>
                      {
                        selectedInvoice.returnDate ||
                        "-"
                      }
                    </strong>
                  </div>

                </div>

                <div className="invoice-charges">

                  <div>
                    <span>
                      Base Rental
                    </span>

                    <strong>
                      ₹
                      {Number(
                        selectedInvoice.baseRental ||
                          0
                      ).toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Weekend Charges
                    </span>

                    <strong>
                      ₹
                      {Number(
                        selectedInvoice.weekendCharges ||
                          0
                      ).toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Peak Season Charges
                    </span>

                    <strong>
                      ₹
                      {Number(
                        selectedInvoice.peakSeasonCharges ||
                          0
                      ).toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Insurance
                    </span>

                    <strong>
                      ₹
                      {Number(
                        selectedInvoice.insurance ||
                          0
                      ).toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Additional Driver
                    </span>

                    <strong>
                      ₹
                      {Number(
                        selectedInvoice.additionalDriver ||
                          0
                      ).toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Late Return Fee
                    </span>

                    <strong>
                      ₹
                      {Number(
                        selectedInvoice.lateFee ||
                          0
                      ).toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Damage Charges
                    </span>

                    <strong>
                      ₹
                      {Number(
                        selectedInvoice.damageCharges ||
                          0
                      ).toLocaleString()}
                    </strong>
                  </div>

                </div>

                <div className="view-total">

                  <span>
                    Total Amount
                  </span>

                  <strong>
                    ₹
                    {Number(
                      selectedInvoice.total ||
                        0
                    ).toLocaleString()}
                  </strong>

                </div>

                {selectedInvoice.notes && (
                  <div className="view-notes">

                    <span>
                      Notes
                    </span>

                    <p>
                      {
                        selectedInvoice.notes
                      }
                    </p>

                  </div>
                )}

                <div className="modal-actions">

                  <button
                    className="cancel-btn"
                    onClick={() =>
                      setShowView(false)
                    }
                  >
                    Close
                  </button>

                  <button
                    className="print-btn large"
                    onClick={() =>
                      printInvoice(
                        selectedInvoice
                      )
                    }
                  >
                    Print Invoice
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}

export default Billing;