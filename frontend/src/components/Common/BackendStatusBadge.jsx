import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/environment";
import "./BackendStatusBadge.css";

const BackendStatusBadge = () => {
  const [status, setStatus] = useState("loading");
  const [label, setLabel] = useState("Checking backend...");

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/meta/capabilities`, { timeout: 5000 });
        const caps = res?.data?.capabilities || {};
        const healthy = !!(caps.otpAccountStatus && caps.engagementApi);
        if (!mounted) return;
        if (healthy) {
          setStatus("ok");
          setLabel(`Backend v${res?.data?.version || "unknown"} connected`);
        } else {
          setStatus("warn");
          setLabel("Backend is running but missing required capabilities");
        }
      } catch (err) {
        if (!mounted) return;
        setStatus("error");
        setLabel("Backend unavailable or stale build");
      }
    };
    check();
    return () => {
      mounted = false;
    };
  }, []);

  return <div className={`backend-badge ${status}`}>{label}</div>;
};

export default BackendStatusBadge;
