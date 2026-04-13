import { useState, useEffect, useRef } from "react";

/**
 * ProctorMode — the "are you sure you want to quit?" gate.
 * Shown ONLY when the user explicitly clicks "End session" during a
 * proctored session. Provides a 10-second breathing exercise + motivational
 * messages so the user has time to reconsider before quitting.
 *
 * Two exits:
 *   1. Return to focus  (primary, pulsing — re-enters fullscreen)
 *   2. End session anyway  (secondary, requires confirmation)
 *
 * "I needed that for work" is gone — that flow is for tab switches, which
 * are now handled separately in Session.js (silent count + forced re-entry).
 */

const MIN_UNSKIPPABLE_MS = 5000; // can't click anything for first 5s
const BREATH_CYCLE_MS = 10000;   // 5s in + 5s out

const EARLY_MESSAGES = [
  "You just started. The first few minutes are the hardest — stay with it.",
  "Momentum builds fast. Don't break it this early.",
  "The work you do in the first 10 minutes sets the tone for the rest.",
];

const MID_MESSAGES = [
  "You're in the zone right now. That's rare. Don't waste it.",
  "The work you do now is the leverage you'll have tomorrow.",
  "Future you is watching. Make them proud.",
  "Every minute of deep focus is worth an hour of distracted work.",
];

const LATE_MESSAGES = [
  "You're almost there. Don't quit at the last mile.",
  "You're 80% done. The finish line is right there.",
  "Everything you've built so far — don't throw it away now.",
  "The best part of a session is finishing it. You're so close.",
];

function pickMessage(progress) {
  const pool = progress < 0.33 ? EARLY_MESSAGES : progress < 0.75 ? MID_MESSAGES : LATE_MESSAGES;
  return pool[Math.floor(Math.random() * pool.length)];
}

function ProctorMode({
  progress,
  secondsElapsed,
  focusLimit,
  onReturnToFocus,
  onLeaveSession,
}) {
  const [breathPhase, setBreathPhase] = useState("in");
  const [canInteract, setCanInteract] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const messageRef = useRef(pickMessage(progress));

  // Unskippable delay
  useEffect(() => {
    const t = setTimeout(() => setCanInteract(true), MIN_UNSKIPPABLE_MS);
    return () => clearTimeout(t);
  }, []);

  // Breathing cycle
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathPhase((p) => (p === "in" ? "out" : "in"));
    }, BREATH_CYCLE_MS / 2);
    return () => clearInterval(interval);
  }, []);

  // Block ESC from dismissing
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") e.preventDefault();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const minutesLeft = Math.max(0, Math.ceil((focusLimit - secondsElapsed) / 60));
  const percentDone = Math.round(progress * 100);

  return (
    <div className="sb-proctor-overlay">
      <div className="sb-proctor-inner">
        {/* Breathing circle */}
        <div className="sb-breath-wrap">
          <div className={`sb-breath-circle sb-breath-${breathPhase}`} />
          <div className="sb-breath-label">
            {breathPhase === "in" ? "Breathe in" : "Breathe out"}
          </div>
        </div>

        {/* Progress context */}
        <div className="sb-proctor-progress">
          You're {percentDone}% into this session — {minutesLeft} min left
        </div>

        {/* Motivational message */}
        <p className="sb-proctor-message">"{messageRef.current}"</p>

        {/* Actions */}
        {!showLeaveConfirm && (
          <div className="sb-proctor-actions">
            <button
              className={`sb-btn sb-btn-primary sb-btn-pulse ${!canInteract ? "sb-btn-disabled" : ""}`}
              onClick={canInteract ? onReturnToFocus : undefined}
              disabled={!canInteract}
            >
              Return to focus
            </button>

            <button
              className={`sb-proctor-leave ${!canInteract ? "sb-btn-disabled" : ""}`}
              onClick={canInteract ? () => setShowLeaveConfirm(true) : undefined}
              disabled={!canInteract}
            >
              End session anyway
            </button>

            {!canInteract && (
              <p className="sb-proctor-wait">
                Take a breath. You can continue in a moment.
              </p>
            )}
          </div>
        )}

        {/* Leave confirmation */}
        {showLeaveConfirm && (
          <div className="sb-proctor-form">
            <p className="sb-proctor-confirm-text">
              You'll lose the rest of this session. Your progress so far will still be saved.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 12 }}>
              <button className="sb-btn sb-btn-danger" onClick={onLeaveSession}>
                Yes, end session
              </button>
              <button
                className="sb-btn sb-btn-primary"
                onClick={() => setShowLeaveConfirm(false)}
              >
                No, keep focusing
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProctorMode;
