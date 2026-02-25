import React, { useState, useEffect } from "react";
import "./Opening.css";
import Popup from "./Popup";
import { API_BASE_URL } from "../../config/environment";

const skillImageMap = {
  carpentry:
    "https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=1200",
  electrician:
    "https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=1200",
  plumbing:
    "https://images.pexels.com/photos/5691642/pexels-photo-5691642.jpeg?auto=compress&cs=tinysrgb&w=1200",
  building:
    "https://images.pexels.com/photos/834892/pexels-photo-834892.jpeg?auto=compress&cs=tinysrgb&w=1200",
  default:
    "https://images.pexels.com/photos/162539/architecture-building-amsterdam-blue-sky-162539.jpeg?auto=compress&cs=tinysrgb&w=1200",
};

const Opening = () => {
  const [jobs, setJobs] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [expandedComments, setExpandedComments] = useState({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/jobs/recent`)
      .then(res => res.json())
      .then(data => setJobs(data))
      .catch(err => console.error(err));
  }, []);

  const handleOpenPopup = () => setShowPopup(true);
  const handleClosePopup = () => setShowPopup(false);

  const toggleLike = (jobId) => {
    setLikes(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  };

  const addComment = (jobId) => {
    if (!newComment[jobId]?.trim()) return;
    
    setComments(prev => ({
      ...prev,
      [jobId]: [
        ...(prev[jobId] || []),
        {
          id: Date.now(),
          text: newComment[jobId],
          timestamp: new Date().toLocaleTimeString()
        }
      ]
    }));
    
    setNewComment(prev => ({
      ...prev,
      [jobId]: ""
    }));
  };

  const deleteComment = (jobId, commentId) => {
    setComments(prev => ({
      ...prev,
      [jobId]: prev[jobId].filter(c => c.id !== commentId)
    }));
  };

  const shareJob = (job) => {
    const text = `Check out this amazing job opportunity: ${job.title} at INR ${job.pay}/Month on ShramSaathi! 🚀`;
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: text
      });
    } else {
      alert(`Share: ${text}`);
    }
  };

  return (
    <section className="opening-section">
      <div className="opening-header">
        <h2 className="opening-title">Recent Job Openings</h2>
        <p className="opening-subtitle">Live opportunities posted by owners across your area</p>
      </div>

      <div className="opening-grid">
        {jobs.map((job) => (
          <div key={job.id} className="modern-job-card">
            <div className="job-cover">
              <img
                src={skillImageMap[(job.skillNeeded || "").toLowerCase()] || skillImageMap.default}
                alt={job.title}
              />
              <span className="job-type">Live Hiring</span>
            </div>

            {/* Card Header */}
            <div className="job-card-header">
              <div className="job-title-section">
                <h3 className="job-title">{job.title}</h3>
                <span className="job-skill-chip">{job.skillNeeded || "General Work"}</span>
              </div>
            </div>

            {/* Job Details */}
            <div className="job-details-section">
              <div className="detail-item">
                <span className="detail-icon">📍</span>
                <span className="detail-text">{job.location}</span>
              </div>
              <div className="detail-item">
                <span className="detail-icon">💰</span>
                <span className="detail-text">INR {job.pay} / Month</span>
              </div>
            </div>

            {/* Engagement Section */}
            <div className="engagement-bar">
              <button 
                className={`engagement-btn like-btn ${likes[job.id] ? 'active' : ''}`}
                onClick={() => toggleLike(job.id)}
                title="Like this job"
              >
                {likes[job.id] ? '❤️' : '🤍'} Interest
              </button>
              
              <button 
                className="engagement-btn comment-btn"
                onClick={() => setExpandedComments(prev => ({...prev, [job.id]: !prev[job.id]}))}
                title="Comment"
              >
                💬 {comments[job.id]?.length || 0}
              </button>

              <button 
                className="engagement-btn share-btn"
                onClick={() => shareJob(job)}
                title="Share this job"
              >
                🔗 Share
              </button>
            </div>

            {/* Comments Section */}
            {expandedComments[job.id] && (
              <div className="comments-section-card">
                <div className="comments-list-card">
                  {comments[job.id]?.length ? (
                    comments[job.id].map(comment => (
                      <div key={comment.id} className="comment-item-card">
                        <div className="comment-header-card">
                          <span className="comment-time-card">{comment.timestamp}</span>
                          <button 
                            className="delete-btn-card"
                            onClick={() => deleteComment(job.id, comment.id)}
                          >
                            ✕
                          </button>
                        </div>
                        <p className="comment-text-card">{comment.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="no-comments-card">No comments yet. Be the first!</p>
                  )}
                </div>
                <div className="comment-input-card">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="comment-input-field"
                    value={newComment[job.id] || ''}
                    onChange={(e) => setNewComment(prev => ({...prev, [job.id]: e.target.value}))}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') addComment(job.id);
                    }}
                  />
                  <button 
                    className="send-btn-card"
                    onClick={() => addComment(job.id)}
                    disabled={!newComment[job.id]?.trim()}
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* Apply Button */}
            <button
              className="apply-btn-modern"
              onClick={handleOpenPopup}
            >
              View & Apply
            </button>
          </div>
        ))}
      </div>

      {showPopup && (
        <Popup onClose={handleClosePopup} />
      )}
    </section>
  );
};

export default Opening;
