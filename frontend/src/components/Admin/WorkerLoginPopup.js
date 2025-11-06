import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Popup.css";
import API from "./api";
const LoginPopup = ({ onClose }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const nav=useNavigate();

 
  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await API.post(`/login/user?name=${username}&password=${password}`);
    if (res.status === 200) {
      alert("Login successful!");
      nav("/workerDashboard");
    }
  } catch (err) {
    alert(err.response.data);
  }
};

  return (
    <div className="popup-overlay">
      <div className="popup-box form-box">
        <h2>Login to ShramSaathi</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" className="btn-primary">
            Login
          </button>
        </form>
        <button className="btn-close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default LoginPopup;
