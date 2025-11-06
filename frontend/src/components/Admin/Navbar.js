import React,{useState} from "react";
import logo from "./logo1.png";
import "./Navbar.css"; 
import Popup from "./Popup";

const Navbar = () => {
  const [showPopup, setShowPopup] = useState(false);
  
    const handleOpenPopup = () => setShowPopup(true);
    const handleClosePopup = () => setShowPopup(false);
  return (
    <header className="navbar">

      <div className="navbar-left">
        <img src={logo} alt="Shramsaathi Logo" className="navbar-logo" />
        <h1 className="navbar-title">Shramsaathi</h1>
      </div>

      <div className="navbar-buttons">
        <button className="btn-primary" onClick={handleOpenPopup}>Login</button>
        <button className="btn-outline" onClick={handleOpenPopup}>Register</button>
      </div>
      {showPopup && (
        <Popup
          onClose={handleClosePopup}
        />
      )}
    </header>
  );
};

export default Navbar;
