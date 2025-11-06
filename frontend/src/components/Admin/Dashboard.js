import React from "react";
import Stats from "../components/Stats";
import Opening from "../components/Opening";
import "./Dashboard.css"; 

const Dashboard = () => {
  return (
    <div className="dashboard">
      <Stats />
      <Opening />
    </div>
  );
};

export default Dashboard;
