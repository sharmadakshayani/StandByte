import { useState, useEffect, useCallback, useRef } from "react";
import { DISTRACTION_SITES } from "../lib/distractionSites";

function Session({
  seconds,
  setSeconds,
  isActive,
  setIsActive,
  startTimeRef,
  setTotalFocusTime,
  setTotalDistractions,
  siteCountsAsDistraction,
  focusLimit,
  setFocusLimit,
  isBreak,
  setIsBreak,
  breakSeconds,
  setBreakSeconds,
  distractions,
  setDistractions,
}) {
  const BREAK_LIMIT = 10;
  const [showForgivePrompt, setShowForgivePrompt] = useState(false);
  const pendingForgiveRef = useRef(false);
  const breakNotifiedRef = useRef(false);

  // =========================
  // Focus Timer (Persistent)
  // =========================
  useEffect(() => {
    let interval;

    if (isActive && !isBreak) {
      interval = setInterval(() => {
        const diff = Math.floor(
          (Date.now() - startTimeRef.current) / 1000
        );
        setSeconds(diff);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, isBreak, setSeconds, startTimeRef]);

  // =========================
  // Trigger Break + browser notification
  // =========================
  useEffect(() => {
    if (seconds >= focusLimit) {
      setIsActive(false);
      setIsBreak(true);
      setBreakSeconds(BREAK_LIMIT);
    }
  }, [seconds, focusLimit, setIsActive]);

  useEffect(() => {
    if (!isBreak) {
      breakNotifiedRef.current = false;
      return;
    }
    if (breakNotifiedRef.current) return;
    breakNotifiedRef.current = true;

    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("StandByte — Break time", {
          body: "Stand up and stretch. You earned it!",
          icon: "/favicon.ico",
        });
      } catch (_) {}
    } else if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().then((p) => {
        if (p === "granted") {
          try {
            new Notification("StandByte — Break time", {
              body: "Stand up and stretch. You earned it!",
              icon: "/favicon.ico",
            });
          } catch (_) {}
        }
      });
    }
  }, [isBreak]);

  // =========================
  // Detect Tab Switching + update global total in real time
  // =========================
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isActive && !isBreak) {
        setDistractions((prev) => prev + 1);
        setTotalDistractions((prev) => prev + 1);
        pendingForgiveRef.current = true;
      }
      if (!document.hidden && pendingForgiveRef.current) {
        setShowForgivePrompt(true);
        pendingForgiveRef.current = false;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () =>
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
  }, [isActive, isBreak, setTotalDistractions]);

  // =========================
  // Adaptive Reset Logic
  // =========================
  const resetSession = useCallback(() => {
    setTotalFocusTime((prev) => prev + seconds);

    if (distractions >= 3) {
      setFocusLimit(15);
    } else if (distractions === 0) {
      setFocusLimit(25);
    } else {
      setFocusLimit(20);
    }

    setSeconds(0);
    setIsBreak(false);
    setBreakSeconds(BREAK_LIMIT);
    setIsActive(false);
    setDistractions(0);
    setShowForgivePrompt(false);
    pendingForgiveRef.current = false;
  }, [distractions, seconds, setSeconds, setIsActive, setTotalFocusTime, setFocusLimit, setIsBreak, setBreakSeconds, setDistractions]);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setIsActive(true);
  }, [setIsActive]);

  const stopTimer = useCallback(() => {
    setIsActive(false);
  }, [setIsActive]);

  // =========================
  // Keyboard: Space to Start / Pause
  // =========================
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code !== "Space" || e.repeat) return;
      const target = e.target;
      if (target.tagName === "INPUT" || target.tagName === "SELECT" || target.tagName === "TEXTAREA") return;
      e.preventDefault();
      if (isBreak) return;
      if (isActive) {
        stopTimer();
      } else {
        startTimer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, isBreak, startTimer, stopTimer]);

  const handleForgive = (siteId) => {
    if (siteId === "_count") {
      setShowForgivePrompt(false);
      return;
    }
    const dontCount = siteId == null || siteCountsAsDistraction[siteId] === false;
    if (dontCount) {
      setDistractions((prev) => Math.max(0, prev - 1));
      setTotalDistractions((prev) => Math.max(0, prev - 1));
    }
    setShowForgivePrompt(false);
  };

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const focusProgress = Math.min(1, focusLimit > 0 ? seconds / focusLimit : 0);
  const breakProgress = BREAK_LIMIT > 0 ? (BREAK_LIMIT - breakSeconds) / BREAK_LIMIT : 0;
  const percentToBreak = focusLimit > 0 ? Math.min(100, Math.round((seconds / focusLimit) * 100)) : 0;

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-75 py-5">
      <div
        className={`card border-0 shadow rounded-3 p-5 text-center w-100 card-hover ${!isBreak ? "session-panel-focus" : "session-panel-break"}`}
        style={{ maxWidth: "420px" }}
      >
        {showForgivePrompt && !isBreak && (
          <div className="forgive-banner rounded-3 p-3 mb-4 text-start">
            <p className="small fw-semibold mb-2">Tab switch detected. Was that work-related?</p>
            <div className="d-flex flex-wrap gap-2 align-items-center">
              <select
                className="form-select form-select-sm w-auto"
                id="forgive-site"
                onChange={(e) => {
                  const id = e.target.value;
                  if (id) handleForgive(id);
                }}
              >
                <option value="">Where were you?</option>
                {DISTRACTION_SITES.map(({ id, name }) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
              <button
                type="button"
                className="btn btn-sm btn-success btn-smooth"
                onClick={() => handleForgive(null)}
              >
                Don&apos;t count
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary btn-smooth"
                onClick={() => handleForgive("_count")}
              >
                Count it
              </button>
            </div>
          </div>
        )}

        {!isBreak ? (
          <>
            <h2 className="h4 fw-bold mb-1 text-primary">Focus Session</h2>
            <p className="text-muted small mb-4">Current focus target: {focusLimit} seconds</p>

            <div
              className="progress-ring progress-ring-focus"
              style={{ "--progress": focusProgress }}
            >
              <span className="progress-ring-inner text-primary">
                {formatTime(seconds)}
              </span>
            </div>

            <p className="small text-muted mb-2">
              {percentToBreak < 100 ? `${percentToBreak}% to break` : "Break time!"}
            </p>

            <div className="d-flex justify-content-center gap-2 flex-wrap">
              {!isActive ? (
                <button
                  className="btn btn-success px-4 rounded-pill btn-smooth"
                  onClick={startTimer}
                >
                  Start
                </button>
              ) : (
                <button
                  className="btn btn-danger px-4 rounded-pill btn-smooth"
                  onClick={stopTimer}
                >
                  Stop
                </button>
              )}
              <button
                className="btn btn-outline-secondary px-4 rounded-pill btn-smooth"
                onClick={resetSession}
              >
                Reset
              </button>
            </div>

            <p className="text-muted small mt-3 mb-0">Tip: Stay on this tab to count focus time.</p>

            <p className="text-muted small mt-2 mb-0">
              Distractions: <span className="fw-bold text-dark">{distractions}</span>
            </p>

            {distractions >= 3 && (
              <div className="alert alert-danger rounded-3 mt-3 mb-0">
                Too many tab switches! Stay focused.
              </div>
            )}
          </>
        ) : (
          <>
            <h2 className="h4 fw-bold mb-1 text-success">Break Time</h2>
            <p className="text-muted small mb-4">Stand up and stretch...</p>

            <div
              className="progress-ring progress-ring-break"
              style={{ "--progress": breakProgress }}
            >
              <span className="progress-ring-inner text-success">
                {formatTime(breakSeconds)}
              </span>
            </div>

            <p className="small text-muted mb-3">Break ends in {breakSeconds}s</p>

            <button
              className="btn btn-outline-secondary px-4 rounded-pill btn-smooth"
              onClick={resetSession}
            >
              Reset
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Session;
