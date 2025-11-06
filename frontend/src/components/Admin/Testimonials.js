import React from "react";
import "./Testimonials.css"; 

const Testimonials = () => {
  return (
    <section className="testimonials-section">
      <h2>What Our Workers Say About Us</h2>
      <div className="testimonials-container">
        {[1, 2, 3].map((i) => (
          <div key={i} className="testimonial-card"></div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
