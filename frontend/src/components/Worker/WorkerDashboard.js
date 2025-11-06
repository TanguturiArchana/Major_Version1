import React from "react";
import "./WorkerDashboard.css";

const WorkerDashboard = ({ username }) => {
  const jobPosts = [
    {
      id: 1,
      title: "Need A Plumber",
      location:
        "#3 1st Main Kalidasa Layout Kattigenahalli, Yelahanka, Bangalore",
      link: "https://www.blujobs.in",
      salary: "INR 15,000 / Month",
      type: "Full Time",
      posted: "2 hours ago",
      by:"Rahul"
    },
    {
      id: 2,
      title: "Need A House Keeping Staff",
      location:
        "#3 1st Main Kalidasa Layout Kattigenahalli, Yelahanka, Bangalore",
      link: "https://www.blujobs.in",
      salary: "INR 30,000 / Month",
      type: "Full Time",
      posted: "4 hours ago",
      by:"Rohit"
    },
  ];

  return (
    <div className="dashboard-container">
      <header className="dashboard-navbar">
        <h2 className="dashboard-logo">ShramSaathi</h2>
        <div className="dashboard-actions">
          <button className="nav-btn">Applied Jobs</button>
          <input type="text" placeholder="Search jobs..." className="search-bar" />
          <span className="icon">🔔</span>
          <span className="icon">👤 {username}</span>
        </div>
      </header>

      <main className="dashboard-main">
        <h3>Recent Job Openings</h3>
        <div className="job-list">
          {jobPosts.map((job) => (
            <div key={job.id} className="job-card">
              <div className="job-header">
                <h4>{job.title}</h4>
                <span className="job-type">{job.type}</span>
              </div>
              <p className="job-location">{job.location}</p>
              <a href={job.link} target="_blank" rel="noopener noreferrer">
                {job.link}
              </a>
              <p className="job-salary">{job.salary}</p>
              <p className="job-posted">Posted {job.posted}</p>
              <p className="job-salary">by {job.by}</p>
              <button className="btn-primary">Apply Now</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default WorkerDashboard;
