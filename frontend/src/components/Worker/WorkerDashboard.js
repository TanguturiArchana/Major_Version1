import axios from "axios";
import { useEffect, useState } from "react";
import { connect as wsConnect, disconnect as wsDisconnect, send as wsSend, subscribe as wsSubscribe } from "../../services/socketService";
import ChatModal from "./ChatModal";
import RouteMap from "./RouteMap";
import "./WorkerDashboard.css";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/environment";
import WorkerNotifications from "./WorkerNotifications";
import WorkerSkillTest from "./WorkerSkillTest";
import API from "../../services/api";

const API_BASE = API_BASE_URL;

const WorkerDashboard = () => {
   const location = useLocation();
    const navigate = useNavigate();
    const [workerId, setWorkerId] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
  const [workerProfile, setWorkerProfile] = useState({
      name: "",
      skill: "",
      workType: "",
      location: "",
      contact: "",
      area: "",
      colony: "",
    state: "",
    pincode: "",
    age: "",
    experienceYears: "",
  });

  const [activeTab, setActiveTab] = useState("jobs");
  const [, setAppliedJobs] = useState(new Set());
  const [message, setMessage] = useState("");
  const [chatApplication, setChatApplication] = useState(null);
  const [routeTarget, setRouteTarget] = useState(null); // [lat, lng]
  const [showRoute, setShowRoute] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeOrigin, setRouteOrigin] = useState(null);
  const [routeOriginInfo, setRouteOriginInfo] = useState(null);
  const [routeDestInfo, setRouteDestInfo] = useState(null);
  const [routeKey, setRouteKey] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [watchId, setWatchId] = useState(null);
  
  // Real-time engagement features
  const [jobLikes, setJobLikes] = useState({});
  const [jobLikeCounts, setJobLikeCounts] = useState({});
  const [jobComments, setJobComments] = useState({});
  const [newJobComment, setNewJobComment] = useState({});
  const [expandedJobComments, setExpandedJobComments] = useState({});

  const extractApiErrorMessage = (err) => {
    const data = err?.response?.data;
    if (typeof data === "string") return data;
    if (typeof data?.message === "string") return data.message;
    return "";
  };
  
useEffect(() => {
  if (location.state) {
    // store in localStorage only once
    localStorage.setItem("workerState", JSON.stringify(location.state));
    const nextId = Number(location.state.id);
    setWorkerId(Number.isFinite(nextId) ? nextId : null);
  }
}, [location.state]);

const state = location.state || JSON.parse(localStorage.getItem("workerState"));

useEffect(() => {
  if (!workerId && state?.id) {
    const nextId = Number(state.id);
    setWorkerId(Number.isFinite(nextId) ? nextId : null);
  }
}, [workerId, state]);

useEffect(() => {
  if (!workerId) return;
  axios
    .get(`${API_BASE}/users/${workerId}`)
    .then((res) => {
      const profile = res.data || {};
      setWorkerProfile({
        name: profile.name || "",
        skill: profile.skill || profile.workType || "",
        workType: profile.workType || profile.skill || "",
        location: profile.address || profile.location || "",
        contact: profile.phone || profile.contact || "",
        area: profile.area || "",
        colony: profile.colony || "",
        state: profile.state || "",
        pincode: profile.pincode || "",
        age: profile.age || "",
        experienceYears: profile.experienceYears || profile.experience || "",
      });
    })
    .catch((err) => {
      console.error("Failed to load worker profile:", err);
    });
}, [workerId]);

