import React from "react";
import "./ProgressRing.css";

const ProgressRing = ({ percentage = 0, label = "", color = "#2563eb", sublabel = "" }) => {
  const radius = 38;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="progress-card">
      <div className="progress-svg-container">
        <svg height={radius * 2} width={radius * 2}>
          <circle
            stroke="#e2e8f0"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="progress-circle-bar"
          />
        </svg>
        <span className="progress-percentage">{Math.round(percentage)}%</span>
      </div>
      <div className="progress-details">
        <h4>{label}</h4>
        {sublabel && <p>{sublabel}</p>}
      </div>
    </div>
  );
};

export default ProgressRing;
