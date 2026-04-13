// ═══════════════════════════════════════════════════
// API client — talks to the StandByte backend
// ═══════════════════════════════════════════════════
//
// Every function here is async and returns a Promise.
// The backend URL is controlled by REACT_APP_API_URL (defaults to :4000).

const API_BASE =
  process.env.REACT_APP_API_URL || "http://localhost:4000/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ─── Analytics ───
export const api = {
  // Analytics
  getAnalytics: () => request("/analytics"),
  incrementDistraction: () =>
    request("/analytics/distraction", { method: "POST" }),
  addFocusTime: (seconds) =>
    request("/analytics/focus-time", { method: "POST", body: { seconds } }),
  addTimeAway: (ms) =>
    request("/analytics/time-away", { method: "POST", body: { ms } }),
  recordCompletion: (seconds) =>
    request("/analytics/complete", { method: "POST", body: { seconds } }),
  breakStreak: () => request("/analytics/break-streak", { method: "POST" }),
  resetAnalytics: () => request("/analytics/reset", { method: "POST" }),

  // Sessions
  getSessions: () => request("/sessions"),
  createSession: (session) =>
    request("/sessions", { method: "POST", body: session }),
  clearSessions: () => request("/sessions", { method: "DELETE" }),

  // Settings
  getSettings: () => request("/settings"),
  updateSettings: (patch) =>
    request("/settings", { method: "PATCH", body: patch }),

  // Health
  health: () => request("/health"),
};
