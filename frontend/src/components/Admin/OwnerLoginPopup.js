import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Popup.css";
import axios from "axios";
import API from "./api";
const OwnerLoginPopup = ({ onClose,name ,phone,isAfterRegister}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const nav=useNavigate();
   async function getOwnerId(name, phone) {
    const res = await axios.get(`http://localhost:8083/api/owners/find`, {
      params: { name, phone }
    });
    return res.data.id;
  }
  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await API.post(`/login/owner?name=${username}&password=${password}`);
    if (res.status === 200) {
      if(isAfterRegister){
        const id = await getOwnerId(name, phone);
        console.log("login via register",id);
        alert("Login successful!");
        nav("/ownerDashboard",{state:{id}});
      }
      else{
        const res = await axios.get(`http://localhost:8083/api/owners/findByNameAndPassword`, {
           params: { name: username, password } 
        });
        const id=res.data.id;
        console.log("login via login",id);
        alert("Login successful!");
        nav("/ownerDashboard", {state:{id}});

      } 
      
    }
  } 
    
  catch (err) {
    // alert(err.response.data);
    alert("login error")
    alert(err.response?.data || "Login failed");
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

export default OwnerLoginPopup;
