import React, { useState } from "react";
import "./Billing.css";

function Billing() {
  const [baseRental, setBaseRental] = useState(10000);
  const [insurance, setInsurance] = useState(1500);
  const [additionalDriver, setAdditionalDriver] = useState(800);
  const [lateFee, setLateFee] = useState(500);
  const [damageCharges, setDamageCharges] = useState(0);

  const total =
    Number(baseRental) +
    Number(insurance) +
    Number(additionalDriver) +
    Number(lateFee) +
    Number(damageCharges);

  return (
    <div className="billing-container">
      <div className="billing-header">
        <div>
          <h1>Billing & Invoice</h1>
          <p>Vehicle Rental Billing Details</p>
        </div>

        <div className="invoice-number">
          Invoice #INV1001
        </div>
      </div>

      <div className="invoice-card">

        <div className="customer-details">
          <div>
            <h3>Customer Details</h3>
            <p><strong>Name:</strong> Customer A</p>
            <p><strong>Vehicle:</strong> Hyundai Creta</p>
            <p><strong>Vehicle ID:</strong> CAR1001</p>
          </div>

          <div>
            <h3>Rental Details</h3>
            <p><strong>Start Date:</strong> 10 Sep 2026</p>
            <p><strong>Return Date:</strong> 15 Sep 2026</p>
            <p><strong>Location:</strong> Hyderabad</p>
          </div>
        </div>

        <div className="billing-table">
          <div className="billing-row billing-heading">
            <span>Charge</span>
            <span>Amount</span>
          </div>

          <div className="billing-row">
            <span>Base Rental</span>
            <input
              type="number"
              value={baseRental}
              onChange={(e) => setBaseRental(e.target.value)}
            />
          </div>

          <div className="billing-row">
            <span>Insurance</span>
            <input
              type="number"
              value={insurance}
              onChange={(e) => setInsurance(e.target.value)}
            />
          </div>

          <div className="billing-row">
            <span>Additional Driver</span>
            <input
              type="number"
              value={additionalDriver}
              onChange={(e) => setAdditionalDriver(e.target.value)}
            />
          </div>

          <div className="billing-row">
            <span>Late Return Fee</span>
            <input
              type="number"
              value={lateFee}
              onChange={(e) => setLateFee(e.target.value)}
            />
          </div>

          <div className="billing-row">
            <span>Damage Charges</span>
            <input
              type="number"
              value={damageCharges}
              onChange={(e) => setDamageCharges(e.target.value)}
            />
          </div>

          <div className="billing-total">
            <span>Total Amount</span>
            <strong>₹{total.toLocaleString("en-IN")}</strong>
          </div>
        </div>

        <div className="billing-actions">
          <button onClick={() => window.print()}>
            Print Invoice
          </button>
        </div>

      </div>
    </div>
  );
}

export default Billing;