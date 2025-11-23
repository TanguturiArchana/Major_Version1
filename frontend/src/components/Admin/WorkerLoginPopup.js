import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Popup.css";
import API from "./api";
import axios from "axios";
const LoginPopup = ({ onClose,name ,phone,isAfterWorkerRegister }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const nav=useNavigate();
  async function getWorkerId(name, phone) {
  const res = await axios.get(`http://localhost:8083/api/users/findWorker`, {
    params: { name, phone }
  });
  return res.data.id;
}


  const handleLogin = async (e) => {
  e.preventDefault();
  try {
     const res = await API.post(`/login/user?name=${username}&password=${password}`);
    if (res.status === 200) {
      if(isAfterWorkerRegister ){
        const id = await getWorkerId(name, phone);
        console.log("login via register",id);
        alert("Worker Login successful!");
        nav("workerDashboard",{state:{id}});
        

      }
      else{
        const res = await axios.get(`http://localhost:8083/api/users/findByNameAndPassword`, {
           params: { name: username, password } 
        });
        const id=res.data.id;
        console.log("login via login",id);
        alert("Worker Login successful!");
        nav("/workerDashboard", {state:{id}});

      } 
      
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
