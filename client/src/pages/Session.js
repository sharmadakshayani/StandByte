import { useState, useEffect, useCallback, useRef } from "react";
import { DISTRACTION_SITES } from "../lib/distractionSites";

function Session({
  seconds,
  setSeconds,
  isActive,
  setIsActive,
  startTimeRef,

  // ✅ Lifted from App.js
  isBreak,
  setIsBreak,
  breakSeconds,
  setBreakSeconds,

  setTotalFocusTime,
  setTotalDistractions,
  siteCountsAsDistraction,
}) {
  const BREAK_LIMIT = 10;

  const [focusLimit, setFocusLimit] = useState(20);
  const [distractions, setDistractions] = useState(0);
  const [showForgivePrompt, setShowForgivePrompt] = useState(false);

  const pendingForgiveRef = useRef(false);
  const breakNotifiedRef = useRef(false);

  // =========================
  // Start / Stop
  // =========================
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setIsActive(true);
  }, [setIsActive, startTimeRef]);

  const stopTimer = useCallback(() => {
    setIsActive(false);
  }, [setIsActive]);

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const resetSession = useCallback(() => {
    setTotalFocusTime((prev) => prev + seconds);

    if (distractions >= 3) setFocusLimit(15);
    else if (distractions === 0) setFocusLimit(25);
    else setFocusLimit(20);

    setSeconds(0);
    setIsBreak(false);
    setBreakSeconds(BREAK_LIMIT);
    setIsActive(false);
    setDistractions(0);
    setShowForgivePrompt(false);
    pendingForgiveRef.current = false;
  }, [
    distractions,
    seconds,
    setSeconds,
    setIsActive,
    setIsBreak,
    setBreakSeconds,
    setTotalFocusTime,
  ]);

  // =========================
  // Focus Timer
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
  // Trigger Break
  // =========================
  useEffect(() => {
    if (seconds >= focusLimit && !isBreak) {
      setIsActive(false);
      setIsBreak(true);
      setBreakSeconds(BREAK_LIMIT);
    }
  }, [seconds, focusLimit, isBreak, setIsActive, setIsBreak, setBreakSeconds]);

  // =========================
  // Break Countdown (Now Persistent)
  // =========================
  useEffect(() => {
    let interval;

    if (isBreak && breakSeconds > 0) {
      interval = setInterval(() => {
        setBreakSeconds((prev) => prev - 1);
      }, 1000);
    }

    if (breakSeconds === 0 && isBreak) {
      resetSession();
    }

    return () => clearInterval(interval);
  }, [isBreak, breakSeconds, resetSession, setBreakSeconds]);

  // =========================
  // Tab Switching Detection
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
  // Keyboard Shortcut
  // =========================
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code !== "Space" || e.repeat) return;

      const tag = e.target.tagName;
      if (["INPUT", "SELECT", "TEXTAREA"].includes(tag)) return;

      e.preventDefault();

      if (isBreak) return;

      if (isActive) stopTimer();
      else startTimer();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, isBreak, startTimer, stopTimer]);

  const handleForgive = (siteId) => {
    if (siteId === "_count") {
      setShowForgivePrompt(false);
      return;
    }

    const dontCount =
      siteId == null || siteCountsAsDistraction[siteId] === false;

    if (dontCount) {
      setDistractions((prev) => Math.max(0, prev - 1));
      setTotalDistractions((prev) => Math.max(0, prev - 1));
    }

    setShowForgivePrompt(false);
  };

  const percentToBreak =
    focusLimit > 0
      ? Math.min(100, Math.round((seconds / focusLimit) * 100))
      : 0;

  // =========================
  // UI
  // =========================
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-75 py-5">
      <div
        className={`card border-0 shadow rounded-3 p-5 text-center w-100 ${
          !isBreak ? "session-panel-focus" : "session-panel-break"
        }`}
        style={{ maxWidth: "420px" }}
      >
        {!isBreak ? (
          <>
            <h2 className="h4 fw-bold mb-2 text-primary">
              Focus Session
            </h2>

            <h1 className="display-5 fw-bold mb-3">
              {formatTime(seconds)}
            </h1>

            <p className="small text-muted mb-3">
              {percentToBreak < 100
                ? `${percentToBreak}% to break`
                : "Break time!"}
            </p>

            <div className="d-flex justify-content-center gap-2">
              {!isActive ? (
                <button
                  className="btn btn-success px-4 rounded-pill"
                  onClick={startTimer}
                >
                  Start
                </button>
              ) : (
                <button
                  className="btn btn-danger px-4 rounded-pill"
                  onClick={stopTimer}
                >
                  Stop
                </button>
              )}

              <button
                className="btn btn-outline-secondary px-4 rounded-pill"
                onClick={resetSession}
              >
                Reset
              </button>
            </div>

            <p className="text-muted small mt-3">
              Distractions:{" "}
              <span className="fw-bold">{distractions}</span>
            </p>
          </>
        ) : (
          <>
            <h2 className="h4 fw-bold mb-2 text-success">
              Break Time
            </h2>

            <h1 className="display-5 fw-bold mb-3">
              {formatTime(breakSeconds)}
            </h1>

            <button
              className="btn btn-outline-secondary px-4 rounded-pill"
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