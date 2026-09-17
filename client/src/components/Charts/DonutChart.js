import React, { useState } from "react";
import "./DonutChart.css";

const DEFAULT_COLORS = [
  "#10b981", // Available - Green
  "#2563eb", // Rented - Blue
  "#f59e0b", // Reserved - Amber
  "#ef4444", // Maintenance - Red
  "#8b5cf6", // For Sale - Purple
  "#06b6d4"  // Other - Cyan
];

const DonutChart = ({ data = [], title = "Fleet Breakdown", centerText = "" }) => {
  const [activeSegment, setActiveSegment] = useState(null);

  const total = data.reduce((acc, item) => acc + (Number(item.value) || 0), 0);

  if (total === 0) {
    return (
      <div className="donut-chart-card empty-chart">
        <h3>{title}</h3>
        <p className="chart-empty-text">No vehicle data available</p>
      </div>
    );
  }

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let accumulatedAngle = 0;

  const segments = data.map((item, index) => {
    const value = Number(item.value) || 0;
    const percentage = total > 0 ? (value / total) * 100 : 0;
    const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedAngle / 360) * circumference);
    accumulatedAngle += (percentage / 100) * 360;

    return {
      ...item,
      value,
      percentage: percentage.toFixed(1),
      strokeDasharray,
      strokeDashoffset,
      color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
    };
  });

  return (
    <div className="donut-chart-card">
      <div className="chart-header">
        <h3>{title}</h3>
        <span className="total-badge">{total} Total</span>
      </div>

      <div className="donut-content">
        <div className="svg-wrapper">
          <svg viewBox="0 0 200 200" className="donut-svg">
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth="24"
            />
            {segments.map((seg, i) => (
              <circle
                key={i}
                cx="100"
                cy="100"
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={activeSegment === i ? 28 : 24}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                className="donut-segment"
                onMouseEnter={() => setActiveSegment(i)}
                onMouseLeave={() => setActiveSegment(null)}
                style={{
                  transformOrigin: "center",
                  transform: "rotate(-90deg)",
                  transition: "stroke-width 0.2s ease, opacity 0.2s ease",
                  opacity: activeSegment === null || activeSegment === i ? 1 : 0.65,
                  cursor: "pointer"
                }}
              />
            ))}
          </svg>
          <div className="donut-center">
            <span className="donut-center-value">
              {activeSegment !== null ? segments[activeSegment].value : (centerText || total)}
            </span>
            <span className="donut-center-label">
              {activeSegment !== null ? segments[activeSegment].label : "Vehicles"}
            </span>
          </div>
        </div>

        <div className="donut-legend">
          {segments.map((seg, i) => (
            <div
              key={i}
              className={`legend-item ${activeSegment === i ? "active" : ""}`}
              onMouseEnter={() => setActiveSegment(i)}
              onMouseLeave={() => setActiveSegment(null)}
            >
              <span className="legend-dot" style={{ backgroundColor: seg.color }}></span>
              <span className="legend-label">{seg.label}</span>
              <span className="legend-val">{seg.value}</span>
              <span className="legend-pct">({seg.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
