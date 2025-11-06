import React from "react";
import "./Faq.css";

const Faq = () => {
  const questions = [
    "How do I register as a worker?",
    "How do employers post jobs?",
    "Is there a service fee?",
    "How can I contact support?",
  ];

  return (
    <section className="faq-section">
      <h2>FAQs</h2>
      <ul>
        {questions.map((q, i) => (
          <li key={i}> {q}</li>
        ))}
      </ul>
    </section>
  );
};

export default Faq;
