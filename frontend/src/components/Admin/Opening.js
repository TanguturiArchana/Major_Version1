import React,{useState} from "react";
import "./Opening.css"; 
import Popup from "./Popup";

const Opening = () => {
  const jobs = [
    {
      id: 1,
      title: "Need A Plumber",
      location:
        "#3 1st Main Kalidasa Layout Kattigenahalli, Begaluru Main Road, Yelahanka, Bangalore",
      salary: "INR 15,000 / Month",
      type: "Full Time",
      website: "www.blujobs.in",
    },
    {
      id: 2,
      title: "Need A House Keeping Staff",
      location:
        "#3 1st Main Kalidasa Layout Kattigenahalli, Begaluru Main Road, Yelahanka, Bangalore",
      salary: "INR 30,000 / Month",
      type: "Full Time",
      website: "www.blujobs.in",
    },
  ];
   const [showPopup, setShowPopup] = useState(false);
  
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
              <span className="job-type">{job.type}</span>
            </div>
            <p className="job-location">{job.location}</p>
            <a href={`https://${job.website}`} className="job-link">
              {job.website}
            </a>
            <p className="job-salary">{job.salary}</p>
            <button className="apply-btn" onClick={handleOpenPopup}>Apply Now</button>
          </div>
          
        ))}
         {showPopup && (
        <Popup
          onClose={handleClosePopup}

        />
      )}
      </div>
    </section>
  );
};

export default Opening;
