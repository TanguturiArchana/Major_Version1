import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/environment";

const WorkerNotifications = ({ workerId }) => {
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);

  const fetchNotifications = async () => {
    if (!workerId) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/notifications/worker/${workerId}`);
      setItems(res.data?.items || []);
      setUnread(res.data?.unreadCount || 0);
    } catch (e) {
      // ignore UI noise
    }
  };

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 15000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerId]);

  const markRead = async (id) => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/${id}/read`);
      fetchNotifications();
    } catch (e) {}
  };

  return (
    <div className="jobs-container">
      <div className="job-card" style={{ padding: "1rem" }}>
        <h3 style={{ marginTop: 0 }}>Notifications ({unread} unread)</h3>
        {items.length === 0 ? (
          <p>No notifications yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.id} style={{ borderBottom: "1px solid #e5e7eb", padding: "0.7rem 0" }}>
              <strong>{item.title}</strong>
              <p style={{ margin: "0.3rem 0" }}>{item.message}</p>
              <small>{new Date(item.createdAt).toLocaleString()}</small>
              {!item.readFlag && (
                <div>
                  <button className="send-comment-btn" onClick={() => markRead(item.id)}>Mark as read</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkerNotifications;
