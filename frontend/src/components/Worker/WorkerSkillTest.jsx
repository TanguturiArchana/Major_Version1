import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config/environment";
import API from "../../services/api";
import "./WorkerSkillTest.css";

const fallbackQuestions = {
  carpentry: [
    { id: 1, question: "Which tool is best for smooth wood finishing?", options: ["Hammer", "Sandpaper", "Drill", "Tape"] },
    { id: 2, question: "In carpentry, plumb means:", options: ["Vertical alignment", "Horizontal level", "Paint coat", "Wood quality"] },
    { id: 3, question: "Best safety practice while cutting wood?", options: ["No gloves", "Close eyes", "Use goggles and gloves", "Work faster"] },
  ],
  building: [
    { id: 1, question: "Concrete curing should ideally continue for:", options: ["1 day", "2 days", "7 days or more", "No curing"] },
    { id: 2, question: "Typical mortar joint thickness in brickwork:", options: ["2 mm", "10 mm", "30 mm", "50 mm"] },
    { id: 3, question: "Before height work, first verify:", options: ["Paint color", "Scaffold stability", "Weather app only", "Phone battery"] },
  ],
  general: [
    { id: 1, question: "What improves owner trust most?", options: ["Late arrival", "Clear communication", "Skipping safety", "No estimate"] },
    { id: 2, question: "How do you avoid rework?", options: ["Rush work", "Confirm requirements", "Skip checks", "Ignore measurements"] },
    { id: 3, question: "Safety on site is:", options: ["Optional", "Only for big projects", "Always mandatory", "Needed once a month"] },
  ],
};

const normalizeSkill = (value) => {
  const v = String(value || "").trim().toLowerCase();
  if (v.includes("carp")) return "carpentry";
  if (v.includes("build")) return "building";
  return "general";
};

const WorkerSkillTest = ({ workerId, defaultSkill }) => {
  const [skill, setSkill] = useState(normalizeSkill(defaultSkill));
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");

  const fallbackForSkill = useMemo(() => fallbackQuestions[skill] || fallbackQuestions.general, [skill]);

  const loadProfiles = async () => {
    if (!workerId) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/skill-tests/worker/${workerId}`);
      setProfiles(res.data || []);
    } catch (e) {
      setProfiles([]);
    }
  };

  const loadQuestions = async () => {
    setLoadingQuestions(true);
    setLoadError("");
    setResult(null);
    setAnswers({});
    try {
      const res = await axios.get(`${API_BASE_URL}/skill-tests/questions`, { params: { skill } });
      const apiQuestions = Array.isArray(res.data) ? res.data : [];
      if (apiQuestions.length === 0) {
        setQuestions(fallbackForSkill);
        setLoadError("Live question bank is unavailable, showing standard questions.");
      } else {
        setQuestions(apiQuestions);
      }
    } catch (e) {
      setQuestions(fallbackForSkill);
      setLoadError("Unable to fetch questions from server. Using standard questions.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    setSkill(normalizeSkill(defaultSkill));
  }, [defaultSkill]);

  useEffect(() => {
    loadQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skill]);

  useEffect(() => {
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workerId]);

  const submit = async () => {
    if (!workerId) {
      setSubmitError("Please login again and retry.");
      return;
    }
    setSavingResult(true);
    setSubmitError("");
    try {
      const res = await API.post(`/skill-tests/submit`, {
        workerId: Number(workerId),
        skill,
        answers,
      });
      setResult(res.data);
      loadProfiles();
    } catch (e) {
      const backendMessage =
        typeof e?.response?.data === "string"
          ? e.response.data
          : e?.response?.data?.message || "";
      setSubmitError(backendMessage || "Could not submit assessment. Please retry.");
    } finally {
      setSavingResult(false);
    }
  };

  return (
    <div className="skill-test-wrap">
      <div className="skill-test-card">
        <div className="skill-test-head">
          <h3>Skill Test and Trust Badge</h3>
          <p>Answer these quick questions to show owners verified capability before selection.</p>
        </div>

        <div className="skill-controls">
          <label htmlFor="skillSelect">Skill track</label>
          <select id="skillSelect" value={skill} onChange={(e) => setSkill(e.target.value)}>
            <option value="carpentry">Carpentry</option>
            <option value="building">Building</option>
            <option value="general">General Work</option>
          </select>
        </div>

        {loadError && <div className="skill-inline-info">{loadError}</div>}

        {loadingQuestions ? (
          <p className="skill-loading">Loading questions...</p>
        ) : (
          <div className="skill-questions">
            {questions.map((q, index) => (
              <div key={q.id} className="skill-question">
                <p className="skill-q-title">{index + 1}. {q.question}</p>
                <div className="skill-options">
                  {(q.options || []).map((opt, idx) => (
                    <label key={idx} className="skill-option">
                      <input
                        type="radio"
                        checked={answers[q.id] === idx}
                        onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: idx }))}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="skill-actions">
          <button className="skill-submit" onClick={submit} disabled={savingResult || loadingQuestions}>
            {savingResult ? "Submitting..." : "Submit Test"}
          </button>
          <button className="skill-refresh" onClick={loadQuestions} disabled={loadingQuestions}>
            Reload Questions
          </button>
        </div>

        {submitError && <p className="skill-error">{submitError}</p>}
        {result && (
          <p className="skill-result">
            Score <strong>{result.score}%</strong> and level <strong>{result.level}</strong>.
          </p>
        )}

        <div className="skill-profiles">
          <h4>My Verified Skills</h4>
          {profiles.length === 0 ? (
            <p>No skill assessments yet.</p>
          ) : (
            profiles.map((p) => (
              <div key={`${p.workerId}-${p.skill}`} className="skill-profile-item">
                <strong>{p.skill}</strong>
                <span>{p.level}</span>
                <span>{p.score}%</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkerSkillTest;
