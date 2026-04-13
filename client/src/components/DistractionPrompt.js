import { useEffect, useState } from "react";
import { DISTRACTION_SITES } from "../lib/distractionSites";

/**
 * DistractionPrompt — non-blocking banner that asks "Where did you go?"
 * when the user returns to the tab after leaving during a (non-proctored)
 * session. Slides in from the top, auto-dismisses after 10 seconds.
 *
 * Props:
 *   awayMs          — how long the user was away (for display)
 *   onLabel(source) — user picked a source ("YouTube", "Other", ...)
 *   onWorkRelated() — user picked "Work-related" → distraction forgiven
 *   onDismiss()     — 10s elapsed or user clicked X → logs "Unknown"
 */

const AUTO_DISMISS_MS = 10000;

function fmtAway(ms) {
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}m ${rem}s`;
}

function DistractionPrompt({ awayMs, onLabel, onWorkRelated, onDismiss }) {
  const [remaining, setRemaining] = useState(AUTO_DISMISS_MS);
  const [selected, setSelected] = useState("");

  // Countdown for the auto-dismiss timer (updates the shrinking progress bar)
  useEffect(() => {
    const startedAt = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const left = Math.max(0, AUTO_DISMISS_MS - elapsed);
      setRemaining(left);
      if (left === 0) {
        clearInterval(tick);
        onDismiss();
      }
    }, 100);
    return () => clearInterval(tick);
  }, [onDismiss]);

  const handleSubmit = () => {
    if (!selected) return;
    if (selected === "__work__") {
      onWorkRelated();
    } else {
      onLabel(selected);
    }
  };

  const progress = (remaining / AUTO_DISMISS_MS) * 100;

  return (
    <div className="sb-distraction-prompt">
      <div className="sb-distraction-prompt-inner">
        <div className="sb-distraction-prompt-text">
          <strong>Where did you go?</strong>
          <span className="sb-distraction-prompt-meta">away for {fmtAway(awayMs)}</span>
        </div>

        <select
          className="sb-distraction-prompt-select"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Pick a source…</option>
          <option value="__work__">✓ Work-related (don't count)</option>
          {DISTRACTION_SITES.map(({ id, name }) => (
            <option key={id} value={name}>
              {name}
            </option>
          ))}
          <option value="Other">Other</option>
        </select>

        <button
          className="sb-btn sb-btn-sm sb-btn-primary"
          onClick={handleSubmit}
          disabled={!selected}
        >
          Log
        </button>

        <button
          className="sb-distraction-prompt-close"
          onClick={onDismiss}
          aria-label="Dismiss"
          title="Dismiss"
        >
          ×
        </button>
      </div>

      {/* Shrinking progress bar showing time until auto-dismiss */}
      <div className="sb-distraction-prompt-bar" style={{ width: `${progress}%` }} />
    </div>
  );
}

export default DistractionPrompt;
