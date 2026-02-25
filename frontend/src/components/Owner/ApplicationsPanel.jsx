import axios from "axios";
import { useEffect, useState } from "react";
import "./ApplicationsPanel.css";
import Chat from "./Chat";
import { useOutletContext } from "react-router-dom";
import { API_BASE_URL } from "../../config/environment";

const API_BASE = API_BASE_URL;


const ApplicationsPanel = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const state = useOutletContext();
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [minExperience, setMinExperience] = useState("");
  const [maxExperience, setMaxExperience] = useState("");
  const [filterPincode, setFilterPincode] = useState("");
  const [showAll, setShowAll] = useState(false); 
  const [showDebug, setShowDebug] = useState(false); 
  const [openProfileIds, setOpenProfileIds] = useState({});
  const [openChatFor, setOpenChatFor] = useState(null);
  const [appliedMinAge, setAppliedMinAge] = useState(null);
  const [appliedMaxAge, setAppliedMaxAge] = useState(null);
  const [appliedMinExperience, setAppliedMinExperience] = useState(null);
  const [appliedMaxExperience, setAppliedMaxExperience] = useState(null);
  const [appliedFilterPincode, setAppliedFilterPincode] = useState("");
  const [message, setMessage] = useState("");
  const [likes, setLikes] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [expandedComments, setExpandedComments] = useState({}); 
  const [skillProfilesByWorker, setSkillProfilesByWorker] = useState({});
  const [engagementByJob, setEngagementByJob] = useState({});

  useEffect(() => {
    if (!state?.id) return;
    const fetchJobs = async () => {
      try {
       const res = await axios.get(`${API_BASE}/jobs/owner/${state.id}`); 
        const jobsData = res.data;

        const jobsWithCounts = await Promise.all(
          jobsData.map(async (job) => {
            try {
              const appRes = await axios.get(`${API_BASE}/applications/job/${job.id}`);
              return { ...job, applicationCount: appRes.data.length };
            } catch {
              return { ...job, applicationCount: 0 };
            }
          })
        );

        setJobs(jobsWithCounts);
        if (jobsWithCounts.length > 0) setSelectedJobId(jobsWithCounts[0].id);
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };
    fetchJobs();
  }, [state?.id]);
const fetchApplications = async () => {
  if (!selectedJobId) return;

  setLoading(true);
  try {
    const [res, ownerEngagementRes] = await Promise.all([
      axios.get(`${API_BASE}/applications/job/${selectedJobId}`),
      state?.id ? axios.get(`${API_BASE}/engagement/owners/${state.id}`) : Promise.resolve({ data: [] }),
    ]);
    const apps = res.data || [];
    const engagementMap = {};
    (ownerEngagementRes.data || []).forEach((card) => {
      engagementMap[String(card.jobId)] = card;
    });
    setEngagementByJob(engagementMap);
    const workerIds = [...new Set(apps.map((a) => a.workerId).filter(Boolean))];
    const workersById = {};

    if (workerIds.length > 0) {
      const workerResponses = await Promise.all(
        workerIds.map(async (id) => {
          try {
            const response = await axios.get(`${API_BASE}/users/${id}`);
            console.log(`Fetched worker ${id}:`, response.data); 
            return { id: String(id), data: response.data }; 
          } catch (e) {
            console.error(`Failed to load user ${id}:`, e);
            return { id: String(id), data: null };
          }
        })
      );

      workerResponses.forEach((wr) => {
        if (wr && wr.id && wr.data) {
          workersById[wr.id] = wr.data;
          console.log(`Stored worker ${wr.id} in workersById:`, wr.data); 
        }
      });

      const skillResponses = await Promise.all(
        workerIds.map(async (id) => {
          try {
            const response = await axios.get(`${API_BASE}/skill-tests/worker/${id}`);
            return { id: String(id), data: response.data || [] };
          } catch (e) {
            return { id: String(id), data: [] };
          }
        })
      );
      const map = {};
      skillResponses.forEach((sr) => {
        map[sr.id] = sr.data;
      });
      setSkillProfilesByWorker(map);
    }

    const enriched = apps.map((app) => {
      const workerKey = String(app.workerId);
      const profile = workersById[workerKey] || null;
      console.log(`Enriching application for worker ${workerKey}:`, profile);
      return { ...app, workerProfile: profile };
    });

    setApplications(enriched);
  } catch (err) {
    console.error("Error fetching applications:", err);
    setMessage("Failed to load applications. Please try again.");
    setTimeout(() => setMessage(""), 3000);
  }
  setLoading(false);
};

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJobId]);


  const resolveAge = (profile) => {
    if (!profile) return null;
   
    const candidates = [profile.age, profile.ageYears, profile.years, profile.yearsOfAge, profile.yearsOld];
    for (const c of candidates) {
      const n = Number(c);
      if (!isNaN(n) && n !== 0) return n;
    }
    
    const alt = Number(profile.experienceYears ?? profile.experience ?? profile.exp ?? profile.expYears);
    if (!isNaN(alt) && alt !== 0) return null;
   
    const dob = profile.dob || profile.dateOfBirth || profile.birthDate;
    if (dob) {
      const d = new Date(dob);
      if (!isNaN(d)) {
        const diff = Date.now() - d.getTime();
        const age = Math.floor(new Date(diff).getUTCFullYear() - 1970);
        if (!isNaN(age)) return age;
      }
    }
    return null;
  };

  const resolveExperience = (profile) => {
    if (!profile) return null;
    const candidates = [profile.experienceYears, profile.experience, profile.exp, profile.expYears, profile.yearsOfExperience, profile.yearsExperience];
    for (const c of candidates) {
      const n = Number(c);
      if (!isNaN(n)) return n;
    }
    return null;
  };

  const resolvePincode = (profile) => {
    if (!profile) return "";
    const candidates = [profile.pincode, profile.pin, profile.postalCode, profile.postal_code, profile.zip, profile.zipcode, profile.postcode];
    for (const c of candidates) {
      if (c != null && String(c).trim() !== "") return String(c).trim();
    }
    return "";
  };

 
