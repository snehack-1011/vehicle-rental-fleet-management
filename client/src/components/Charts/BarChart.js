import React, { useState } from "react";
import "./BarChart.css";

const BarChart = ({ data = [], title = "Category Distribution", subtitle = "", valuePrefix = "", valueSuffix = "" }) => {
  const [hoveredBar, setHoveredBar] = useState(null);

  const maxValue = Math.max(...data.map(item => Number(item.value) || 0), 1);

  return (
    <div className="bar-chart-card">
      <div className="bar-chart-header">
        <div>
          <h3>{title}</h3>
          {subtitle && <p className="bar-chart-subtitle">{subtitle}</p>}
        </div>
      </div>

      <div className="bar-chart-body">
        {data.map((item, index) => {
          const val = Number(item.value) || 0;
          const pct = Math.min((val / maxValue) * 100, 100);
          const isHovered = hoveredBar === index;

          return (
            <div
              key={index}
              className={`bar-row ${isHovered ? "active" : ""}`}
              onMouseEnter={() => setHoveredBar(index)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              <div className="bar-info">
                <span className="bar-label">{item.label}</span>
                <span className="bar-value">
                  {valuePrefix}{val.toLocaleString("en-IN")}{valueSuffix}
                </span>
              </div>
              <div className="bar-track">
                <div
                  className="bar-fill"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: item.color || "#2563eb"
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChart;
