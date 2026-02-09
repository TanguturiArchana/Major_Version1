import React, { useEffect, useState } from "react";
import "./Stats.css";
import axios from "axios";

const Stats = () => {

  const [data, setData] = useState([]);

  useEffect(() => {

    axios.get("http://localhost:8083/api/stats")
      .then(res => {

        setData([
          { label: "Total no. of owners registered", value: res.data.totalOwners },
          { label: "Total no. of workers registered", value: res.data.totalWorkers },
          { label: "Total jobs posted", value: res.data.totalJobs },
          { label: "Total Active Jobs", value: res.data.activeJobs }
        ]);

      })
      .catch(err => console.error(err));

  }, []);

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
