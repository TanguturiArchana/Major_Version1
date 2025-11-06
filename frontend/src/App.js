import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Admin/Navbar";
import Home from "./components/Admin/Home";
import Stats from "./components/Admin/Stats";
import Opening from "./components/Admin/Opening";
import Testimonials from "./components/Admin/Testimonials";
import FAQ from "./components/Admin/Faq";
import Footer from "./components/Admin/Footer";
import WorkerDashboard from "./components/Worker/WorkerDashboard"; 
import OwnerDashboard from "./components/Owner/OwnerDashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Landing page route */}
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gray-50 text-gray-800">
              <Navbar />
              <Home />
              <Stats />
              <Opening />
              <Testimonials />
              <FAQ />
              <Footer />
            </div>
          }
        />

        {/* Worker Dashboard route */}
        <Route path="/workerDashboard" element={<WorkerDashboard />} />
        <Route path="/ownerDashboard" element={<OwnerDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
