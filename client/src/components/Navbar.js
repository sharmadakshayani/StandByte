import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();

  const navLinkClass = (path) => {
    const isActive = location.pathname === path;
    return `nav-link px-3 py-2 rounded ${isActive ? "active fw-semibold" : ""}`;
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-standbyte">
      <div className="container">
        <Link className="navbar-brand fw-bold fs-5 me-4 d-flex align-items-center" to="/">
          <span className="bg-white bg-opacity-15 rounded-pill px-2 py-1 me-2">⚡</span>
          StandByte
        </Link>
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto gap-2 gap-lg-3 align-items-center">
            <li className="nav-item">
              <Link className={navLinkClass("/")} to="/">
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className={`btn btn-sm px-3 py-2 rounded-pill btn-smooth ${location.pathname === "/session" ? "btn-warning text-dark" : "btn-outline-light"}`}
                to="/session"
              >
                Start Session
              </Link>
            </li>
            <li className="nav-item">
              <Link className={navLinkClass("/settings")} to="/settings">
                Settings
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
