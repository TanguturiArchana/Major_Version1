import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/environment";
import { connect as wsConnect, subscribe as wsSubscribe } from "../../services/socketService";
import "./EngagementPulse.css";

const EngagementPulse = () => {
  const [jobs, setJobs] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/engagement/admin/jobs`);
      setJobs((res.data || []).slice(0, 8));
    } catch (err) {
      console.error("Failed to load admin engagement pulse", err);
    }
  };

  useEffect(() => {
    fetchData();
    try {
      wsConnect();
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (!jobs.length) return undefined;
    const subs = jobs.map((job) =>
      wsSubscribe(`/topic/engagement/job/${job.jobId}`, (snapshot) => {
        setJobs((prev) =>
          prev.map((item) =>
            item.jobId === snapshot.jobId
              ? {
                  ...item,
                  likeCount: snapshot.likeCount,
                  commentCount: snapshot.commentCount,
                  latestCommentPreview: snapshot.comments?.[0]?.comment || null,
                  latestCommentBy: snapshot.comments?.[0]?.workerName || null,
                  latestCommentAt: snapshot.comments?.[0]?.createdAt || null,
                }
              : item
          )
        );
      })
    );
    return () => subs.forEach((sub) => sub && sub.unsubscribe && sub.unsubscribe());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs.map((j) => j.jobId).join(",")]);

  return (
    <section className="pulse-wrap">
      <div className="pulse-head">
        <h2>Live Platform Pulse</h2>
        <button onClick={fetchData}>Reload</button>
      </div>
      <div className="pulse-grid">
        {jobs.map((job) => (
          <div key={job.jobId} className="pulse-card">
            <h3>{job.jobTitle}</h3>
            <div className="pulse-metrics">
              <span>❤️ {job.likeCount}</span>
              <span>💬 {job.commentCount}</span>
            </div>
            <p className="pulse-comment">
              {job.latestCommentPreview ? `"${job.latestCommentPreview}"` : "No comments yet"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default EngagementPulse;