useEffect(() => {
  if (!state) {
    navigate("/");
  }
}, [state, navigate]);



  const geocodeLocation = async ({ area, colony, state, pincode, text }) => {
    const base = "https://nominatim.openstreetmap.org/search";
    const cleanP = pincode ? String(pincode).trim() : "";

    const queries = [];
    // prefer most specific: area + colony + pincode + state
    if (area || colony || cleanP || state) {
      let parts = [];
      if (area) parts.push(area);
      if (colony) parts.push(colony);
      if (cleanP) parts.push(cleanP);
      if (state) parts.push(state);
      parts.push("India");
      queries.push(parts.filter(Boolean).join(", "));
    }

    // pincode + India
    if (cleanP) queries.push(`${cleanP}, India`);

    // free text fallback
    if (text) queries.push(`${text} India`);

    // last resort: just the pincode (no country)
    if (cleanP) queries.push(cleanP);

    try {
      for (const q of queries) {
        const params = { format: "json", limit: 1, addressdetails: 1, q, countrycodes: "in" };
        const res = await axios.get(base, { params });
        if (res.data && res.data.length > 0) {
          const r = res.data[0];
          const lat = parseFloat(r.lat);
          const lon = parseFloat(r.lon);
          // Validate result lies roughly within India bounding box
          if (lat >= 6 && lat <= 38 && lon >= 68 && lon <= 98) {
            return [lat, lon];
          }
          // if address country_code present, prefer only India
          if (r.address && r.address.country_code && r.address.country_code.toLowerCase() === "in") {
            return [lat, lon];
          }
          // otherwise continue to next query
        }
      }
      return null;
    } catch (err) {
      console.error("Geocode error", err);
      return null;
    }
  };

  //  Fetch all jobs and enrich with owner information
  const fetchJobs = async () => {
    try {
      const jobsRes = await API.get(`/jobs`);

      // If workerId is known, fetch applications for this worker; otherwise assume none
      let applicationsRes = { data: [] };
      if (workerId) {
        try {
          applicationsRes = await API.get(`/applications/worker/${workerId}`);
        } catch (e) {
          console.warn('Failed to fetch worker applications (will assume none):', e);
          applicationsRes = { data: [] };
        }
      }

      // Mark which jobs worker has already applied to
      const appliedIds = new Set((applicationsRes.data || []).map(app => app.jobId));
      setAppliedJobs(appliedIds);

      // Enrich jobs with application status
      const enrichedJobs = jobsRes.data.map(job => ({
        ...job,
        alreadyApplied: appliedIds.has(job.id),
        applicationStatus: applicationsRes.data.find(app => app.jobId === job.id)?.status || null
      }));

      setJobs(enrichedJobs);
      await fetchEngagementForJobs(enrichedJobs.map((job) => job.id));
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setMessage('⚠️ Failed to load jobs. Please try again.');
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const applyEngagementSnapshot = (snapshot) => {
    if (!snapshot || !snapshot.jobId) return;
    if (snapshot.likedByCurrentWorker !== null && snapshot.likedByCurrentWorker !== undefined) {
      setJobLikes((prev) => ({ ...prev, [snapshot.jobId]: !!snapshot.likedByCurrentWorker }));
    }
    setJobLikeCounts((prev) => ({ ...prev, [snapshot.jobId]: snapshot.likeCount || 0 }));
    setJobComments((prev) => ({ ...prev, [snapshot.jobId]: snapshot.comments || [] }));
  };

  const fetchEngagementForJobs = async (jobIds) => {
    if (!jobIds || jobIds.length === 0) return;
    try {
      const responses = await Promise.all(
        jobIds.map((jobId) =>
          API.get(`/engagement/jobs/${jobId}`, {
            params: { workerId },
          })
        )
      );
      responses.forEach((res) => applyEngagementSnapshot(res.data));
    } catch (err) {
      console.error("Failed to fetch engagement snapshots:", err);
    }
  };

  useEffect(() => {
    if (!workerId) return;
    fetchJobs();
    try { wsConnect(); } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerId]);

  // Fetch worker applications with full owner information
  const fetchApplications = async () => {
    try {
      const [applicationsRes, jobsRes] = await Promise.all([
        API.get(`/applications/worker/${workerId}`),
        API.get(`/jobs`)
      ]);
      
      // Create a lookup of jobs by ID for efficient access
      const jobsById = {};
      jobsRes.data.forEach(job => {
        jobsById[job.id] = job;
      });

      // Combine application data with complete job and owner data
      const enrichedApplications = applicationsRes.data.map(app => {
        const relatedJob = jobsById[app.jobId] || {};
        return {
          ...app,
          jobTitle: relatedJob.title || `Job #${app.jobId}`,
          location: relatedJob.location || app.location || 'Unknown Location',
          pay: relatedJob.pay || app.pay || 'Pay not specified',
          // Complete owner information from the job
          ownerId: relatedJob.ownerId,
          ownerName: relatedJob.ownerName,
          ownerPincode: relatedJob.pincode,
          ownerArea: relatedJob.area,
          ownerColony: relatedJob.colony,
          ownerState: relatedJob.state
        };
      });

      console.log("Enriched Applications with owner info:", enrichedApplications); // For debugging
      setApplications(enrichedApplications);

      // Update applied jobs set
      const appliedIds = new Set(enrichedApplications.map((app) => app.jobId));
      setAppliedJobs(appliedIds);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setMessage('Failed to load applications. Please try again.');
    }
  };

  useEffect(() => {
    if (activeTab === "applications") {
      fetchApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Apply for a job (protected against duplicates)
  const handleApply = async (job) => {
    try {
      
      const response = await API.post(`/applications`, {
        jobId: job.id,
        workerId,
        workerName: workerProfile.name || state?.name || `Worker ${workerId}`,
        workerSkill: workerProfile.workType || workerProfile.skill || "General",
        status: "pending",
      });

      // Debug: log server response for apply action
      console.log('POST /api/applications response:', response && response.data ? response.data : response);

      setMessage(response.data.message || "✅ Applied successfully!");
      setAppliedJobs((prev) => new Set(prev.add(job.id)));
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setMessage("⚠️ You’ve already applied for this job.");
      } else {
        setMessage("❌ Failed to apply. Try again.");
      }
    }

    setTimeout(() => setMessage(""), 3000);
  };

  // Like/Comment handlers
  const toggleJobLike = (jobId) => {
    if (!workerId) {
      setMessage("Please login again to like jobs.");
      setTimeout(() => setMessage(""), 2500);
      return;
    }
    const payload = {
      workerId,
      workerName: workerProfile.name || `Worker ${workerId}`,
    };

    API.post(`/engagement/jobs/${jobId}/likes`, payload)
      .then((res) => applyEngagementSnapshot(res.data))
      .catch((err) => {
        const firstError = extractApiErrorMessage(err);
        const missingEndpoint = firstError.toLowerCase().includes("no static resource");

        if (missingEndpoint) {
          API.post(`/engagement/jobs/${jobId}/like`, payload)
            .then((res) => applyEngagementSnapshot(res.data))
            .catch((fallbackErr) => {
              console.error("Like toggle failed (fallback):", fallbackErr);
              setMessage("Backend build is stale. Restart backend and retry likes/comments.");
              setTimeout(() => setMessage(""), 3500);
            });
          return;
        }

        console.error("Like toggle failed:", err);
        setMessage(firstError || "Failed to update like. Please try again.");
        setTimeout(() => setMessage(""), 2500);
      });
  };

  const addJobComment = (jobId) => {
    if (!newJobComment[jobId]?.trim()) return;
    if (!workerId) {
      setMessage("Please login again to comment.");
      setTimeout(() => setMessage(""), 2500);
      return;
    }

    const payload = {
      workerId,
      workerName: workerProfile.name || `Worker ${workerId}`,
      comment: newJobComment[jobId],
    };

    API.post(`/engagement/jobs/${jobId}/comments`, payload)
      .then((res) => applyEngagementSnapshot(res.data))
      .catch((err) => {
        const firstError = extractApiErrorMessage(err);
        const missingEndpoint = firstError.toLowerCase().includes("no static resource");

        if (missingEndpoint) {
          API.post(`/engagement/jobs/${jobId}/comment`, payload)
            .then((res) => applyEngagementSnapshot(res.data))
            .catch((fallbackErr) => {
              console.error("Add comment failed (fallback):", fallbackErr);
              setMessage("Backend build is stale. Restart backend and retry likes/comments.");
              setTimeout(() => setMessage(""), 3500);
            });
          return;
        }

        console.error("Add comment failed:", err);
        setMessage(firstError || "Failed to post comment. Please try again.");
        setTimeout(() => setMessage(""), 2500);
      });

    setNewJobComment((prev) => ({
      ...prev,
      [jobId]: "",
    }));
  };

  const deleteJobComment = (jobId, commentId) => {
    if (!workerId) {
      setMessage("Please login again to delete comments.");
      setTimeout(() => setMessage(""), 2500);
      return;
    }
    API
      .delete(`/engagement/comments/${commentId}`, {
        params: { workerId },
      })
      .then((res) => applyEngagementSnapshot(res.data))
      .catch((err) => {
        console.error("Delete comment failed:", err);
        setMessage("Failed to delete comment.");
        setTimeout(() => setMessage(""), 2500);
      });
  };

  
  // Start sharing worker's browser geolocation to the backend via STOMP
  // eslint-disable-next-line no-unused-vars
  const startSharingLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }
    if (isSharing) return;
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        // publish to backend
        wsSend(`/app/location/${workerId}`, { workerId, lat, lon, timestamp: Date.now() });
      },
      (err) => console.error('geo error', err),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    setWatchId(id);
    setIsSharing(true);
  };

  // eslint-disable-next-line no-unused-vars
  const stopSharingLocation = () => {
    if (watchId != null) navigator.geolocation.clearWatch(watchId);
    setWatchId(null);
    setIsSharing(false);
    try { wsDisconnect(); } catch (e) {}
  };

  // Subscribe to real-time location topic for this worker (updates can come from other clients)
  useEffect(() => {
    const sub = wsSubscribe(`/topic/location/${workerId}`, (msg) => {
      try {
        const body = msg; // socketService already JSON-parses
        if (body && body.lat && body.lon) {
          setRouteOrigin([body.lat, body.lon]);
          // if showing route, update key to force remount
          setRouteKey(Date.now());
        }
      } catch (e) {}
    });
    return () => { if (sub) sub.unsubscribe(); };
  }, [workerId]);

  useEffect(() => {
    if (!jobs.length) return undefined;
    const subs = jobs.map((job) =>
      wsSubscribe(`/topic/engagement/job/${job.id}`, (snapshot) => {
        applyEngagementSnapshot(snapshot);
      })
    );

    return () => {
      subs.forEach((sub) => sub && sub.unsubscribe && sub.unsubscribe());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs.map((job) => job.id).join(",")]);

  return (
    <div className="worker-dashboard">
      <header className="worker-header">
        <h1>👷 Worker Dashboard</h1>
        <p>Find jobs, apply, and manage your profile easily</p>
      </header>

      {/* Feedback Message */}
      {message && <div className="alert-msg">{message}</div>}

      {/* Navigation Tabs */}
      <div className="tabs">
        <button
          className={activeTab === "jobs" ? "tab active" : "tab"}
          onClick={() => setActiveTab("jobs")}
        >
          🔍 Available Jobs
        </button>
        <button
          className={activeTab === "applications" ? "tab active" : "tab"}
          onClick={() => setActiveTab("applications")}
        >
          📄 My Applications
        </button>
        <button
          className={activeTab === "skills" ? "tab active" : "tab"}
          onClick={() => setActiveTab("skills")}
        >
          🧠 Skill Test
        </button>
        <button
          className={activeTab === "notifications" ? "tab active" : "tab"}
          onClick={() => setActiveTab("notifications")}
        >
          🔔 Notifications
        </button>
      <button
      className={activeTab === "profile" ? "tab active" : "tab"}
      onClick={() => navigate("/WorkerProfile", { state: { id: workerId } })}>
      👤 My Profile
      </button>

      </div>

      {/* JOBS TAB */}
      {activeTab === "jobs" && (
        <div className="jobs-container">
          {!workerProfile.workType && !workerProfile.skill && (
            <div className="alert-msg" style={{ marginBottom: "1rem" }}>
              Complete your skill test to get a verified trust badge and improve acceptance chances.
              <button
                style={{ marginLeft: 10 }}
                className="send-comment-btn"
                onClick={() => setActiveTab("skills")}
              >
                Take Skill Test
              </button>
            </div>
          )}
          {jobs.length === 0 ? (
            <p className="empty-msg">No jobs available right now.</p>
          ) : (
            <div className="jobs-grid">
              {jobs.map((job) => (
                <div key={job.id} className="job-card">
                  {/* Card Header */}
                  <div className="job-card-header">
                    <div className="job-title-section">
                      <h3 className="job-title">{job.title}</h3>
                      <p className="job-skill">
                        <span className="skill-badge">🛠️ {job.skillNeeded}</span>
                      </p>
                    </div>
                    <span className={`job-status ${job.alreadyApplied ? "applied" : "available"}`}>
                      {job.alreadyApplied ? `✅ ${job.applicationStatus || "Applied"}` : "🆕 Available"}
                    </span>
                  </div>

                  {/* Card Location & Details */}
                  <div className="job-card-details">
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <div className="detail-content">
                        <strong>Location</strong>
                        <p>{job.location}</p>
                        {job.area && <small>Area: {job.area}</small>}
                        {job.colony && <small> • Colony: {job.colony}</small>}
                      </div>
                    </div>
                    
                    <div className="detail-row">
                      <div className="detail-item-inline">
                        <span className="detail-icon">💰</span>
                        <strong>₹{job.pay}</strong>
                      </div>
                      <div className="detail-item-inline">
                        <span className="detail-icon">⏱️</span>
                        <strong>{job.duration} days</strong>
                      </div>
                    </div>
                  </div>

                  {/* Engagement Section */}
                  <div className="job-engagement">
                    <button 
                      className={`like-btn ${jobLikes[job.id] ? 'liked' : ''}`}
                      onClick={() => toggleJobLike(job.id)}
                      title="Like this job"
                    >
                      {jobLikes[job.id] ? '❤️' : '🤍'} {jobLikeCounts[job.id] || 0}
                    </button>
                    
                    <button 
                      className="comments-toggle-btn"
                      onClick={() => setExpandedJobComments(prev => ({...prev, [job.id]: !prev[job.id]}))}
                      title="View comments"
                    >
                      💬 {jobComments[job.id]?.length || 0} Comments
                    </button>
                  </div>

                  {/* Comments Section */}
                  {expandedJobComments[job.id] && (
                    <div className="comments-section">
                      <div className="comments-list">
                        {jobComments[job.id]?.length ? (
                          jobComments[job.id].map(comment => (
                            <div key={comment.id} className="comment-item">
                              <div className="comment-header">
                                <span className="comment-time">
                                  {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}
                                </span>
                                <button 
                                  className="delete-comment-btn"
                                  onClick={() => deleteJobComment(job.id, comment.id)}
                                  title="Delete comment"
                                >
                                  ✕
                                </button>
                              </div>
                              <p className="comment-text">{comment.comment}</p>
                            </div>
                          ))
                        ) : (
                          <p className="no-comments">No comments yet. Be the first!</p>
                        )}
                      </div>
                      <div className="comment-input-wrapper">
                        <input
                          type="text"
                          placeholder="Share your thoughts about this job..."
                          className="comment-input"
                          value={newJobComment[job.id] || ''}
                          onChange={(e) => setNewJobComment(prev => ({...prev, [job.id]: e.target.value}))}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') addJobComment(job.id);
                          }}
                        />
                        <button 
                          className="send-comment-btn"
                          onClick={() => addJobComment(job.id)}
                          disabled={!newJobComment[job.id]?.trim()}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="job-card-actions">
                    {job.alreadyApplied ? (
                      <button className="applied-btn" disabled>
                        ✅ Already Applied
                      </button>
                    ) : (
                      <button
                        className="apply-btn"
                        onClick={() => handleApply(job)}
                      >
                        Apply Now →
                      </button>
                    )}
                    
                    <button
                      className="route-btn"
                      onClick={async () => {
                        const ownerPcode = job.pincode || job.postalCode || job.zip || job.postalcode;
                        let destCoords = null;
                        try {
                          setRouteLoading(true);
                          if (ownerPcode) destCoords = await geocodeLocation({ area: job.area, colony: job.colony, state: job.state, pincode: ownerPcode, text: job.location });
                          else {
                            const entered = window.prompt("Enter owner pincode / postal code (e.g. 500081)");
                            if (entered) destCoords = await geocodeLocation({ pincode: entered, text: entered });
                          }

                          if (!destCoords) {
                            const fallbackDest = [job.location, job.area, job.colony, job.state, ownerPcode]
                              .filter(Boolean)
                              .join(", ");
                            const fallbackOrigin = [workerProfile.location, workerProfile.area, workerProfile.colony, workerProfile.state, workerProfile.pincode]
                              .filter(Boolean)
                              .join(", ");
                            const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                              fallbackOrigin || "Current Location"
                            )}&destination=${encodeURIComponent(fallbackDest || "Owner Location")}`;
                            window.open(mapsUrl, "_blank", "noopener,noreferrer");
                            return;
                          }

                          const workerPcode = workerProfile.pincode || window.prompt("Enter your pincode (worker)");
                          if (!workerPcode) {
                            alert("Worker pincode required to show route.");
                            return;
                          }

                          const originCoords = await geocodeLocation({ area: workerProfile.area, colony: workerProfile.colony, state: workerProfile.state, pincode: workerPcode, text: workerProfile.location });
                          if (!originCoords) {
                            alert("Could not resolve your pincode to coordinates.");
                            return;
                          }

                          setRouteOrigin(originCoords);
                          setRouteTarget(destCoords);
                          setRouteKey(Date.now());
                          setRouteOriginInfo({
                            area: workerProfile.area || "",
                            colony: workerProfile.colony || "",
                            state: workerProfile.state || "",
                            pincode: workerPcode,
                          });
                          setRouteDestInfo({
                            area: job.area || "",
                            colony: job.colony || "",
                            state: job.state || "",
                            pincode: ownerPcode,
                          });
                          setShowRoute(true);
                        } finally {
                          setRouteLoading(false);
                        }
                      }}
                    >
                      {routeLoading ? "Loading…" : "🗺️ Route"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* APPLICATIONS TAB */}
      {activeTab === "applications" && (
        <div className="applications-container">
          {applications.length === 0 ? (
            <p className="empty-msg">You haven’t applied for any jobs yet.</p>
          ) : (
            <table className="applications-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Location</th>
                  <th>Pay</th>
                  <th>Status</th>
                  <th>Applied On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>{app.jobTitle || `Job #${app.jobId}`}</td>
                    <td>{app.location}</td>
                    <td>{app.pay}</td>
                    <td>
                      <span
                        className={`status ${
                          app.status.toLowerCase() === "accepted"
                            ? "accepted"
                            : app.status.toLowerCase() === "rejected"
                            ? "rejected"
                            : "pending"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td>{new Date(app.appliedAt).toLocaleDateString()}</td>
                    <td>
                      {app.status && app.status.toLowerCase() === "accepted" && (
                        <div className="action-buttons">
                          <button
                            className="chat-btn"
                            onClick={() => {
                              console.log("Opening chat for application:", app); // For debugging
                              if (!app.ownerId) {
                                setMessage("⚠️ Unable to start chat - This job's owner information is not available");
                                setTimeout(() => setMessage(""), 3000);
                                return;
                              }
                              setChatApplication(app);
                            }}
                            title={app.ownerId ? "Click to chat with job owner" : "Owner information not available"}
                          >
                            {app.ownerId ? "💬 Chat with Owner" : "⚠️ Chat Unavailable"}
                          </button>
                          <button
                            className="route-btn"
                            style={{ marginLeft: 8 }}
                              onClick={async () => {
                                const pcode = app.ownerPincode || app.ownerPostalCode || app.ownerZip || app.pincode || app.postalCode;
                                let destCoords = null;
                                try {
                                  setRouteLoading(true);
                                  if (pcode) destCoords = await geocodeLocation({ area: app.ownerArea || app.area, colony: app.ownerColony || app.colony, state: app.ownerState || app.state, pincode: pcode, text: app.location || app.jobTitle });
                                  else {
                                    const entered = window.prompt("Enter owner pincode / postal code (e.g. 500081)");
                                    if (entered) destCoords = await geocodeLocation({ pincode: entered, text: entered });
                                  }

                                  if (!destCoords) {
                                    const fallbackDest = [app.location, app.ownerArea, app.ownerColony, app.ownerState, pcode]
                                      .filter(Boolean)
                                      .join(", ");
                                    const fallbackOrigin = [workerProfile.location, workerProfile.area, workerProfile.colony, workerProfile.state, workerProfile.pincode]
                                      .filter(Boolean)
                                      .join(", ");
                                    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
                                      fallbackOrigin || "Current Location"
                                    )}&destination=${encodeURIComponent(fallbackDest || "Owner Location")}`;
                                    window.open(mapsUrl, "_blank", "noopener,noreferrer");
                                    return;
                                  }

                                  const workerPcode = workerProfile.pincode || window.prompt("Enter your pincode (worker)");
                                  if (!workerPcode) {
                                    alert("Worker pincode required to show route.");
                                    return;
                                  }

                                  const originCoords = await geocodeLocation({ area: workerProfile.area, colony: workerProfile.colony, state: workerProfile.state, pincode: workerPcode, text: workerProfile.location });
                                  if (!originCoords) {
                                    alert("Could not resolve your pincode to coordinates.");
                                    return;
                                  }

                                  setRouteOrigin(originCoords);
                                  setRouteTarget(destCoords);
                                  // force RouteMap remount so previous maps don't linger
                                  setRouteKey(Date.now());
                                  setRouteOriginInfo({
                                    area: workerProfile.area || "",
                                    colony: workerProfile.colony || "",
                                    state: workerProfile.state || "",
                                    pincode: workerPcode,
                                  });
                                  setRouteDestInfo({
                                    area: app.ownerArea || app.area || "",
                                    colony: app.ownerColony || app.colony || "",
                                    state: app.ownerState || app.state || "",
                                    pincode: pcode,
                                  });
                                  setShowRoute(true);
                                } finally {
                                  setRouteLoading(false);
                                }
                              }}
                          >
                            🗺️ Route to Owner
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === "skills" && (
        <WorkerSkillTest
          workerId={workerId}
          defaultSkill={workerProfile.workType || workerProfile.skill || "general"}
        />
      )}

      {activeTab === "notifications" && <WorkerNotifications workerId={workerId} />}

      {/* CHAT MODAL */}
      {chatApplication && (
        <ChatModal
          applicationId={chatApplication.id}
          workerId={workerId}
          ownerId={chatApplication.ownerId}
          onClose={() => setChatApplication(null)}
        />
      )}

      {/* Route overlay/sidebar */}
      {showRoute && routeTarget && (
        <div className="route-overlay">
          <div className="route-content">
            <RouteMap
              key={routeKey || `${(routeOrigin||[17.385,78.4867]).join(',')}_${(routeTarget||[0,0]).join(',')}`}
              origin={routeOrigin || [17.385, 78.4867]}
              destination={routeTarget}
              originInfo={routeOriginInfo}
              destinationInfo={routeDestInfo}
              onClose={() => setShowRoute(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
