import { useState } from "react";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { FOCUS_OPTIONS, BREAK_OPTIONS } from "../lib/distractionSites";
import { Icons } from "../lib/Icons";

function Settings({
  focusLimit,
  setFocusLimit,
  breakLimit,
  setBreakLimit,
  proctoredEnabled,
  setProctoredEnabled,
  pomodoroEnabled,
  setPomodoroEnabled,
  pomodoroBlocks,
  setPomodoroBlocks,
  onClearData,
}) {
  useDocumentTitle("Settings");

  const [showConfirm, setShowConfirm] = useState(false);

  const blockOptions = [2, 3, 4, 5, 6, 8, 10];

  return (
    <div className="sb-page-enter">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", margin: 0 }}>Settings</h1>
        <p style={{ color: "#64748b", margin: "4px 0 0" }}>
          Manage your preferences and which sites count as distractions.
        </p>
      </div>

      {/* ── Proctored Mode ── */}
      <div className="sb-settings-card" style={{ marginBottom: 20 }}>
        <div
          className="sb-settings-header"
          style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)" }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
            🔒 Proctored Session Mode
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: 13, opacity: 0.85 }}>
            Strict focus environment with fullscreen lockdown.
          </p>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
            <label className="sb-switch" style={{ flexShrink: 0, marginTop: 2 }}>
              <input
                type="checkbox"
                checked={proctoredEnabled}
                onChange={() => setProctoredEnabled((p) => !p)}
              />
              <span className="sb-switch-slider" />
            </label>
            <div>
              <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                Enable proctored sessions
              </div>
              <p style={{ color: "#64748b", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                When enabled, clicking Start Session will enter fullscreen mode and monitor every
                exit attempt — tab switches, closing the tab, or pressing Escape.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Pomodoro Mode (NEW) ── */}
      <div className="sb-settings-card" style={{ marginBottom: 20 }}>
        <div
          className="sb-settings-header"
          style={{ background: "linear-gradient(135deg, #ea580c, #f97316)" }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
            🍅 Pomodoro Mode
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: 13, opacity: 0.9 }}>
            Multiple back-to-back focus blocks with breaks between them.
          </p>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 16 }}>
            <label className="sb-switch" style={{ flexShrink: 0, marginTop: 2 }}>
              <input
                type="checkbox"
                checked={pomodoroEnabled}
                onChange={() => setPomodoroEnabled((p) => !p)}
              />
              <span className="sb-switch-slider" />
            </label>
            <div>
              <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                Enable Pomodoro mode
              </div>
              <p style={{ color: "#64748b", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
                When enabled, one session is N focus blocks separated by breaks. The whole loop
                must finish for the session to count as completed. When disabled, a session is a
                single focus block with no break — it ends when the timer hits zero.
              </p>
            </div>
          </div>

          {pomodoroEnabled && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #f3f4f6" }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: 8,
                }}
              >
                Focus blocks per session
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {blockOptions.map((n) => (
                  <button
                    key={n}
                    className={`sb-chip ${pomodoroBlocks === n ? "sb-chip-active" : ""}`}
                    onClick={() => setPomodoroBlocks(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 8, fontStyle: "italic" }}>
                Each block = {Math.floor(focusLimit / 60)} min focus + {Math.floor(breakLimit / 60)} min break (last block has no break).
                Total: ~{Math.floor((focusLimit * pomodoroBlocks + breakLimit * (pomodoroBlocks - 1)) / 60)} minutes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Timer Settings ── */}
      <div className="sb-settings-card" style={{ marginBottom: 20 }}>
        <div
          className="sb-settings-header"
          style={{ background: "linear-gradient(135deg, #4361ee, #6c5ce7)" }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Timer Settings</h3>
          <p style={{ margin: "2px 0 0", fontSize: 13, opacity: 0.85 }}>
            Customize focus and break durations.
          </p>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: "#334155",
                marginBottom: 8,
              }}
            >
              Focus Duration
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {FOCUS_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  className={`sb-chip ${focusLimit === o.value ? "sb-chip-active" : ""}`}
                  onClick={() => setFocusLimit(o.value)}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {pomodoroEnabled && (
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: 8,
                }}
              >
                Break Duration{" "}
                <span style={{ color: "#94a3b8", fontWeight: 500, fontSize: 12 }}>
                  (between pomodoro blocks)
                </span>
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {BREAK_OPTIONS.map((o) => (
                  <button
                    key={o.value}
                    className={`sb-chip ${breakLimit === o.value ? "sb-chip-active" : ""}`}
                    onClick={() => setBreakLimit(o.value)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!pomodoroEnabled && (
            <p style={{ color: "#94a3b8", fontSize: 12, fontStyle: "italic", margin: 0 }}>
              Break duration is hidden because Pomodoro mode is off — single sessions don't have a break.
            </p>
          )}
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="sb-settings-card" style={{ borderColor: "#fecaca" }}>
        <div
          className="sb-settings-header"
          style={{ background: "linear-gradient(135deg, #dc2626, #ef4444)" }}
        >
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Danger Zone</h3>
          <p style={{ margin: "2px 0 0", fontSize: 13, opacity: 0.85 }}>
            Reset all your data. This cannot be undone.
          </p>
        </div>
        <div style={{ padding: 24 }}>
          {!showConfirm ? (
            <button className="sb-btn sb-btn-danger" onClick={() => setShowConfirm(true)}>
              {Icons.trash} <span>Clear All Data</span>
            </button>
          ) : (
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ color: "#ef4444", fontSize: 14, fontWeight: 600 }}>Are you sure?</span>
              <button
                className="sb-btn sb-btn-danger"
                onClick={() => {
                  onClearData();
                  setShowConfirm(false);
                }}
              >
                Yes, clear everything
              </button>
              <button className="sb-btn sb-btn-outline" onClick={() => setShowConfirm(false)}>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
