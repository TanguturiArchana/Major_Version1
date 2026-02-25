import React, { useState } from "react";
import "./Faq.css";

const Faq = () => {
  const faqs = [
    {
      question: "How does worker login and registration work now?",
      answer:
        "Enter phone number, verify access method, and continue with login or registration flow. Existing accounts go to login, new users finish profile setup.",
    },
    {
      question: "How do owners verify workers before accepting?",
      answer:
        "Use trust score from skill tests, profile details, engagement history, and direct chat. Combine this with location and response speed for final decision.",
    },
    {
      question: "What is Job Reactions feed used for?",
      answer:
        "It shows real-time likes and comments from workers on your job posts, helping identify active demand before shortlisting applications.",
    },
    {
      question: "Why might route navigation fail sometimes?",
      answer:
        "If exact pincode geocoding fails, the app opens fallback Google Maps directions from available location text so workers still get navigation support.",
    },
    {
      question: "Who can see comments and likes?",
      answer:
        "Workers can react on jobs. Owners and admins can view aggregated reactions for posted jobs, while internal shortlist notes remain owner-side only.",
    },
    {
      question: "How can admin monitor platform health quickly?",
      answer:
        "Use statistics, engagement pulse, job reactions trends, and FAQ guidance section together to understand activity and resolve user issues faster.",
    },
  ];
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="faq-section">
      <div className="faq-header">
        <h2>Frequently Asked Questions</h2>
        <p>Quick answers for workers, owners, and admin operations.</p>
      </div>
      <div className="faq-list">
        {faqs.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <article key={i} className={`faq-item ${isOpen ? "open" : ""}`}>
              <button
                className="faq-question"
                onClick={() => setOpenIndex(isOpen ? -1 : i)}
                type="button"
              >
                <span>{item.question}</span>
                <span className="faq-icon">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && <p className="faq-answer">{item.answer}</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default Faq;
