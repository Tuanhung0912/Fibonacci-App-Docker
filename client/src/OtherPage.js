import React from "react";
import { Link } from "react-router-dom";
import "./OtherPage.css";

const OtherPage = () => {
  return (
    <div className="other-page">
      <div className="other-page-card">
        <div className="other-page-icon">📄</div>
        <h2 className="other-page-title">Other Page</h2>
        <p className="other-page-text">
          This is a secondary page to demonstrate React Router navigation
          in a multi-container Docker application.
        </p>
        <Link to="/" className="other-page-link">
          <span>←</span> Back to Calculator
        </Link>
      </div>
    </div>
  );
};

export default OtherPage;
