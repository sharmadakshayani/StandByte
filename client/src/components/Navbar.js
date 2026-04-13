import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icons } from "../lib/Icons";

function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sb-nav">
      <div className="sb-nav-inner">
        <Link className="sb-brand" to="/" onClick={() => setMenuOpen(false)}>
          <span className="sb-brand-icon">{Icons.bolt}</span>
          StandByte
        </Link>

        <button className="sb-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>

        <div className={`sb-nav-links ${menuOpen ? "open" : ""}`}>
          <Link
            className={`sb-nav-link ${isActive("/") ? "active" : ""}`}
            to="/"
            onClick={() => setMenuOpen(false)}
          >
            {Icons.home} Dashboard
          </Link>
          <Link
            className={`sb-nav-cta ${isActive("/session") ? "active" : ""}`}
            to="/session"
            onClick={() => setMenuOpen(false)}
          >
            {Icons.bolt} Start Session
          </Link>
          <Link
            className={`sb-nav-link ${isActive("/settings") ? "active" : ""}`}
            to="/settings"
            onClick={() => setMenuOpen(false)}
          >
            {Icons.gear} Settings
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
