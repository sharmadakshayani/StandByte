import CircularProgress from "./CircularProgress";
import { fmtTime } from "../lib/formatTime";

function BreakModal({ breakSeconds, breakLimit, onSkip }) {
  const progress = breakLimit > 0 ? (breakLimit - breakSeconds) / breakLimit : 0;

  return (
    <div className="sb-modal-overlay">
      <div className="sb-break-modal">
        <div style={{ fontSize: 40, marginBottom: 8 }}>🧘</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#059669", margin: "0 0 4px" }}>
          Break Time!
        </h2>
        <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 20px" }}>
          Stand up, stretch, hydrate.
        </p>

        <CircularProgress
          progress={progress}
          size={160}
          stroke={8}
          color="#059669"
          trackColor="#d1fae5"
        >
          <span style={{ fontSize: 36, fontWeight: 800, color: "#059669" }}>
            {fmtTime(breakSeconds)}
          </span>
        </CircularProgress>

        <p style={{ color: "#94a3b8", fontSize: 13, margin: "16px 0" }}>
          Break ends in {breakSeconds}s
        </p>

        <button className="sb-btn sb-btn-outline" onClick={onSkip}>
          Skip Break
        </button>
      </div>
    </div>
  );
}

export default BreakModal;