const updateStatus = async (appId, status) => {
  try {
    const app = applications.find(a => a.id === appId);
    if (!app) {
      setMessage("❌ Application not found");
      return;
    }

    await axios.put(`${API_BASE}/applications/${appId}/status?status=${status}`);

    setMessage(
      status === "ACCEPTED"
        ? `✅ Accepted ${app.workerName || app.workerProfile?.name || "Worker"}`
        : `❌ Rejected ${app.workerName || app.workerProfile?.name || "Worker"}`
    );

    await fetchApplications();
  } catch (err) {
    console.error("Error updating status:", err);

   
    if (err.response && err.response.status === 403) {
      setMessage("⛔ Decision deadline passed. You cannot update applications.");
      await fetchApplications(); 
    } else {
      setMessage("❌ Failed to update application status.");
    }
  }

  setTimeout(() => setMessage(""), 3000);
};

const toggleLike = (appId) => {
  setLikes(prev => ({
    ...prev,
    [appId]: !prev[appId]
  }));
};

const addComment = (appId) => {
  if (!newComment[appId]?.trim()) return;
  
  setComments(prev => ({
    ...prev,
    [appId]: [
      ...(prev[appId] || []),
      {
        id: Date.now(),
        text: newComment[appId],
        timestamp: new Date().toLocaleTimeString()
      }
    ]
  }));
  
  setNewComment(prev => ({
    ...prev,
    [appId]: ""
  }));
};

