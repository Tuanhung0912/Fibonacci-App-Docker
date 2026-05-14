import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Fib.css";

// API base URL: dùng biến môi trường trên Render, fallback về "/api" cho Docker local
const API_URL = process.env.REACT_APP_API_URL || "/api";

const Fib = () => {
  const [seenIndexes, setSeenIndexes] = useState([]);
  const [values, setValues] = useState({});
  const [index, setIndex] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchValues();
    fetchIndexes();
  }, []);

  const fetchValues = async () => {
    try {
      const res = await axios.get(`${API_URL}/values/current`);
      setValues(res.data);
    } catch (err) {
      console.error("Failed to fetch values:", err);
    }
  };

  const fetchIndexes = async () => {
    try {
      const res = await axios.get(`${API_URL}/values/all`);
      setSeenIndexes(res.data);
    } catch (err) {
      console.error("Failed to fetch indexes:", err);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!index || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await axios.post(`${API_URL}/values`, { index });
      setIndex("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      // Refresh data
      await Promise.all([fetchValues(), fetchIndexes()]);
    } catch (err) {
      console.error("Failed to submit:", err);
    }
    setIsSubmitting(false);
  };

  const renderSeenIndexes = () => {
    if (seenIndexes.length === 0) return null;
    return seenIndexes.map(({ number }) => number).join(", ");
  };

  const renderValues = () => {
    const entries = Object.entries(values);
    if (entries.length === 0) return null;

    return entries.map(([key, val], i) => (
      <div
        className="result-card"
        key={key}
        style={{ animationDelay: `${i * 0.08}s` }}
      >
        <div className="result-index">
          <span className="result-label">Index</span>
          <span className="result-number">{key}</span>
        </div>
        <div className="result-arrow">→</div>
        <div className="result-value">
          <span className="result-label">Fibonacci</span>
          <span className="result-number">{val}</span>
        </div>
      </div>
    ));
  };

  return (
    <div className="fib-container">
      {/* Hero Section */}
      <div className="fib-hero">
        <h1 className="fib-title">
          <span className="fib-title-icon">✨</span>
          Fibonacci Calculator
        </h1>
        <p className="fib-subtitle">
          Enter an index (0–40) to calculate its Fibonacci value
        </p>
      </div>

      {/* Input Card */}
      <div className="fib-input-card">
        <form onSubmit={handleSubmit} className="fib-form">
          <div className="input-wrapper">
            <input
              className="fib-input"
              type="number"
              min="0"
              max="40"
              placeholder="Enter index..."
              value={index}
              onChange={(e) => setIndex(e.target.value)}
              disabled={isSubmitting}
            />
            <button
              className={`fib-button ${isSubmitting ? "loading" : ""}`}
              type="submit"
              disabled={isSubmitting || !index}
            >
              {isSubmitting ? (
                <span className="spinner" />
              ) : (
                <>Calculate</>
              )}
            </button>
          </div>
          {showSuccess && (
            <div className="success-toast">
              <span>✓</span> Submitted! Calculating...
            </div>
          )}
        </form>
      </div>

      {/* Results Grid */}
      <div className="fib-results-grid">
        {/* Seen Indexes */}
        <div className="fib-section">
          <div className="section-header">
            <span className="section-icon">📋</span>
            <h3 className="section-title">Seen Indexes</h3>
            {seenIndexes.length > 0 && (
              <span className="section-badge">{seenIndexes.length}</span>
            )}
          </div>
          <div className="section-body">
            {seenIndexes.length > 0 ? (
              <div className="index-chips">
                {seenIndexes.map(({ number }, i) => (
                  <span
                    className="index-chip"
                    key={i}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    {number}
                  </span>
                ))}
              </div>
            ) : (
              <p className="empty-state">No indexes submitted yet</p>
            )}
          </div>
        </div>

        {/* Calculated Values */}
        <div className="fib-section">
          <div className="section-header">
            <span className="section-icon">🧮</span>
            <h3 className="section-title">Calculated Values</h3>
            {Object.keys(values).length > 0 && (
              <span className="section-badge">{Object.keys(values).length}</span>
            )}
          </div>
          <div className="section-body">
            {Object.keys(values).length > 0 ? (
              <div className="results-list">{renderValues()}</div>
            ) : (
              <p className="empty-state">No calculations yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fib;
