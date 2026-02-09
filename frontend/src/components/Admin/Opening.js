import React, { useState, useEffect } from "react";
import "./Opening.css";
import Popup from "./Popup";

const Opening = () => {

  const [jobs, setJobs] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {

    fetch("https://shramsaathibackend.onrender.com/api/jobs/recent")
      .then(res => res.json())
      .then(data => setJobs(data))
      .catch(err => console.error(err));

  }, []);

  const handleOpenPopup = () => setShowPopup(true);
  const handleClosePopup = () => setShowPopup(false);

  return (
    <section className="opening-section">
      <h2>Recent Job Openings</h2>

      <div className="opening-grid">

        {jobs.map((job) => (

          <div key={job.id} className="job-card">

            <div className="job-header">
              <h3>{job.title}</h3>
              <span className="job-type">Full Time</span>
            </div>

            <p className="job-location">{job.location}</p>

            <p className="job-salary">
              INR {job.pay} / Month
            </p>

            <button
              className="apply-btn"
              onClick={handleOpenPopup}
            >
              Apply Now
            </button>

          </div>

        ))}

        {showPopup && (
          <Popup onClose={handleClosePopup} />
        )}

      </div>

    </section>
  );
};

export default Opening;
