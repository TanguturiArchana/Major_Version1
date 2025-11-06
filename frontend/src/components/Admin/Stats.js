import React from "react";
import "./Stats.css";

const Stats = () => {
  const data = [
    { label: "Total no. of owners registered", value: "20" },
    { label: "Total no. of workers registered", value: "140" },
    { label: "Total jobs posted", value: "60" },
    { label: "Total Active Jobs", value: "45" },
  ];

  return (
    <section className="stats-section">
      {data.map((item, i) => (
        <div key={i} className="stat-card">
          <p className="stat-label">{item.label}</p>
          <p className="stat-value">{item.value}</p>
        </div>
      ))}
    </section>
  );
};

export default Stats;
