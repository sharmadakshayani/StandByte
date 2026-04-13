import { Link } from "react-router-dom";
import { useDocumentTitle } from "../lib/useDocumentTitle";

function NotFound() {
  useDocumentTitle("Page not found");

  return (
    <div className="sb-page-enter" style={{ textAlign: "center", padding: "60px 0" }}>
      <div style={{ fontSize: 64, fontWeight: 800, color: "#cbd5e1", lineHeight: 1 }}>404</div>
      <p style={{ color: "#64748b", fontSize: 18, margin: "12px 0 24px" }}>Page not found.</p>
      <Link to="/" className="sb-btn sb-btn-primary">
        Back to Dashboard
      </Link>
    </div>
  );
}

export default NotFound;
