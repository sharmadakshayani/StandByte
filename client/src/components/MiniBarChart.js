import { fmtTimeLong } from "../lib/formatTime";

function MiniBarChart({ data, color = "#4361ee", height = 100 }) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#94a3b8",
          fontSize: 13,
        }}
      >
        No session data yet
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height, padding: "0 4px" }}>
      {data.map((d, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 32,
              height: `${Math.max(4, (d.value / max) * (height - 24))}px`,
              background: `linear-gradient(to top, ${color}, ${color}cc)`,
              borderRadius: "4px 4px 2px 2px",
              transition: "height 0.4s ease",
              minHeight: 4,
            }}
            title={`${d.label}: ${fmtTimeLong(d.value)}`}
          />
          <span style={{ fontSize: 9, color: "#94a3b8", whiteSpace: "nowrap" }}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default MiniBarChart;
