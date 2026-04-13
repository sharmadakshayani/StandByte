import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDocumentTitle } from "../lib/useDocumentTitle";
import { fmtTimeLong } from "../lib/formatTime";
import { Icons } from "../lib/Icons";
import StatsCard from "../components/StatsCard";
import MiniBarChart from "../components/MiniBarChart";

function Dashboard({ analytics, sessions = [] }) {
  useDocumentTitle("Dashboard");

  const {
    totalFocusTime = 0,
    totalDistractions = 0,
    totalTimeAway = 0,
    productiveFocusTime = 0,
    currentStreak = 0,
    bestStreak = 0,
    completedSessions = 0,
  } = analytics || {};

  // ── Helpers ──

  // Format a millisecond duration as "2m 40s" / "45s" / "1h 12m"
  const fmtDurationMs = (ms) => {
    const total = Math.round(ms / 1000);
    if (total < 60) return `${total}s`;
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${s}s`;
  };

  const score =
    totalFocusTime === 0
      ? 0
      : Math.max(0, Math.round((totalFocusTime / (totalFocusTime + totalDistractions * 5)) * 100));

  const isEmpty = totalFocusTime === 0 && totalDistractions === 0 && sessions.length === 0;

  const chartData = useMemo(() => {
    const last7 = sessions.slice(-7);
    return last7.map((s, i) => ({
      label: `#${sessions.length - (last7.length - 1 - i)}`,
      value: s.focusTime,
    }));
  }, [sessions]);

  const distractChart = useMemo(() => {
    const last7 = sessions.slice(-7);
    return last7.map((s, i) => ({
      label: `#${sessions.length - (last7.length - 1 - i)}`,
      value: s.distractions,
    }));
  }, [sessions]);

  const bestSession = sessions.length > 0 ? Math.max(...sessions.map((s) => s.focusTime)) : 0;

  // "useful work" hours = productive focus time, formatted in hours
  const productiveHours = (productiveFocusTime / 3600).toFixed(1);

  return (
    <div className="sb-page-enter">
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 className="sb-hero-title">StandByte Analytics</h1>
        <p style={{ color: "#64748b", fontSize: 16, margin: "4px 0 0" }}>
          Track your focus time and productivity at a glance.
        </p>
        <p style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>
          Every session counts — stay consistent.
        </p>
      </div>

      {isEmpty ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div className="sb-empty-card">
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
            <p style={{ color: "#64748b", marginBottom: 16 }}>
              No sessions yet. Start your first focus session to see your stats here.
            </p>
            <Link to="/session" className="sb-btn sb-btn-primary">
              Start your first session
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Hero stats: Streak + Productive hours */}
          <div className="sb-hero-stats">
            <div className="sb-hero-stat sb-hero-streak">
              <div className="sb-hero-stat-icon">🔥</div>
              <div>
                <div className="sb-hero-stat-val">{currentStreak}</div>
                <div className="sb-hero-stat-label">
                  Current Streak {currentStreak === 1 ? "session" : "sessions"}
                </div>
                {bestStreak > 0 && (
                  <div className="sb-hero-stat-sub">Best: {bestStreak}</div>
                )}
              </div>
            </div>
            <div className="sb-hero-stat sb-hero-hours">
              <div className="sb-hero-stat-icon">⏱</div>
              <div>
                <div className="sb-hero-stat-val">{productiveHours}h</div>
                <div className="sb-hero-stat-label">Useful Work Done</div>
                <div className="sb-hero-stat-sub">
                  {completedSessions} session{completedSessions !== 1 ? "s" : ""} completed
                </div>
              </div>
            </div>
          </div>

          <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, marginBottom: 16, marginTop: 32 }}>
            Cumulative from all sessions
          </p>

          <div className="sb-stats-grid">
            <StatsCard
              icon={Icons.clock}
              label="Total Focus Time"
              value={fmtTimeLong(totalFocusTime)}
              gradient="linear-gradient(145deg, #fff 0%, #e8ecfe 100%)"
              accent="#4361ee"
              delay={0}
            />
            <StatsCard
              icon={Icons.xCircle}
              label="Total Distractions"
              value={totalDistractions}
              subtitle={totalTimeAway > 0 ? `${fmtDurationMs(totalTimeAway)} lost to distractions` : null}
              gradient="linear-gradient(145deg, #fff 0%, #fce4e9 100%)"
              accent="#ef476f"
              delay={80}
            />
            <StatsCard
              icon={Icons.spark}
              label="Productivity Score"
              value={`${score}%`}
              gradient="linear-gradient(145deg, #fff 0%, #d4f5eb 100%)"
              accent="#059669"
              delay={160}
            />
          </div>

          <div className="sb-stats-grid" style={{ marginTop: 16 }}>
            <StatsCard
              icon={Icons.bolt}
              label="Total Sessions"
              value={sessions.length}
              gradient="linear-gradient(145deg, #fff 0%, #fff0d9 100%)"
              accent="#d97706"
              delay={240}
            />
            <StatsCard
              icon={Icons.chart}
              label="Best Session"
              value={fmtTimeLong(bestSession)}
              gradient="linear-gradient(145deg, #fff 0%, #ede9fe 100%)"
              accent="#7c3aed"
              delay={320}
            />
            <StatsCard
              icon={Icons.spark}
              label="Productive Time"
              value={fmtTimeLong(productiveFocusTime)}
              gradient="linear-gradient(145deg, #fff 0%, #cffafe 100%)"
              accent="#0891b2"
              delay={400}
            />
          </div>

          {sessions.length > 1 && (
            <div className="sb-charts-row">
              <div className="sb-chart-card">
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 12 }}>
                  Focus Time (Recent Sessions)
                </h3>
                <MiniBarChart data={chartData} color="#4361ee" height={90} />
              </div>
              <div className="sb-chart-card">
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#334155", marginBottom: 12 }}>
                  Distractions (Recent Sessions)
                </h3>
                <MiniBarChart data={distractChart} color="#ef476f" height={90} />
              </div>
            </div>
          )}

          {sessions.length > 0 && (
            <div className="sb-history-card">
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#334155", marginBottom: 12 }}>
                Session History
              </h3>
              <div className="sb-history-list">
                {[...sessions].reverse().slice(0, 10).map((s, i) => {
                  return (
                    <div key={s.id || i} className="sb-history-row-v2">
                      <div className="sb-history-row-main">
                        <span className="sb-history-num">#{sessions.length - i}</span>
                        <span style={{ color: "#4361ee", fontWeight: 600 }}>
                          {fmtTimeLong(s.focusTime)}
                        </span>
                        <span style={{ color: "#94a3b8", fontSize: 12 }}>|</span>
                        <span style={{ color: s.distractions > 0 ? "#ef476f" : "#059669", fontSize: 13 }}>
                          {s.distractions} distraction{s.distractions !== 1 ? "s" : ""}
                          {s.timeAway > 0 && (
                            <span style={{ color: "#94a3b8", fontWeight: 400 }}>
                              {" "}({fmtDurationMs(s.timeAway)} away)
                            </span>
                          )}
                        </span>
                        {s.completed === false && (
                          <span style={{
                            background: "#fef2f2",
                            color: "#dc2626",
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 10,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}>
                            ended early
                          </span>
                        )}
                        {s.proctored && (
                          <span style={{
                            background: "#0f172a",
                            color: "#cbd5e1",
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 10,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}>
                            🔒 proctored
                          </span>
                        )}
                        {s.pomodoro && (
                          <span style={{
                            background: "#fff7ed",
                            color: "#c2410c",
                            border: "1px solid #fdba74",
                            fontSize: 10,
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: 10,
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}>
                            🍅 {s.blocksCompleted || 1}× pomodoro
                          </span>
                        )}
                        <span style={{ marginLeft: "auto", color: "#cbd5e1", fontSize: 11 }}>
                          {new Date(s.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
