import React, { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./OwnerLayout.css";

const OwnerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // if state available, use it; otherwise load from localStorage
  const state = location.state || JSON.parse(localStorage.getItem("ownerState"));

  useEffect(() => {
    if (location.state) {
      // store in localStorage only once
      localStorage.setItem("ownerState", JSON.stringify(location.state));
      
    }
  }, [location.state]);

  if (!state) {
    navigate("/"); // logout case
    return null;
  }

  const menuItems = [
    { name: "Job Manager", path: "/owner/jobs", icon: "💼" },
    { name: "Analytics", path: "/owner/analytics", icon: "📊" },
    { name: "Applications", path: "/owner/applications", icon: "📩" },
    { name: "Profile", path: "/owner/profile", icon: "👤" },
  ];

  return (
    <div className="owner-layout">
      <aside className="sidebar">
        <h2 className="logo">ShramSaathi</h2>
        <nav>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              state={state}
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
            >
              <span className="icon">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="main-content">
        <Outlet context={state} />
      </main>
    </div>
  );
};

export default OwnerLayout;
