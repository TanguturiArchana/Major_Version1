import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Admin/Navbar";
import Home from "./components/Admin/Home";
import Stats from "./components/Admin/Stats";
import Opening from "./components/Admin/Opening";
import Footer from "./components/Admin/Footer";
import WorkerDashboard from "./components/Worker/WorkerDashboard";
import OwnerLayout from "./components/Owner/OwnerLayout";
import JobManager from "./components/Owner/JobManager";
import Analytics from "./components/Owner/Analytics";
import ApplicationsPanel from "./components/Owner/ApplicationsPanel";
import OwnerProfile from "./components/Owner/OwnerProfile";
import WorkerProfile from "./components/Worker/WorkerProfile";


function App() {
  return (
    <Router>
      <Routes>
        {/* 🌐 Landing Page */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gray-50 text-gray-800">
              <Navbar />
              <Home />
              <Stats />
              <Opening />
              <Footer />
            </div>
          }
        />
        <Route path="/workerDashboard" element={<WorkerDashboard />} />
        <Route path="/WorkerProfile" element={<WorkerProfile />} />
        <Route element={<OwnerLayout />}>
          <Route path="/ownerDashboard" element={<Navigate to="/owner/jobs" />} />
          <Route path="/owner/jobs" element={<JobManager />} />
          <Route path="/owner/analytics" element={<Analytics />} />
          <Route path="/owner/applications" element={<ApplicationsPanel />} />
          <Route path="/owner/profile" element={<OwnerProfile />} />
          

        </Route>
      </Routes>
    </Router>
  );
}

export default App;
