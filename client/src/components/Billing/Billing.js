import React, { useEffect, useState } from "react";
import "./Billing.css";

function Billing() {
  const [invoice, setInvoice] = useState(null);

  const [baseRental, setBaseRental] = useState(10000);
  const [insurance, setInsurance] = useState(1500);
  const [additionalDriver, setAdditionalDriver] = useState(800);
  const [lateFee, setLateFee] = useState(500);
  const [damageCharges, setDamageCharges] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const total =
    Number(baseRental || 0) +
    Number(insurance || 0) +
    Number(additionalDriver || 0) +
    Number(lateFee || 0) +
    Number(damageCharges || 0);

  // Load invoice when page opens
  useEffect(() => {
    loadInvoice();
  }, []);

  const loadInvoice = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/invoices/INV1001"
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setInvoice(data.invoice);

        setBaseRental(data.invoice.baseRental || 0);
        setInsurance(data.invoice.insurance || 0);
        setAdditionalDriver(
          data.invoice.additionalDriver || 0
        );
        setLateFee(data.invoice.lateFee || 0);
        setDamageCharges(
          data.invoice.damageCharges || 0
        );
      } else {
        setInvoice(null);
      }
    } catch (err) {
      console.error("Load invoice error:", err);
      setError("Unable to connect to billing server.");
    } finally {
      setLoading(false);
    }
  };

  // Save invoice to MongoDB
  const saveInvoice = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const invoiceData = {
        invoiceNumber: "INV1001",
        customerName: "Customer A",
        vehicleName: "Hyundai Creta",
        vehicleId: "CAR1001",
        startDate: "10 Sep 2026",
        returnDate: "15 Sep 2026",
        location: "Hyderabad",

        baseRental: Number(baseRental || 0),
        insurance: Number(insurance || 0),
        additionalDriver: Number(additionalDriver || 0),
        lateFee: Number(lateFee || 0),
        damageCharges: Number(damageCharges || 0),
      };

      const response = await fetch(
        "http://localhost:5000/api/invoices",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(invoiceData),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to save invoice"
        );
      }

      setInvoice(data.invoice);

      setMessage("Invoice saved successfully.");

      await loadInvoice();
    } catch (err) {
      console.error("Save invoice error:", err);

      setError(
        err.message || "Unable to save invoice."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="billing-container">
        <div className="invoice-card">
          <h2>Loading Billing Details...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="billing-container">

      {/* HEADER */}
      <div className="billing-header">
        <div>
          <h1>Billing & Invoice</h1>
          <p>Vehicle Rental Billing Details</p>
        </div>

        <div className="invoice-number">
          Invoice #INV1001
        </div>
      </div>

      {/* SUCCESS MESSAGE */}
      {message && (
        <div
          style={{
            padding: "12px",
            marginBottom: "15px",
            backgroundColor: "#e8f5e9",
            color: "#2e7d32",
            borderRadius: "8px",
          }}
        >
          {message}
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div
          style={{
            padding: "12px",
            marginBottom: "15px",
            backgroundColor: "#ffebee",
            color: "#c62828",
            borderRadius: "8px",
          }}
        >
          {error}
        </div>
      )}

      {/* INVOICE */}
      <div className="invoice-card">

        {/* CUSTOMER DETAILS */}
        <div className="customer-details">

          <div>
            <h3>Customer Details</h3>

            <p>
              <strong>Name:</strong>{" "}
              {invoice?.customerName || "Customer A"}
            </p>

            <p>
              <strong>Vehicle:</strong>{" "}
              {invoice?.vehicleName || "Hyundai Creta"}
            </p>

            <p>
              <strong>Vehicle ID:</strong>{" "}
              {invoice?.vehicleId || "CAR1001"}
            </p>
          </div>

          {/* RENTAL DETAILS */}
          <div>
            <h3>Rental Details</h3>

            <p>
              <strong>Start Date:</strong>{" "}
              {invoice?.startDate || "10 Sep 2026"}
            </p>

            <p>
              <strong>Return Date:</strong>{" "}
              {invoice?.returnDate || "15 Sep 2026"}
            </p>

            <p>
              <strong>Location:</strong>{" "}
              {invoice?.location || "Hyderabad"}
            </p>
          </div>

        </div>

        {/* BILLING TABLE */}
        <div className="billing-table">

          <div className="billing-row billing-heading">
            <span>Charge</span>
            <span>Amount</span>
          </div>

          {/* BASE RENTAL */}
          <div className="billing-row">
            <span>Base Rental</span>

            <input
              type="number"
              value={baseRental}
              onChange={(e) =>
                setBaseRental(e.target.value)
              }
            />
          </div>

          {/* INSURANCE */}
          <div className="billing-row">
            <span>Insurance</span>

            <input
              type="number"
              value={insurance}
              onChange={(e) =>
                setInsurance(e.target.value)
              }
            />
          </div>

          {/* ADDITIONAL DRIVER */}
          <div className="billing-row">
            <span>Additional Driver</span>

            <input
              type="number"
              value={additionalDriver}
              onChange={(e) =>
                setAdditionalDriver(e.target.value)
              }
            />
          </div>

          {/* LATE FEE */}
          <div className="billing-row">
            <span>Late Return Fee</span>

            <input
              type="number"
              value={lateFee}
              onChange={(e) =>
                setLateFee(e.target.value)
              }
            />
          </div>

          {/* DAMAGE CHARGES */}
          <div className="billing-row">
            <span>Damage Charges</span>

            <input
              type="number"
              value={damageCharges}
              onChange={(e) =>
                setDamageCharges(e.target.value)
              }
            />
          </div>

          {/* TOTAL */}
          <div className="billing-total">
            <span>Total Amount</span>

            <strong>
              ₹{total.toLocaleString("en-IN")}
            </strong>
          </div>

        </div>

        {/* BUTTONS */}
        <div
          className="billing-actions"
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >

          <button
            onClick={saveInvoice}
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Invoice"}
          </button>

          <button
            onClick={() => window.print()}
          >
            Print Invoice
          </button>

        </div>

      </div>
    </div>
  );
}

export default Billing;