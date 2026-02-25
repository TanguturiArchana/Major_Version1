import React, { useEffect, useState } from "react";
import "./Stats.css";
import axios from "axios";
import { API_BASE_URL } from "../../config/environment";

const Stats = () => {
  const [data, setData] = useState([]);
  const [displayedValues, setDisplayedValues] = useState({});

  useEffect(() => {
    axios.get(`${API_BASE_URL}/stats`)
      .then(res => {
        const statsData = [
          { 
            label: "Total Owners", 
            value: res.data.totalOwners,
            icon: "👔",
            color: "#667eea",
            bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          },
          { 
            label: "Total Workers", 
            value: res.data.totalWorkers,
            icon: "🛠️",
            color: "#f093fb",
            bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
          },
          { 
            label: "Job Openings", 
            value: res.data.totalJobs,
            icon: "📋",
            color: "#4facfe",
            bgGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          },
          { 
            label: "Active Jobs", 
            value: res.data.activeJobs,
            icon: "⚡",
            color: "#43e97b",
            bgGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
          }
        ];
        setData(statsData);

        // Animate counter values
        statsData.forEach((stat, idx) => {
          animateCounter(idx, stat.value);
        });
      })
      .catch(err => console.error(err));
  }, []);

  const animateCounter = (index, finalValue) => {
    let currentValue = 0;
    const increment = Math.ceil(finalValue / 50);
    const interval = setInterval(() => {
      currentValue += increment;
      if (currentValue >= finalValue) {
        currentValue = finalValue;
        clearInterval(interval);
      }
      setDisplayedValues(prev => ({
        ...prev,
        [index]: currentValue
      }));
    }, 30);
  };

  return (
    <section className="stats-section">
      <div className="stats-header">
        <h2 className="stats-title">📊 Platform Statistics</h2>
        <p className="stats-subtitle">Real-time metrics and insights</p>
      </div>
      
      <div className="stats-grid">
        {data.map((item, i) => (
          <div key={i} className="stat-card" style={{ backgroundImage: item.bgGradient }}>
            <div className="stat-icon">{item.icon}</div>
            <div className="stat-content">
              <p className="stat-label">{item.label}</p>
              <p className="stat-value">{displayedValues[i] !== undefined ? displayedValues[i].toLocaleString() : 0}</p>
            </div>
            <div className="stat-accent"></div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Stats;
