import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./WorkerProfile.css";
import { API_BASE_URL } from "../../config/environment";

const API_BASE = API_BASE_URL;

const WorkerProfile = () => {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [selectedField, setSelectedField] = useState("");
  const [newValue, setNewValue] = useState("");
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || JSON.parse(localStorage.getItem("workerState"));

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!state) navigate("/");
    }, 300);
    return () => clearTimeout(timer);
  }, [state, navigate]);

  useEffect(() => {
    if (!state) return;

    const fetchWorker = async () => {
      try {
        const res = await axios.get(`${API_BASE}/users/profile/${state.id}`);
        setWorker(res.data);
      } catch (err) {
        console.error("Error loading profile", err);
        setMessage("❌ Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchWorker();
  }, [state]);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage("⚠️ All fields are required!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("⚠️ Passwords do not match!");
      return;
    }

    try {
      await axios.put(`${API_BASE}/users/change-password/${state.id}`, {
        oldPassword,
        newPassword,
      });

      setMessage("✅ Password changed successfully!");
      setShowPasswordPopup(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ " + (err.response?.data || "Password update failed"));
      setTimeout(() => setMessage(""), 3000);
    }
  };
  

const handleFieldUpdate = async () => {
    if (!newValue.trim()) {
      setMessage("⚠️ Value cannot be empty!");
      return;
    }

    try {
      const res = await axios.put(
        `${API_BASE}/users/update-field/${state.id}?field=${selectedField}&value=${newValue}`
      );
      setWorker(res.data);
      setMessage(`✅ ${selectedField} updated successfully!`);
      setShowUpdatePopup(false);
      setSelectedField("");
      setNewValue("");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ Update failed");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("workerState");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="error-container">
        <h2>❌ Profile not found</h2>
        <p>ID: {state?.id}</p>
        <button className="back-btn" onClick={() => navigate("/")}>
          Go Home
        </button>
      </div>
    );
  }

  const fields = [
    { key: "name", label: "Full Name", icon: "👤", value: worker.name },
    { key: "phone", label: "Phone Number", icon: "📞", value: worker.phone },
    { key: "businessName", label: "Business Name", icon: "🏢", value: worker.businessName },
    { key: "address", label: "Address", icon: "🏠", value: worker.address },
    { key: "district", label: "District", icon: "🗺️", value: worker.district },
    { key: "mandal", label: "Mandal/City", icon: "🏙️", value: worker.mandal },
    { key: "pincode", label: "Pincode", icon: "📮", value: worker.pincode },
  ];

  return (
    <div className="worker-profile-container">
      {/* Header */}
      <div className="profile-header">
        <div className="header-content">
          <div className="profile-avatar">
            <span>{worker.name?.charAt(0).toUpperCase() || "W"}</span>
          </div>
          <div className="header-info">
            <h1 className="profile-title">Worker Profile</h1>
            <p className="profile-subtitle">Manage your professional information</p>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          🚪 Logout
        </button>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`status-message ${message.includes("✅") ? "success" : message.includes("❌") ? "error" : "warning"}`}>
          {message}
        </div>
      )}

      {/* Profile Grid */}
      <div className="profile-grid">
        {/* Personal Information Card */}
        <div className="profile-section">
          <h2 className="section-title">👤 Personal Information</h2>
          <div className="fields-grid">
            {fields.slice(0, 3).map((field) => (
              <div key={field.key} className="field-card">
                <div className="field-header">
                  <span className="field-icon">{field.icon}</span>
                  <label className="field-label">{field.label}</label>
                </div>
                <div className="field-value">{field.value || "Not provided"}</div>
                <button
                  className="edit-field-btn"
                  onClick={() => {
                    setSelectedField(field.key);
                    setNewValue(field.value || "");
                    setShowUpdatePopup(true);
                  }}
                  title={`Edit ${field.label}`}
                >
                  ✏️ Edit
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Location Information Card */}
        <div className="profile-section">
          <h2 className="section-title">📍 Location Information</h2>
          <div className="fields-grid">
            {fields.slice(3).map((field) => (
              <div key={field.key} className="field-card">
                <div className="field-header">
                  <span className="field-icon">{field.icon}</span>
                  <label className="field-label">{field.label}</label>
                </div>
                <div className="field-value">{field.value || "Not provided"}</div>
                <button
                  className="edit-field-btn"
                  onClick={() => {
                    setSelectedField(field.key);
                    setNewValue(field.value || "");
                    setShowUpdatePopup(true);
                  }}
                  title={`Edit ${field.label}`}
                >
                  ✏️ Edit
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Account Settings Card */}
        <div className="profile-section full-width">
          <h2 className="section-title">🔐 Account Settings</h2>
          <div className="account-settings">
            <div className="setting-item">
              <div className="setting-info">
                <h3>Password Protection</h3>
                <p>Update your password to maintain account security</p>
              </div>
              <button
                className="action-btn primary"
                onClick={() => setShowPasswordPopup(true)}
              >
                🔑 Change Password
              </button>
            </div>
            <div className="setting-item">
              <div className="setting-info">
                <h3>Account Status</h3>
                <p>Your account is {worker.registered ? "Registered ✅" : "Not Registered ❌"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Field Popup */}
      {showUpdatePopup && (
        <div className="modal-overlay" onClick={() => setShowUpdatePopup(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Update {selectedField}</h3>
              <button className="close-btn" onClick={() => setShowUpdatePopup(false)}>✕</button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder={`Enter new ${selectedField}`}
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="modal-input"
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowUpdatePopup(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleFieldUpdate}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Popup */}
      {showPasswordPopup && (
        <div className="modal-overlay" onClick={() => setShowPasswordPopup(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🔐 Change Password</h3>
              <button className="close-btn" onClick={() => setShowPasswordPopup(false)}>✕</button>
            </div>
            <div className="modal-body">
              <input
                type="password"
                placeholder="Current Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="modal-input"
                autoFocus
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="modal-input"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="modal-input"
              />
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPasswordPopup(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleChangePassword}>
                Update Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerProfile;
