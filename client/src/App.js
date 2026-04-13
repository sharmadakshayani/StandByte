import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useRef, useCallback, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/dashboard";
import Session from "./pages/Session";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { api } from "./lib/api";

const EMPTY_ANALYTICS = {
  totalFocusTime: 0,
  totalDistractions: 0,
  productiveFocusTime: 0,
  currentStreak: 0,
  bestStreak: 0,
  completedSessions: 0,
};

const DEFAULT_SETTINGS = {
  focusLimit: 1500,
  breakLimit: 300,
  proctoredEnabled: false,
  pomodoroEnabled: false,
  pomodoroBlocks: 4,
};

function App() {
  // ── Server-backed state ──
  const [analytics, setAnalyticsState] = useState(EMPTY_ANALYTICS);
  const [sessions, setSessionsState] = useState([]);
  const [settings, setSettingsState] = useState(DEFAULT_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(null);

  // ── Timer state (purely client-side, does NOT go to the backend) ──
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const startTimeRef = useRef(null);

  // ── Pending settings-change notice (consumed by Session.js) ──
  // When a session is in progress and the user toggles proctored or pomodoro
  // (typically by visiting the Settings page), App.js auto-pauses the timer
  // and stashes a message here. Session.js reads it on mount or render and
  // displays it as a toast, then clears it.
  const [pendingSettingsMessage, setPendingSettingsMessage] = useState(null);
  const prevProctoredRef = useRef(null); // null = not yet seen
  const prevPomodoroRef = useRef(null);
  const prevPomodoroBlocksRef = useRef(null);

  // ─── Initial load from backend ───
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [a, s, cfg] = await Promise.all([
          api.getAnalytics(),
          api.getSessions(),
          api.getSettings(),
        ]);
        if (cancelled) return;
        setAnalyticsState(a);
        setSessionsState(s);
        // Merge with defaults so missing fields (e.g. from a stale server)
        // fall back to sensible values instead of undefined
        setSettingsState({ ...DEFAULT_SETTINGS, ...cfg });
        setServerError(null);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to load from backend:", err);
        setServerError(
          "Couldn't reach the StandByte server. Make sure it's running on port 4000 (cd server && npm start)."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Auto-pause when proctored/pomodoro settings change mid-session ───
  // App.js holds the timer state (isActive) and the settings, and unlike
  // Session.js it never unmounts when the user navigates between pages.
  // So this is the right place to detect "settings changed while a session
  // was running" — even if the user is currently on /settings or /dashboard.
  useEffect(() => {
    if (loading) return;

    const prevProctored = prevProctoredRef.current;
    const prevPomodoro = prevPomodoroRef.current;
    const prevBlocks = prevPomodoroBlocksRef.current;

    // First call after settings finish loading: just record the values, no action
    if (prevProctored === null) {
      prevProctoredRef.current = settings.proctoredEnabled;
      prevPomodoroRef.current = settings.pomodoroEnabled;
      prevPomodoroBlocksRef.current = settings.pomodoroBlocks;
      return;
    }

    const proctoredChanged = prevProctored !== settings.proctoredEnabled;
    const pomodoroChanged = prevPomodoro !== settings.pomodoroEnabled;
    const blocksChanged = prevBlocks !== settings.pomodoroBlocks;

    // Update the refs to the new values
    prevProctoredRef.current = settings.proctoredEnabled;
    prevPomodoroRef.current = settings.pomodoroEnabled;
    prevPomodoroBlocksRef.current = settings.pomodoroBlocks;

    if (!proctoredChanged && !pomodoroChanged && !blocksChanged) return;

    // Only auto-pause if a session is actually in progress
    const sessionInProgress = isActive || seconds > 0;
    if (!sessionInProgress) return;

    // Pause the timer
    setIsActive(false);

    // Build a friendly explanation message
    const changes = [];
    if (proctoredChanged) changes.push(settings.proctoredEnabled ? "proctored on" : "proctored off");
    if (pomodoroChanged) changes.push(settings.pomodoroEnabled ? "pomodoro on" : "pomodoro off");
    if (blocksChanged && !pomodoroChanged) changes.push(`pomodoro: ${settings.pomodoroBlocks} blocks`);

    setPendingSettingsMessage(
      `Settings changed (${changes.join(", ")}) — session paused. Click Resume to continue.`
    );
  }, [
    settings.proctoredEnabled,
    settings.pomodoroEnabled,
    settings.pomodoroBlocks,
    loading,
    // Intentionally NOT depending on isActive/seconds — we only want to fire
    // when settings change, not when the timer ticks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ]);

  // ─── Mutators (talk to backend, then sync local state from response) ───

  const setTotalDistractions = useCallback(async () => {
    try {
      const updated = await api.incrementDistraction();
      setAnalyticsState(updated);
    } catch (err) {
      console.error("incrementDistraction failed:", err);
    }
  }, []);

  const setTotalFocusTime = useCallback(async (seconds) => {
    try {
      const updated = await api.addFocusTime(seconds);
      setAnalyticsState(updated);
    } catch (err) {
      console.error("addFocusTime failed:", err);
    }
  }, []);

  const addTimeAway = useCallback(async (ms) => {
    try {
      const updated = await api.addTimeAway(ms);
      setAnalyticsState(updated);
    } catch (err) {
      console.error("addTimeAway failed:", err);
    }
  }, []);

  const recordCompletedSession = useCallback(async (focusTimeSeconds) => {
    try {
      const updated = await api.recordCompletion(focusTimeSeconds);
      setAnalyticsState(updated);
    } catch (err) {
      console.error("recordCompletion failed:", err);
    }
  }, []);

  const breakStreak = useCallback(async () => {
    try {
      const updated = await api.breakStreak();
      setAnalyticsState(updated);
    } catch (err) {
      console.error("breakStreak failed:", err);
    }
  }, []);

  const addSessionRecord = useCallback(async (record) => {
    try {
      const created = await api.createSession(record);
      setSessionsState((prev) => [...prev, created]);
    } catch (err) {
      console.error("createSession failed:", err);
    }
  }, []);

  // ── Settings ──
  const updateSetting = useCallback(async (patch) => {
    // Optimistic update for instant UI feedback
    setSettingsState((prev) => ({ ...prev, ...patch }));
    try {
      const updated = await api.updateSettings(patch);
      // Merge server response into existing state instead of replacing it.
      // This protects against stale servers that don't know about new fields:
      // any field the server doesn't return stays at its optimistic value.
      setSettingsState((prev) => ({ ...prev, ...updated }));
    } catch (err) {
      console.error("updateSettings failed:", err);
    }
  }, []);

  const setFocusLimit = useCallback(
    (next) => {
      const value =
        typeof next === "function" ? next(settings.focusLimit) : next;
      updateSetting({ focusLimit: value });
    },
    [settings.focusLimit, updateSetting]
  );

  const setBreakLimit = useCallback(
    (next) => {
      const value =
        typeof next === "function" ? next(settings.breakLimit) : next;
      updateSetting({ breakLimit: value });
    },
    [settings.breakLimit, updateSetting]
  );

  const setProctoredEnabled = useCallback(
    (next) => {
      const value =
        typeof next === "function" ? next(settings.proctoredEnabled) : next;
      updateSetting({ proctoredEnabled: value });
    },
    [settings.proctoredEnabled, updateSetting]
  );

  const setPomodoroEnabled = useCallback(
    (next) => {
      const value =
        typeof next === "function" ? next(settings.pomodoroEnabled) : next;
      updateSetting({ pomodoroEnabled: value });
    },
    [settings.pomodoroEnabled, updateSetting]
  );

  const setPomodoroBlocks = useCallback(
    (next) => {
      const value =
        typeof next === "function" ? next(settings.pomodoroBlocks) : next;
      updateSetting({ pomodoroBlocks: value });
    },
    [settings.pomodoroBlocks, updateSetting]
  );

  // ── Clear all ──
  const handleClearData = useCallback(async () => {
    try {
      await Promise.all([api.resetAnalytics(), api.clearSessions()]);
      setAnalyticsState(EMPTY_ANALYTICS);
      setSessionsState([]);
      setSeconds(0);
      setIsActive(false);
    } catch (err) {
      console.error("clearData failed:", err);
    }
  }, []);

  // ─── Loading / error screens ───
  if (loading) {
    return (
      <div className="sb-app">
        <div className="sb-loading-screen">
          <div className="sb-loading-spinner" />
          <p>Loading StandByte…</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="sb-app">
        <Navbar />
        {serverError && (
          <div className="sb-server-error">
            <strong>⚠️ Server not connected.</strong> {serverError}
          </div>
        )}
        <main className="sb-main">
          <Routes>
            <Route
              path="/"
              element={<Dashboard analytics={analytics} sessions={sessions} />}
            />
            <Route
              path="/session"
              element={
                <Session
                  seconds={seconds}
                  setSeconds={setSeconds}
                  isActive={isActive}
                  setIsActive={setIsActive}
                  startTimeRef={startTimeRef}
                  setTotalFocusTime={setTotalFocusTime}
                  setTotalDistractions={setTotalDistractions}
                  addTimeAway={addTimeAway}
                  recordCompletedSession={recordCompletedSession}
                  breakStreak={breakStreak}
                  addSessionRecord={addSessionRecord}
                  focusLimit={settings.focusLimit}
                  setFocusLimit={setFocusLimit}
                  breakLimit={settings.breakLimit}
                  proctoredEnabled={settings.proctoredEnabled}
                  pomodoroEnabled={settings.pomodoroEnabled}
                  pomodoroBlocks={settings.pomodoroBlocks}
                  pendingSettingsMessage={pendingSettingsMessage}
                  clearPendingSettingsMessage={() => setPendingSettingsMessage(null)}
                />
              }
            />
            <Route
              path="/settings"
              element={
                <Settings
                  focusLimit={settings.focusLimit}
                  setFocusLimit={setFocusLimit}
                  breakLimit={settings.breakLimit}
                  setBreakLimit={setBreakLimit}
                  proctoredEnabled={settings.proctoredEnabled}
                  setProctoredEnabled={setProctoredEnabled}
                  pomodoroEnabled={settings.pomodoroEnabled}
                  setPomodoroEnabled={setPomodoroEnabled}
                  pomodoroBlocks={settings.pomodoroBlocks}
                  setPomodoroBlocks={setPomodoroBlocks}
                  onClearData={handleClearData}
                />
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
