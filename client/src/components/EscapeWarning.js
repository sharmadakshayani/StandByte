import { fmtTime } from "../lib/formatTime";

/**
 * EscapeWarning — shown when the user presses Escape during a proctored session.
 * Strict, urgent UI. Two choices: return (re-enters fullscreen, distraction +1)
 * or quit (ends session, breaks streak).
 */
function EscapeWarning({ secondsElapsed, focusLimit, onReturn, onQuit }) {
  const minutesLeft = Math.max(0, Math.ceil((focusLimit - secondsElapsed) / 60));

  return (
    <div className="sb-escape-overlay">
      <div className="sb-escape-card">
        <div className="sb-escape-icon">⚠️</div>
        <h2 className="sb-escape-title">You pressed Escape</h2>
        <p className="sb-escape-subtitle">
          You're trying to leave a proctored session.
        </p>

        <div className="sb-escape-stats">
          <div className="sb-escape-stat">
            <div className="sb-escape-stat-val">{fmtTime(secondsElapsed)}</div>
            <div className="sb-escape-stat-label">elapsed</div>
          </div>
          <div className="sb-escape-divider" />
          <div className="sb-escape-stat">
            <div className="sb-escape-stat-val">{minutesLeft}m</div>
            <div className="sb-escape-stat-label">remaining</div>
          </div>
        </div>

        <div className="sb-escape-warning-box">
          If you quit now, your <strong>streak will reset to zero</strong> and this
          session will be marked incomplete.
        </div>

        <div className="sb-escape-actions">
          <button className="sb-btn sb-btn-primary sb-btn-pulse sb-escape-btn-return" onClick={onReturn}>
            ← Return to focus
          </button>
          <button className="sb-btn sb-escape-btn-quit" onClick={onQuit}>
            Quit and break streak
          </button>
        </div>
      </div>
    </div>
  );
}

export default EscapeWarning;
