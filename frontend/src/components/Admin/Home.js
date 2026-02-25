import { useState } from "react";
import "./Home.css";
import Popup from "./Popup";

const heroImages = [
  "https://images.pexels.com/photos/1249611/pexels-photo-1249611.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/5691620/pexels-photo-5691620.jpeg?auto=compress&cs=tinysrgb&w=1200",
  "https://images.pexels.com/photos/8961300/pexels-photo-8961300.jpeg?auto=compress&cs=tinysrgb&w=1200",
];

const Home = () => {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <section className="home-hero">
      <div className="home-hero-content">
        <p className="hero-kicker">Trusted Worker Marketplace</p>
        <h1>Hire verified skilled workers faster, with confidence.</h1>
        <p className="hero-description">
          ShramSaathi connects owners with reliable carpenters, electricians,
          masons, and technicians. Post jobs, review trust signals, and hire
          with real-time engagement and transparent profiles.
        </p>
        <div className="hero-actions">
          <button className="join-btn" onClick={() => setShowPopup(true)}>
            Start Hiring
          </button>
          <button className="tour-btn" onClick={() => setShowPopup(true)}>
            Worker Join
          </button>
        </div>
      </div>

      <div className="home-hero-visuals">
        <div className="visual-main">
          <img src={heroImages[0]} alt="Construction team at work" />
        </div>
        <div className="visual-side">
          <img src={heroImages[1]} alt="Skilled carpenter working precisely" />
          <img src={heroImages[2]} alt="Worker taking measurements on site" />
        </div>
      </div>

      {showPopup && <Popup onClose={() => setShowPopup(false)} />}
    </section>
  );
};

export default Home;