const deleteComment = (appId, commentId) => {
  setComments(prev => ({
    ...prev,
    [appId]: prev[appId].filter(c => c.id !== commentId)
  }));
};


  return (
    <div className="applications-container">
      <h2 className="title">📩 Job Applications</h2>
      <p className="subtitle">Manage all job requests from one panel</p>

      {/* Status Message */}
      {message && (
        <div className={`message ${message.startsWith("❌") ? "error" : message.startsWith("⚠️") ? "warning" : "success"}`}>
          {message}
        </div>
      )}

      {/* Job dropdown */}
      <div className="job-selector">
        <label>Select Job:</label>
        <select
          value={selectedJobId}
          onChange={(e) => setSelectedJobId(e.target.value)}
        >
          {jobs.map((job) => {
            const acceptedCount = applications.filter(
              app => app.jobId === job.id && app.status.toLowerCase() === "accepted"
            ).length;
            
            return (
              <option key={job.id} value={job.id}>
                {job.title} ({job.applicationCount} applications
                {acceptedCount > 0 ? `, ${acceptedCount} accepted` : ""})
              </option>
            );
          })}
        </select>
      </div>

      {/* Debug / info line */}
      <div style={{ marginTop: 8, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ color: '#374151', fontSize: 14 }}>
          Apps: {applications.length} • Profiles: {applications.filter(a => !!a.workerProfile).length}
        </div>
        <label style={{ fontSize: 13, color: '#374151' }}>
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} style={{ marginRight: 6 }} />
          Show all (ignore filters)
        </label>
        <label style={{ fontSize: 13, color: '#374151' }}>
          <input type="checkbox" checked={showDebug} onChange={(e) => setShowDebug(e.target.checked)} style={{ marginRight: 6 }} />
          Show debug
        </label>
        <div style={{ fontSize: 13, color: '#6b7280' }}>
          Tip: open browser Console to see "Fetched worker &lt;id&gt;:" logs for profile data
        </div>
      </div>

      {/* Filters for worker listing */}
      <div className="filter-row" style={{ marginTop: 12, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
        <label style={{ marginRight: 8, fontWeight: 600 }}>Filters</label>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            className="filter-input"
            type="number"
            min={0}
            placeholder="Min age"
            value={minAge}
            onChange={(e) => setMinAge(e.target.value)}
            style={{ width: 96 }}
          />
          <input
            className="filter-input"
            type="number"
            min={0}
            placeholder="Max age"
            value={maxAge}
            onChange={(e) => setMaxAge(e.target.value)}
            style={{ width: 96 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            className="filter-input"
            type="number"
            min={0}
            placeholder="Min exp (yrs)"
            value={minExperience}
            onChange={(e) => setMinExperience(e.target.value)}
            style={{ width: 120 }}
          />
          <input
            className="filter-input"
            type="number"
            min={0}
            placeholder="Max exp (yrs)"
            value={maxExperience}
            onChange={(e) => setMaxExperience(e.target.value)}
            style={{ width: 120 }}
          />
        </div>

        <input
          className="filter-input"
          type="text"
          placeholder="Pincode (exact match)"
          value={filterPincode}
          onChange={(e) => setFilterPincode(e.target.value)}
          style={{ width: 150, marginLeft: 8 }}
        />

        <button className="search-btn" onClick={() => {
          // parse numeric values and apply
          const parseNum = (v) => {
            const n = Number(v);
            return isNaN(n) ? null : n;
          };
          setAppliedMinAge(parseNum(minAge));
          setAppliedMaxAge(parseNum(maxAge));
          setAppliedMinExperience(parseNum(minExperience));
          setAppliedMaxExperience(parseNum(maxExperience));
          setAppliedFilterPincode(filterPincode && filterPincode.trim() !== "" ? String(filterPincode).trim() : "");
        }}>
          Search
        </button>
        <button className="clear-btn" onClick={() => {
          // clear input fields and applied filters
          setMinAge(""); setMaxAge(""); setMinExperience(""); setMaxExperience(""); setFilterPincode("");
          setAppliedMinAge(null); setAppliedMaxAge(null); setAppliedMinExperience(null); setAppliedMaxExperience(null); setAppliedFilterPincode("");
        }} style={{ marginLeft: 8 }}>
          Clear
        </button>
      </div>

      {/*  Table */}
      {(() => {
  const filteredApplications = applications.filter((app) => {
  const worker = app.workerProfile || app.worker;

  // Skip if profile not yet loaded
  if (!worker || Object.keys(worker).length === 0) return false;

  const age = Number(worker.age) || 0;
  const exp = Number(worker.experience) || 0;
  const pin = String(worker.pincode || "");

  const minA = minAge !== "" ? Number(minAge) : null;
  const maxA = maxAge !== "" ? Number(maxAge) : null;
  const minE = minExperience !== "" ? Number(minExperience) : null;
  const maxE = maxExperience !== "" ? Number(maxExperience) : null;
  const fPin = filterPincode ? String(filterPincode) : "";

  const ageOk = (!minA || age >= minA) && (!maxA || age <= maxA);
  const expOk = (!minE || exp >= minE) && (!maxE || exp <= maxE);
  const pinOk = !fPin || pin === fPin;
    console.log(worker.name, worker.age, worker.experience, worker.pincode);
  return ageOk && expOk && pinOk;
});

  // If debug 'showAll' is checked, bypass filters and show every application
  const finalApplications = showAll ? applications : filteredApplications;
  const resultsCount = finalApplications.length;

  if (loading) return <p>Loading applications...</p>;
  if (resultsCount === 0) return <p className="empty-msg">No applications match the current filters.</p>;

        // Debug panel: show per-application values and whether they passed filters
        // const debugPanel = showDebug ? (
          <div style={{ margin: '10px 0', padding: 12, background: '#f8fafc', borderRadius: 8, border: '1px solid #e6eefc' }}>
            <strong style={{ display: 'block', marginBottom: 8 }}>Filter debug</strong>
            {applications.map((app) => {
              const p = app.workerProfile || {};
                const ageNum = resolveAge(p);
                const expNum = resolveExperience(p);
                const pincodeStr = resolvePincode(p);
              // Use applied filters for debug
              const minAgeNum = appliedMinAge;
              const maxAgeNum = appliedMaxAge;
              const minExpNum = appliedMinExperience;
              const maxExpNum = appliedMaxExperience;
              const pinApplied = appliedFilterPincode && appliedFilterPincode.trim() !== "" ? String(appliedFilterPincode).trim() : null;
              let passes = true;
              const anyFilterActive = (minAgeNum !== null) || (maxAgeNum !== null) || (minExpNum !== null) || (maxExpNum !== null) || (pinApplied !== null);
              if (!app.workerProfile && anyFilterActive) passes = false;
              if (app.workerProfile) {
                if (minAgeNum !== null && (ageNum == null || isNaN(ageNum) || ageNum < minAgeNum)) passes = false;
                if (maxAgeNum !== null && (ageNum == null || isNaN(ageNum) || ageNum > maxAgeNum)) passes = false;
                if (minExpNum !== null && (expNum == null || isNaN(expNum) || expNum < minExpNum)) passes = false;
                if (maxExpNum !== null && (expNum == null || isNaN(expNum) || expNum > maxExpNum)) passes = false;
                if (pinApplied !== null && pincodeStr !== pinApplied) passes = false;
              }

              return (
                <div key={app.id} style={{ padding: 8, borderBottom: '1px dashed #e6eefc' }}>
                  <div style={{ fontWeight: 700 }}>{app.workerProfile?.name || app.workerName || `Worker ${app.workerId || 'N/A'}`}</div>
                  <div style={{ fontSize: 13, color: '#374151' }}>
                    id: {app.workerId ?? 'N/A'} • resolved age: {ageNum ?? 'N/A'} • resolved exp: {expNum ?? 'N/A'} • resolved pincode: {pincodeStr || 'N/A'}
                  </div>
                  <div style={{ marginTop: 6 }}><strong style={{ color: passes ? '#0b6623' : '#b91c1c' }}>{passes ? 'PASS' : 'FILTERED OUT'}</strong></div>
                </div>
              )
            })}
          </div>
        // ) : null;

        return (
          <div className="applications-grid">
            {finalApplications.map((app) => (
              <div key={app.id} className="application-card">
                {/* Header with worker name and status */}
                <div className="card-header">
                  <div>
                    <h3 className="worker-card-name">
                      {(app.workerProfile && app.workerProfile.name) || app.workerName || "Unnamed Worker"}
                    </h3>
                    <p className="applied-date">
                      📅 Applied on {new Date(app.appliedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`status ${app.status?.toLowerCase()}`}>
                    {app.status}
                  </span>
                </div>

                {/* Worker Details */}
                {app.workerProfile ? (
                  <div className="card-details">
                    {app.workerProfile.phone && <div className="detail-item">📞 {app.workerProfile.phone}</div>}
                    {app.workerProfile.address && <div className="detail-item">🏠 {app.workerProfile.address}</div>}
                    {(app.workerProfile.area || app.workerProfile.colony || app.workerProfile.pincode) && (
                      <div className="detail-item">
                        📍 {`${app.workerProfile.area || ''}${app.workerProfile.colony ? ', ' + app.workerProfile.colony : ''}${app.workerProfile.pincode ? ', ' + app.workerProfile.pincode : ''}`}
                      </div>
                    )}
                    {(app.workerProfile.workType || app.workerProfile.skill) && (
                      <div className="detail-item">🛠️ {app.workerProfile.workType || app.workerProfile.skill}</div>
                    )}
                    {app.workerProfile.age != null && <div className="detail-item">🎂 Age: {app.workerProfile.age}</div>}
                    {app.workerProfile.experienceYears != null && <div className="detail-item">📈 Exp: {app.workerProfile.experienceYears} yrs</div>}
                  </div>
                ) : (
                  <div className="card-details">No profile available</div>
                )}

                {/* Skill */}
                <div className="card-skill">
                  <strong>Applied for:</strong>{" "}
                  {app.workerSkill || app.workerProfile?.workType || app.workerProfile?.skill || "General"}
                </div>

                <div className="card-skill">
                  <strong>Trust score:</strong>{" "}
                  {(() => {
                    const profiles = skillProfilesByWorker[String(app.workerId)] || [];
                    if (!profiles.length) return "Not assessed yet";
                    const top = profiles[0];
                    return `${top.level} (${top.score}%) in ${top.skill}`;
                  })()}
                </div>

                <div className="card-skill">
                  <strong>Job Reactions:</strong>{" "}
                  {(() => {
                    const engagement = engagementByJob[String(app.jobId)];
                    if (!engagement) return "No worker reactions yet";
                    const likesCount = engagement.likeCount || 0;
                    const commentsCount = engagement.commentCount || 0;
                    if (!commentsCount) return `${likesCount} likes, 0 comments`;
                    const preview = engagement.latestCommentPreview
                      ? ` Latest: "${engagement.latestCommentPreview}"`
                      : "";
                    return `${likesCount} likes, ${commentsCount} comments.${preview}`;
                  })()}
                </div>

                <div className="card-skill">
                  <strong>Owner Notes:</strong> Internal shortlist/comments visible only in this panel.
                </div>

                {/* Like and Comment Section */}
                <div className="card-engagement">
                  <button 
                    className={`like-btn ${likes[app.id] ? 'liked' : ''}`}
                    onClick={() => toggleLike(app.id)}
                    title="Like this application"
                  >
                    {likes[app.id] ? '❤️' : '🤍'} {Object.keys(likes).filter(k => likes[k]).length || 0}
                  </button>
                  
                  <button 
                    className="comments-toggle-btn"
                    onClick={() => setExpandedComments(prev => ({...prev, [app.id]: !prev[app.id]}))}
                    title="View comments"
                  >
                    💬 {comments[app.id]?.length || 0} Comments
                  </button>
                </div>

                {/* Comments Section */}
                {expandedComments[app.id] && (
                  <div className="comments-section">
                    <div className="comments-list">
                      {comments[app.id]?.length ? (
                        comments[app.id].map(comment => (
                          <div key={comment.id} className="comment-item">
                            <div className="comment-header">
                              <span className="comment-time">{comment.timestamp}</span>
                              <button 
                                className="delete-comment-btn"
                                onClick={() => deleteComment(app.id, comment.id)}
                                title="Delete comment"
                              >
                                ✕
                              </button>
                            </div>
                            <p className="comment-text">{comment.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="no-comments">No comments yet. Add one!</p>
                      )}
                    </div>
                    <div className="comment-input-wrapper">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        className="comment-input"
                        value={newComment[app.id] || ''}
                        onChange={(e) => setNewComment(prev => ({...prev, [app.id]: e.target.value}))}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') addComment(app.id);
                        }}
                      />
                      <button 
                        className="send-comment-btn"
                        onClick={() => addComment(app.id)}
                        disabled={!newComment[app.id]?.trim()}
                      >
                        Send
                      </button>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="card-actions">
                  <button
                    className="accept-btn"
                    onClick={() => updateStatus(app.id, "ACCEPTED")}
                  >
                    ✅ Accept
                  </button>
                  <button
                    className="reject-btn"
                    onClick={() => updateStatus(app.id, "REJECTED")}
                  >
                    ❌ Reject
                  </button>

                  {app.status === "ACCEPTED" && (
                    <button
                      className="chat-btn"
                      onClick={() => setOpenChatFor(app)}
                    >
                      💬 Chat
                    </button>
                  )}

                  {app.workerProfile && (
                    <button
                      className="profile-btn"
                      onClick={() => setOpenProfileIds(prev => ({ ...prev, [app.id]: !prev[app.id] }))}
                    >
                      {openProfileIds[app.id] ? '📋 Hide Profile' : '📋 Full Profile'}
                    </button>
                  )}
                </div>

                {/* Full Profile JSON */}
                {openProfileIds[app.id] && app.workerProfile && (
                  <details className="profile-details">
                    <summary>View Full Profile Data</summary>
                    <pre>{JSON.stringify(app.workerProfile, null, 2)}</pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        );
      })()}

      {/* Chat Modal */}
      {openChatFor && (
        <Chat
          applicationId={openChatFor.id}
          ownerId={1} // logged-in owner (temporary)
          workerId={openChatFor.workerId}
          onClose={() => setOpenChatFor(null)}
        />
      )}
    </div>
  );
};

export default ApplicationsPanel;
