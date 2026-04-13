import { useState, useEffect, useRef } from "react";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { fmtTime, fmtTimeLong } from "../lib/formatTime";
import { Icons } from "../lib/Icons";
import {
  requestFullscreen,
  exitFullscreen,
  isFullscreen,
  addFullscreenChangeListener,
  removeFullscreenChangeListener,
} from "../lib/fullscreen";
import CircularProgress from "../components/CircularProgress";
import BreakModal from "../components/BreakModal";
import ProctorMode from "../components/ProctorMode";
import EscapeWarning from "../components/EscapeWarning";

const SHORT_SWITCH_MS = 3000;
const TOAST_DURATION_MS = 3000;

function Session({
  seconds,
  setSeconds,
  isActive,
  setIsActive,
  startTimeRef,
  setTotalFocusTime,
  setTotalDistractions,
  addTimeAway,
  recordCompletedSession,
  breakStreak,
  addSessionRecord,
  focusLimit,
  setFocusLimit,
  breakLimit,
  proctoredEnabled,
  pomodoroEnabled,
  pomodoroBlocks,
  pendingSettingsMessage,
  clearPendingSettingsMessage,
}) {
  useDocumentTitle(isActive ? `${fmtTime(seconds)} — Focus` : "Session");

  // Per-block state (resets each focus block in pomodoro mode)
  const [distractions, setDistractions] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [breakSeconds, setBreakSeconds] = useState(breakLimit);

  // Pomodoro state — current block index (0-based) and number of blocks for THIS run
  const [currentBlock, setCurrentBlock] = useState(0);
  const [totalBlocks, setTotalBlocks] = useState(1);
  // Cumulative across all blocks of the current pomodoro run
  const [cumulativeFocusTime, setCumulativeFocusTime] = useState(0);
  const [cumulativeDistractions, setCumulativeDistractions] = useState(0);
  const [cumulativeTimeAway, setCumulativeTimeAway] = useState(0);

  // Modal/overlay flags
  const [showProctor, setShowProctor] = useState(false);
  const [showEscapeWarning, setShowEscapeWarning] = useState(false);
  const [isProctoredSession, setIsProctoredSession] = useState(false);
  const [fullscreenBlocked, setFullscreenBlocked] = useState(false);
  const [toast, setToast] = useState(null);
  const [sessionTimeAway, setSessionTimeAway] = useState(0); // ms during current block

  const leaveAtRef = useRef(null);
  const breakNotifiedRef = useRef(false);
  const intentionalFsExitRef = useRef(false);

  function showToast(message, kind = "info") {
    setToast({ message, kind, key: Date.now() });
    setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }

  // ─── Consume pending settings-change message from App.js ───
  // App.js auto-pauses the timer when proctored/pomodoro settings change
  // mid-session and stashes a message for us to display. When we mount or
  // when a new message appears, show it as a toast and clear it.
  useEffect(() => {
    if (!pendingSettingsMessage) return;

    showToast(pendingSettingsMessage, "warning");

    // If proctored just turned OFF while we were in a proctored session,
    // exit fullscreen and downgrade so the next Resume continues normally
    if (!proctoredEnabled && isProctoredSession) {
      if (isFullscreen()) {
        intentionalFsExitRef.current = true;
        exitFullscreen().catch(() => {});
      }
      setIsProctoredSession(false);
    }

    // If pomodoro just turned OFF, collapse back to a single block
    if (!pomodoroEnabled) {
      setCurrentBlock(0);
      setTotalBlocks(1);
    }

    // If pomodoro is now ON, the in-progress block becomes block 1 of N
    if (pomodoroEnabled) {
      setCurrentBlock(0);
      setTotalBlocks(pomodoroBlocks);
    }

    clearPendingSettingsMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingSettingsMessage]);

  // ─── Sync break duration when not actively in break ───
  useEffect(() => {
    if (!isBreak) setBreakSeconds(breakLimit);
  }, [breakLimit, isBreak]);

  // ─── Focus timer (counts up while active and not on break) ───
  useEffect(() => {
    if (!isActive || isBreak) return;
    const interval = setInterval(() => {
      const diff = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setSeconds(diff);
    }, 250);
    return () => clearInterval(interval);
  }, [isActive, isBreak, setSeconds, startTimeRef]);

  // ─── Focus block reaches its limit → break or finish ───
  useEffect(() => {
    if (seconds >= focusLimit && isActive && !isBreak) {
      handleBlockComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, focusLimit, isActive, isBreak]);

  // ─── Break countdown ───
  useEffect(() => {
    if (!isBreak || breakSeconds <= 0) return;
    const interval = setInterval(() => setBreakSeconds((p) => p - 1), 1000);
    return () => clearInterval(interval);
  }, [isBreak, breakSeconds]);

  // ─── Break end → start next focus block ───
  useEffect(() => {
    if (breakSeconds === 0 && isBreak) {
      handleBreakEnd();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakSeconds, isBreak]);

  // ─── Browser notification when break starts ───
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
        });
      } catch (_) {}
    } else if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [isBreak]);

  // ─── Tab switch detection (no prompt — just toast) ───
  useEffect(() => {
    const handler = async () => {
      if (document.hidden && isActive && !isBreak) {
        leaveAtRef.current = Date.now();
      } else if (!document.hidden && leaveAtRef.current != null) {
        const awayMs = Date.now() - leaveAtRef.current;
        leaveAtRef.current = null;

        // Always track time-away
        setSessionTimeAway((prev) => prev + awayMs);
        addTimeAway(awayMs);

        if (isProctoredSession) {
          // Proctored: every departure counts no matter the duration
          setDistractions((p) => p + 1);
          setTotalDistractions();
          showToast("Stay focused — you're in a proctored session", "warning");
          if (!isFullscreen()) {
            try { await requestFullscreen(document.documentElement); } catch (_) {}
          }
        } else {
          // Normal: only count if away >= 3s
          const seconds = Math.round(awayMs / 1000);
          if (awayMs < SHORT_SWITCH_MS) {
            showToast(`${seconds}s away — short, no penalty`, "ok");
            return;
          }
          setDistractions((p) => p + 1);
          setTotalDistractions();
          showToast(`Tab switch counted as distraction (${seconds}s away)`, "warning");
        }
      }
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [isActive, isBreak, isProctoredSession, setTotalDistractions, addTimeAway]);

  // ─── ESC / fullscreen exit → strict warning ───
  useEffect(() => {
    if (!isProctoredSession || !isActive || isBreak) return;

    const handler = () => {
      if (!isFullscreen()) {
        if (intentionalFsExitRef.current) {
          intentionalFsExitRef.current = false;
          return;
        }
        setIsActive(false);
        setShowEscapeWarning(true);
      }
    };

    addFullscreenChangeListener(handler);
    return () => removeFullscreenChangeListener(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProctoredSession, isActive, isBreak]);

  // ─── Block right-click in proctored mode ───
  useEffect(() => {
    if (!isProctoredSession || !isActive) return;
    const handler = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handler);
    return () => document.removeEventListener("contextmenu", handler);
  }, [isProctoredSession, isActive]);

  // ─── beforeunload guard ───
  useEffect(() => {
    if (!isActive || isBreak) return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "You're in the middle of a focus session. Leave anyway?";
      return e.returnValue;
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isActive, isBreak]);

  // ─── Keyboard shortcuts ───
  useEffect(() => {
    const handler = (e) => {
      if (e.code !== "Space" || e.repeat) return;
      const t = e.target;
      if (t.tagName === "INPUT" || t.tagName === "SELECT" || t.tagName === "TEXTAREA") return;
      if (showProctor || showEscapeWarning || isBreak) return;
      e.preventDefault();
      if (isActive) stopTimer();
      else if (!isProctoredSession) startTimer();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, isBreak, showProctor, showEscapeWarning, isProctoredSession]);

  // ─── Cleanup on unmount ───
  useEffect(() => {
    return () => {
      if (isFullscreen()) {
        intentionalFsExitRef.current = true;
        exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // ─── Timer controls ───
  async function startTimer() {
    // Fresh start of a new session — initialize pomodoro state
    if (currentBlock === 0 && cumulativeFocusTime === 0 && seconds === 0) {
      setTotalBlocks(pomodoroEnabled ? pomodoroBlocks : 1);
    }

    if (proctoredEnabled && !isProctoredSession) {
      try {
        await requestFullscreen(document.documentElement);
        setIsProctoredSession(true);
        setFullscreenBlocked(false);
      } catch (err) {
        setFullscreenBlocked(true);
        return;
      }
    }
    startTimeRef.current = Date.now() - seconds * 1000;
    setIsActive(true);
  }

  function stopTimer() {
    setIsActive(false);
  }

  async function resumeProctoredFullscreen() {
    if (isProctoredSession && !isFullscreen()) {
      try { await requestFullscreen(document.documentElement); } catch (_) {}
    }
    if (!isActive) {
      startTimeRef.current = Date.now() - seconds * 1000;
      setIsActive(true);
    }
  }

  // ─── Block completion logic ───
  // Called when seconds >= focusLimit. Decides whether to break or finish.
  function handleBlockComplete() {
    setIsActive(false);

    // Roll the just-completed block's stats into the cumulative totals
    const newCumFocus = cumulativeFocusTime + seconds;
    const newCumDistractions = cumulativeDistractions + distractions;
    const newCumTimeAway = cumulativeTimeAway + sessionTimeAway;
    setCumulativeFocusTime(newCumFocus);
    setCumulativeDistractions(newCumDistractions);
    setCumulativeTimeAway(newCumTimeAway);

    // Add this block's focus time to the global total now (so dashboard updates)
    setTotalFocusTime(seconds);

    const isLastBlock = currentBlock + 1 >= totalBlocks;

    if (isLastBlock) {
      // Final block of pomodoro (or only block if pomodoro off) — finish session
      finishSession({
        completed: true,
        focusOverride: newCumFocus,
        distractionsOverride: newCumDistractions,
        timeAwayOverride: newCumTimeAway,
        blocksDone: currentBlock + 1,
      });
    } else {
      // More blocks to go — start a break
      setIsBreak(true);
      setBreakSeconds(breakLimit);
    }
  }

  // ─── Break end → start next focus block ───
  function handleBreakEnd() {
    setIsBreak(false);
    setBreakSeconds(breakLimit);

    // Reset per-block state and increment block index
    setSeconds(0);
    setDistractions(0);
    setSessionTimeAway(0);
    setCurrentBlock((p) => p + 1);

    // Auto-start the next block
    startTimeRef.current = Date.now();
    setIsActive(true);
  }

  function skipBreak() {
    handleBreakEnd();
  }

  // finishSession — end the whole session (pomodoro complete OR ended early)
  function finishSession({
    completed = false,
    focusOverride = null,
    distractionsOverride = null,
    timeAwayOverride = null,
    blocksDone = null,
  } = {}) {
    // Use override values when provided (for natural pomodoro completion);
    // otherwise compute from current state (for early-quit cases).
    const totalFocus = focusOverride != null
      ? focusOverride
      : cumulativeFocusTime + (isBreak ? 0 : seconds);
    const totalDistr = distractionsOverride != null
      ? distractionsOverride
      : cumulativeDistractions + (isBreak ? 0 : distractions);
    const totalAway = timeAwayOverride != null
      ? timeAwayOverride
      : cumulativeTimeAway + (isBreak ? 0 : sessionTimeAway);
    const blocks = blocksDone != null ? blocksDone : currentBlock + (isBreak ? 1 : 1);

    // For early quits, we still need to add the in-progress block's focus time
    // to the cumulative analytics (it was never counted)
    if (focusOverride == null && !isBreak && seconds > 0) {
      setTotalFocusTime(seconds);
    }

    if (totalFocus > 0) {
      addSessionRecord({
        focusTime: totalFocus,
        distractions: totalDistr,
        timeAway: totalAway,
        proctored: isProctoredSession,
        completed,
        pomodoro: pomodoroEnabled,
        blocksCompleted: blocks,
        timestamp: Date.now(),
      });
    }

    if (completed && totalFocus > 0) {
      recordCompletedSession(totalFocus);
    } else if (totalFocus > 0) {
      breakStreak();
    }

    if (totalDistr >= 3) {
      setFocusLimit(Math.max(900, focusLimit - 300));
    } else if (completed && totalDistr === 0) {
      setFocusLimit(Math.min(3600, focusLimit + 300));
    }

    if (isFullscreen()) {
      intentionalFsExitRef.current = true;
      exitFullscreen().catch(() => {});
    }

    // Reset everything
    setSeconds(0);
    setIsBreak(false);
    setBreakSeconds(breakLimit);
    setIsActive(false);
    setDistractions(0);
    setSessionTimeAway(0);
    setCurrentBlock(0);
    setTotalBlocks(1);
    setCumulativeFocusTime(0);
    setCumulativeDistractions(0);
    setCumulativeTimeAway(0);
    setShowProctor(false);
    setShowEscapeWarning(false);
    setIsProctoredSession(false);
    setToast(null);
    leaveAtRef.current = null;
  }

  function resetSession() {
    finishSession({ completed: false });
  }

  function handleEndSessionClick() {
    if (isProctoredSession) {
      setShowProctor(true);
    } else {
      finishSession({ completed: false });
    }
  }

  // ─── ProctorMode (breathing gate) callbacks ───
  async function handleReturnToFocus() {
    setShowProctor(false);
    if (isProctoredSession && !isFullscreen()) {
      try { await requestFullscreen(document.documentElement); } catch (_) {}
    }
  }

  function handleLeaveSession() {
    setShowProctor(false);
    finishSession({ completed: false });
  }

  // ─── ESC warning callbacks ───
  async function handleEscapeReturn() {
    setShowEscapeWarning(false);
    setDistractions((p) => p + 1);
    setTotalDistractions();
    if (isProctoredSession && !isFullscreen()) {
      try { await requestFullscreen(document.documentElement); } catch (_) {}
    }
    startTimeRef.current = Date.now() - seconds * 1000;
    setIsActive(true);
  }

  function handleEscapeQuit() {
    setShowEscapeWarning(false);
    finishSession({ completed: false });
  }

  // ─── Derived ───
  const focusProgress = focusLimit > 0 ? Math.min(1, seconds / focusLimit) : 0;
  const breakProgress = breakLimit > 0 ? (breakLimit - breakSeconds) / breakLimit : 0;
  const pctToBreak = Math.min(100, Math.round(focusProgress * 100));

  // ═════════════════════════════════════════════
  // RENDER: PROCTORED SHELL
  // ═════════════════════════════════════════════
  if (isProctoredSession) {
    return (
      <>
        {showProctor && (
          <ProctorMode
            progress={focusProgress}
            secondsElapsed={seconds}
            focusLimit={focusLimit}
            onReturnToFocus={handleReturnToFocus}
            onLeaveSession={handleLeaveSession}
          />
        )}
        {showEscapeWarning && (
          <EscapeWarning
            secondsElapsed={seconds}
            focusLimit={focusLimit}
            onReturn={handleEscapeReturn}
            onQuit={handleEscapeQuit}
          />
        )}

        <div className={`sb-proctored-shell ${isBreak ? "sb-proctored-shell-break" : ""}`}>
          <div className="sb-proctored-bg">
            <div className="sb-orb sb-orb-1" />
            <div className="sb-orb sb-orb-2" />
            <div className="sb-orb sb-orb-3" />
          </div>

          {toast && (
            <div key={toast.key} className={`sb-toast sb-toast-${toast.kind}`}>
              {toast.message}
            </div>
          )}

          <div className="sb-proctored-topbar">
            <div className="sb-proctored-lock">🔒 Proctored Focus Session</div>
            <div className="sb-proctored-target">
              {pomodoroEnabled
                ? `Block ${currentBlock + 1} of ${totalBlocks} · ${fmtTimeLong(focusLimit)}`
                : `Target: ${fmtTimeLong(focusLimit)}`}
            </div>
          </div>

          <div className="sb-proctored-center">
            <div className="sb-proctored-label">{isBreak ? "BREAK TIME" : "DEEP WORK"}</div>

            {isBreak ? (
              <>
                <div className="sb-proctored-timer sb-proctored-timer-break">
                  {fmtTime(breakSeconds)}
                </div>
                <div className="sb-proctored-progress-track">
                  <div
                    className="sb-proctored-progress-fill sb-proctored-progress-fill-break"
                    style={{ width: `${breakProgress * 100}%` }}
                  />
                </div>
                <div className="sb-proctored-progress-label">
                  Break · next block starts automatically
                </div>
                <div className="sb-proctored-controls">
                  <button className="sb-btn sb-btn-success" onClick={skipBreak}>
                    Skip break
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="sb-proctored-timer">{fmtTime(seconds)}</div>
                <div className="sb-proctored-progress-track">
                  <div
                    className="sb-proctored-progress-fill"
                    style={{ width: `${pctToBreak}%` }}
                  />
                </div>
                <div className="sb-proctored-progress-label">
                  {pctToBreak}% to {pomodoroEnabled && currentBlock + 1 < totalBlocks ? "break" : "complete"} ·{" "}
                  {fmtTimeLong(Math.max(0, focusLimit - seconds))} remaining
                </div>
                <div className="sb-proctored-controls">
                  {!isActive ? (
                    <button className="sb-btn sb-btn-primary" onClick={resumeProctoredFullscreen}>
                      {Icons.play} <span>Resume</span>
                    </button>
                  ) : (
                    <button className="sb-btn sb-btn-outline-light" onClick={stopTimer}>
                      {Icons.pause} <span>Pause</span>
                    </button>
                  )}
                  <button className="sb-btn sb-btn-ghost-light" onClick={handleEndSessionClick}>
                    End session
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="sb-proctored-statusbar">
            <div className="sb-proctored-stat">
              <span className="sb-proctored-stat-label">Distractions</span>
              <span className="sb-proctored-stat-val" style={{ color: distractions > 0 ? "#f87171" : "#4ade80" }}>
                {distractions}
              </span>
            </div>
            {pomodoroEnabled && (
              <div className="sb-proctored-stat">
                <span className="sb-proctored-stat-label">Pomodoro Block</span>
                <span className="sb-proctored-stat-val" style={{ color: "#60a5fa" }}>
                  {currentBlock + 1} / {totalBlocks}
                </span>
              </div>
            )}
            <div className="sb-proctored-stat">
              <span className="sb-proctored-stat-label">Status</span>
              <span className="sb-proctored-stat-val" style={{ color: isActive ? "#4ade80" : isBreak ? "#fbbf24" : "#fbbf24" }}>
                {isBreak ? "Break" : isActive ? "Active" : "Paused"}
              </span>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ═════════════════════════════════════════════
  // RENDER: NORMAL SESSION
  // ═════════════════════════════════════════════
  return (
    <div
      className="sb-page-enter"
      style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}
    >
      {isBreak && (
        <BreakModal
          breakSeconds={breakSeconds}
          breakLimit={breakLimit}
          onSkip={skipBreak}
        />
      )}

      {/* Distraction toast (only renders in normal mode; proctored mode has its own) */}
      {toast && (
        <div key={toast.key} className={`sb-toast sb-toast-light sb-toast-${toast.kind}`}>
          {toast.message}
        </div>
      )}

      <div className="sb-session-card">
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#4361ee", margin: "0 0 4px" }}>
          {pomodoroEnabled ? `Pomodoro · Block ${currentBlock + 1} of ${totalBlocks}` : "Focus Session"}
        </h2>
        <p style={{ color: "#64748b", fontSize: 13, margin: "0 0 8px" }}>
          Target: {fmtTimeLong(focusLimit)}
          {pomodoroEnabled && ` per block · ${fmtTimeLong(breakLimit)} break`}
        </p>

        {proctoredEnabled && (
          <div style={{
            background: "linear-gradient(90deg, #fef3c7, #fffbeb)",
            border: "1px solid #fcd34d",
            color: "#78350f",
            borderRadius: 10,
            padding: "8px 12px",
            fontSize: 12,
            marginBottom: 16,
            fontWeight: 500,
          }}>
            🔒 Proctored mode enabled — Start will enter fullscreen
          </div>
        )}

        {pomodoroEnabled && (
          <div style={{
            background: "linear-gradient(90deg, #fff7ed, #fef3c7)",
            border: "1px solid #fdba74",
            color: "#9a3412",
            borderRadius: 10,
            padding: "8px 12px",
            fontSize: 12,
            marginBottom: 16,
            fontWeight: 500,
          }}>
            🍅 Pomodoro mode 
          </div>
        )}

        {fullscreenBlocked && (
          <div style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#991b1b",
            borderRadius: 10,
            padding: "8px 12px",
            fontSize: 12,
            marginBottom: 16,
          }}>
            Fullscreen was denied. Allow fullscreen or disable proctored mode in Settings.
          </div>
        )}

        <CircularProgress
          progress={focusProgress}
          size={200}
          stroke={10}
          color="#4361ee"
          trackColor="#e8ecfe"
        >
          <span style={{ fontSize: 40, fontWeight: 800, color: "#4361ee" }}>{fmtTime(seconds)}</span>
        </CircularProgress>

        <p style={{ color: "#94a3b8", fontSize: 13, margin: "16px 0 12px" }}>
          {pctToBreak < 100 ? `${pctToBreak}% to ${pomodoroEnabled && currentBlock + 1 < totalBlocks ? "break" : "complete"}` : "Done!"}
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
          {!isActive ? (
            <button className="sb-btn sb-btn-primary" onClick={startTimer}>
              {Icons.play} <span>Start</span>
            </button>
          ) : (
            <button className="sb-btn sb-btn-danger" onClick={stopTimer}>
              {Icons.pause} <span>Pause</span>
            </button>
          )}
          <button className="sb-btn sb-btn-outline" onClick={resetSession}>
            {Icons.reset} <span>Reset</span>
          </button>
        </div>

        <p style={{ color: "#94a3b8", fontSize: 12, margin: "16px 0 4px" }}>
          Press{" "}
          <kbd style={{ background: "#e2e8f0", padding: "1px 6px", borderRadius: 4, fontSize: 11 }}>
            Space
          </kbd>{" "}
          to start/pause
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 10, fontSize: 13 }}>
          <span style={{ color: "#64748b" }}>
            Distractions:{" "}
            <span style={{ fontWeight: 700, color: distractions > 0 ? "#ef476f" : "#059669" }}>
              {distractions}
            </span>
          </span>
        </div>

        {distractions >= 3 && (
          <div className="sb-alert-danger">Too many tab switches! Try to stay focused.</div>
        )}
      </div>
    </div>
  );
}

export default Session;
