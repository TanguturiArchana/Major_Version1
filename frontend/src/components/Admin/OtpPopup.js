import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Popup.css";
import API from "../../services/api";
import { saveAuthTokens } from "../../services/authToken";

const OtpPopup = ({ onClose }) => {
  const navigate = useNavigate();

  const [screen, setScreen] = useState("role_selection");
  const [userRole, setUserRole] = useState(null); // "worker" | "owner"
  const [flowType, setFlowType] = useState(null); // "login" | "register"
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");

  const [workerData, setWorkerData] = useState({
    name: "",
    address: "",
    workType: "",
    district: "",
    mandal: "",
    pincode: "",
    age: "",
    experienceYears: "",
  });

  const [ownerData, setOwnerData] = useState({
    name: "",
    address: "",
    businessName: "",
    district: "",
    mandal: "",
    pincode: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const normalizePhone = (value) => (value || "").replace(/\D/g, "");
  const extractError = (err, fallback) => {
    const data = err?.response?.data;
    if (!data) return fallback;
    if (typeof data === "string") return data;
    if (typeof data?.message === "string") return data.message;
    return fallback;
  };

  const validatePhone = () => {
    const normalized = normalizePhone(phoneNumber);
    if (!/^\d{10}$/.test(normalized)) {
      setError("Please enter a valid 10-digit phone number.");
      return null;
    }
    return normalized;
  };

  const resetTransient = () => {
    setError("");
    setSuccessMessage("");
    setOtp("");
  };

  const handlePickRole = (role) => {
    setUserRole(role);
    resetTransient();
    setScreen("phone_entry");
  };

  const handleContinueWithPhone = async () => {
    setLoading(true);
    setError("");
    try {
      const normalizedPhone = validatePhone();
      if (!normalizedPhone) return;

      const roleUpper = userRole === "worker" ? "WORKER" : "OWNER";
      try {
        const statusRes = await API.get("/auth/account-status", {
          params: { phoneNumber: normalizedPhone, role: roleUpper },
        });

        const accountStatus = statusRes.data || {};
        const existsInOtherRole = !!accountStatus.existsInOtherRole;
        const isRegistered = !!accountStatus.registered;

        if (existsInOtherRole && !isRegistered) {
          setError(`This phone is already registered as ${userRole === "worker" ? "Owner" : "Worker"}.`);
          return;
        }

        const nextFlow = isRegistered ? "login" : "register";
        setFlowType(nextFlow);

        const sendOtpEndpoint =
          userRole === "worker"
            ? nextFlow === "login"
              ? "/auth/login/worker/send-otp"
              : "/auth/register/worker/send-otp"
            : nextFlow === "login"
            ? "/auth/login/owner/send-otp"
            : "/auth/register/owner/send-otp";

        const sendOtpRes = await API.post(sendOtpEndpoint, {}, { params: { phoneNumber: normalizedPhone } });
        setPhoneNumber(normalizedPhone);
        setSuccessMessage(
          typeof sendOtpRes?.data === "string"
            ? sendOtpRes.data
            : nextFlow === "login"
            ? "Account found. OTP sent for login."
            : "No account found. OTP sent to start registration."
        );
        setScreen("otp_verify");
      } catch (statusErr) {
        // Backward-compatible fallback when account-status endpoint is unavailable.
        const statusCode = statusErr?.response?.status;
        const statusMessage = extractError(statusErr, "");
        const endpointMissing =
          statusCode === 404 &&
          (statusMessage.toLowerCase().includes("no static resource") ||
            statusMessage.toLowerCase().includes("not found"));

        if (!endpointMissing) {
          throw statusErr;
        }

        const loginSendOtpEndpoint =
          userRole === "worker" ? "/auth/login/worker/send-otp" : "/auth/login/owner/send-otp";
        const registerSendOtpEndpoint =
          userRole === "worker" ? "/auth/register/worker/send-otp" : "/auth/register/owner/send-otp";

        try {
          const loginOtpRes = await API.post(loginSendOtpEndpoint, {}, { params: { phoneNumber: normalizedPhone } });
          setFlowType("login");
          setPhoneNumber(normalizedPhone);
          setSuccessMessage(typeof loginOtpRes?.data === "string" ? loginOtpRes.data : "Account found. OTP sent for login.");
          setScreen("otp_verify");
        } catch (loginErr) {
          const loginMsg = extractError(loginErr, "").toLowerCase();
          const looksUnregistered =
            loginErr?.response?.status === 404 ||
            loginMsg.includes("not found") ||
            loginMsg.includes("not registered");

          if (!looksUnregistered) {
            throw loginErr;
          }

          const registerOtpRes = await API.post(registerSendOtpEndpoint, {}, { params: { phoneNumber: normalizedPhone } });
          setFlowType("register");
          setPhoneNumber(normalizedPhone);
          setSuccessMessage(
            typeof registerOtpRes?.data === "string"
              ? registerOtpRes.data
              : "No account found. OTP sent to start registration."
          );
          setScreen("otp_verify");
        }
      }
    } catch (err) {
      setError(extractError(err, "Could not continue. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    setError("");
    try {
      const normalizedPhone = validatePhone();
      if (!normalizedPhone) return;
      if (!/^\d{6}$/.test((otp || "").trim())) {
        setError("Please enter a valid 6-digit OTP.");
        return;
      }

      const verifyEndpoint =
        userRole === "worker"
          ? flowType === "login"
            ? "/auth/login/worker/verify-otp"
            : "/auth/register/worker/verify-otp"
          : flowType === "login"
          ? "/auth/login/owner/verify-otp"
          : "/auth/register/owner/verify-otp";

      const response = await API.post(verifyEndpoint, {}, { params: { phoneNumber: normalizedPhone, otp: otp.trim() } });

      if (flowType === "login") {
        const id = response?.data?.id;
        const accessToken = response?.data?.accessToken;
        const refreshToken = response?.data?.refreshToken;
        if (!id) {
          setError("Login response missing user id.");
          return;
        }
        saveAuthTokens({ accessToken, refreshToken });
        setSuccessMessage("Login successful. Redirecting...");
        setTimeout(() => {
          if (userRole === "worker") navigate("/workerDashboard", { state: { id } });
          else navigate("/ownerDashboard", { state: { id } });
          onClose();
        }, 600);
        setScreen("login_success");
      } else {
        setSuccessMessage("OTP verified. Complete your profile.");
        setScreen("complete_registration");
      }
    } catch (err) {
      setError(extractError(err, "Invalid or expired OTP."));
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteWorkerRegistration = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...workerData,
        phone: normalizePhone(phoneNumber),
        age: parseInt(workerData.age, 10),
        pincode: parseInt(workerData.pincode, 10),
        experienceYears: parseInt(workerData.experienceYears, 10),
      };

      const response = await API.post("/auth/register/worker/complete", payload);
      const id = response?.data?.id;
      saveAuthTokens({
        accessToken: response?.data?.accessToken,
        refreshToken: response?.data?.refreshToken,
      });
      setSuccessMessage("Registration completed. Redirecting...");
      setScreen("registration_success");
      setTimeout(() => {
        if (id && id > 0) {
          navigate("/workerDashboard", { state: { id } });
        }
        onClose();
      }, 700);
    } catch (err) {
      setError(extractError(err, "Registration failed."));
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOwnerRegistration = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        ...ownerData,
        phone: normalizePhone(phoneNumber),
        pincode: parseInt(ownerData.pincode, 10),
      };

      const response = await API.post("/auth/register/owner/complete", payload);
      const id = response?.data?.id;
      saveAuthTokens({
        accessToken: response?.data?.accessToken,
        refreshToken: response?.data?.refreshToken,
      });
      setSuccessMessage("Registration completed. Redirecting...");
      setScreen("registration_success");
      setTimeout(() => {
        if (id && id > 0) {
          navigate("/ownerDashboard", { state: { id } });
        }
        onClose();
      }, 700);
    } catch (err) {
      setError(extractError(err, "Registration failed."));
    } finally {
      setLoading(false);
    }
  };

  if (screen === "role_selection") {
    return (
      <div className="popup-overlay">
        <div className="popup-box">
          <h2>Login or Register</h2>
          <p>Select your role to continue:</p>
          <button className="btn-primary" onClick={() => handlePickRole("worker")}>
            Continue as Worker
          </button>
          <button className="btn-success" onClick={() => handlePickRole("owner")}>
            Continue as Owner
          </button>
          <button className="btn-close" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  if (screen === "phone_entry") {
    return (
      <div className="popup-overlay">
        <div className="popup-box form-box">
          <h2>{userRole === "worker" ? "Worker Access" : "Owner Access"}</h2>
          <p>Enter your phone number. If account exists, we log you in. Else, we start registration.</p>
          {error && <div className="error-msg">{error}</div>}
          {successMessage && <div className="success-msg">{successMessage}</div>}
          <input
            type="tel"
            placeholder="Phone Number (10 digits)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <button className="btn-primary" onClick={handleContinueWithPhone} disabled={loading}>
            {loading ? "Checking..." : "Continue"}
          </button>
          <button
            className="btn-close"
            onClick={() => {
              resetTransient();
              setScreen("role_selection");
            }}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  if (screen === "otp_verify") {
    return (
      <div className="popup-overlay">
        <div className="popup-box form-box">
          <h2>Verify OTP</h2>
          <p>{flowType === "login" ? "Login OTP" : "Registration OTP"} sent to {phoneNumber}</p>
          {error && <div className="error-msg">{error}</div>}
          {successMessage && <div className="success-msg">{successMessage}</div>}
          <input
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength="6"
          />
          <button className="btn-primary" onClick={handleVerifyOtp} disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
          <button className="btn-close" onClick={() => setScreen("phone_entry")}>Back</button>
        </div>
      </div>
    );
  }

  if (screen === "complete_registration" && userRole === "worker") {
    return (
      <div className="popup-overlay">
        <div className="popup-box form-box">
          <h2>Complete Worker Profile</h2>
          {error && <div className="error-msg">{error}</div>}
          <input type="text" placeholder="Full Name" value={workerData.name} onChange={(e) => setWorkerData({ ...workerData, name: e.target.value })} />
          <input type="text" placeholder="Address" value={workerData.address} onChange={(e) => setWorkerData({ ...workerData, address: e.target.value })} />
          <input type="text" placeholder="Work Type" value={workerData.workType} onChange={(e) => setWorkerData({ ...workerData, workType: e.target.value })} />
          <input type="text" placeholder="District" value={workerData.district} onChange={(e) => setWorkerData({ ...workerData, district: e.target.value })} />
          <input type="text" placeholder="Mandal" value={workerData.mandal} onChange={(e) => setWorkerData({ ...workerData, mandal: e.target.value })} />
          <input type="text" placeholder="Pincode" value={workerData.pincode} onChange={(e) => setWorkerData({ ...workerData, pincode: e.target.value })} />
          <input type="number" placeholder="Age" value={workerData.age} onChange={(e) => setWorkerData({ ...workerData, age: e.target.value })} />
          <input type="number" placeholder="Experience (years)" value={workerData.experienceYears} onChange={(e) => setWorkerData({ ...workerData, experienceYears: e.target.value })} />
          <button className="btn-primary" onClick={handleCompleteWorkerRegistration} disabled={loading}>
            {loading ? "Submitting..." : "Finish Registration"}
          </button>
        </div>
      </div>
    );
  }

  if (screen === "complete_registration" && userRole === "owner") {
    return (
      <div className="popup-overlay">
        <div className="popup-box form-box">
          <h2>Complete Owner Profile</h2>
          {error && <div className="error-msg">{error}</div>}
          <input type="text" placeholder="Full Name" value={ownerData.name} onChange={(e) => setOwnerData({ ...ownerData, name: e.target.value })} />
          <input type="text" placeholder="Address" value={ownerData.address} onChange={(e) => setOwnerData({ ...ownerData, address: e.target.value })} />
          <input type="text" placeholder="Business Name" value={ownerData.businessName} onChange={(e) => setOwnerData({ ...ownerData, businessName: e.target.value })} />
          <input type="text" placeholder="District" value={ownerData.district} onChange={(e) => setOwnerData({ ...ownerData, district: e.target.value })} />
          <input type="text" placeholder="Mandal" value={ownerData.mandal} onChange={(e) => setOwnerData({ ...ownerData, mandal: e.target.value })} />
          <input type="text" placeholder="Pincode" value={ownerData.pincode} onChange={(e) => setOwnerData({ ...ownerData, pincode: e.target.value })} />
          <button className="btn-primary" onClick={handleCompleteOwnerRegistration} disabled={loading}>
            {loading ? "Submitting..." : "Finish Registration"}
          </button>
        </div>
      </div>
    );
  }

  if (screen === "registration_success" || screen === "login_success") {
    return (
      <div className="popup-overlay">
        <div className="popup-box">
          <h2>Success</h2>
          <p>{successMessage || "Please wait..."}</p>
        </div>
      </div>
    );
  }

  return null;
};

export default OtpPopup;
