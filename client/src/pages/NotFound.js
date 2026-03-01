import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="py-5 text-center">
      <h1 className="display-4 fw-bold text-muted mb-2">404</h1>
      <p className="lead text-muted mb-4">Page not found.</p>
      <Link to="/" className="btn btn-primary rounded-pill px-4 btn-smooth">
        Back to Dashboard
      </Link>
    </div>
  );
}

export default NotFound;
