import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import OtherPage from "./OtherPage";
import Fib from "./Fib";

function NavLink({ to, children }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`nav-link ${isActive ? "active" : ""}`}>
      {children}
    </Link>
  );
}

function AppContent() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <span className="nav-brand">Fibonacci</span>
        <div className="nav-spacer" />
        <NavLink to="/">Home</NavLink>
        <NavLink to="/otherpage">Other Page</NavLink>
      </header>
      <main className="App-content">
        <Routes>
          <Route path="/" element={<Fib />} />
          <Route path="/otherpage" element={<OtherPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
