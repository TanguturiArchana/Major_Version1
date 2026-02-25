import { useEffect, useState } from "react";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import { API_BASE_URL } from "../../config/environment";
import { connect as wsConnect, subscribe as wsSubscribe } from "../../services/socketService";
import "./EngagementHub.css";

const EngagementHub = () => {
  const state = useOutletContext();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCards = async () => {
    if (!state?.id) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/engagement/owners/${state.id}`);
      setCards(res.data || []);
    } catch (err) {
      console.error("Failed to load owner engagement feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
    try {
      wsConnect();
    } catch (e) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.id]);

  useEffect(() => {
    if (!cards.length) return undefined;
    const subs = cards.map((card) =>
      wsSubscribe(`/topic/engagement/job/${card.jobId}`, (snapshot) => {
        setCards((prev) =>
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
  }, [cards.map((c) => c.jobId).join(",")]);

  return (
    <div className="engagement-hub">
      <div className="hub-header">
        <h2>Job Reactions Feed</h2>
        <p style={{ margin: 0, color: "#64748b" }}>
          Real-time likes and comments workers leave on your job posts.
        </p>
        <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
          Use this feed to identify jobs attracting genuine worker interest before shortlisting.
        </p>
        <button className="refresh-btn" onClick={fetchCards}>Refresh</button>
      </div>

      {loading ? (
        <p className="loading-text">Loading engagement data...</p>
      ) : cards.length === 0 ? (
        <p className="loading-text">No job engagement yet.</p>
      ) : (
        <div className="hub-grid">
          {cards.map((card) => (
            <article key={card.jobId} className="hub-card">
              <div className="hub-title-row">
                <h3>{card.jobTitle}</h3>
                <span className="owner-chip">{card.ownerName || "Owner"}</span>
              </div>
              <div className="metrics-row">
                <div className="metric likes">❤️ {card.likeCount} likes</div>
                <div className="metric comments">💬 {card.commentCount} comments</div>
              </div>
              <div className="latest-comment">
                {card.latestCommentPreview ? (
                  <>
                    <p className="preview">"{card.latestCommentPreview}"</p>
                    <p className="meta">
                      by <strong>{card.latestCommentBy}</strong>
                      {card.latestCommentAt ? ` • ${new Date(card.latestCommentAt).toLocaleString()}` : ""}
                    </p>
                  </>
                ) : (
                  <p className="preview muted">No comments yet for this job.</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default EngagementHub;
