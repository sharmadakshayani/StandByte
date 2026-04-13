function StatsCard({ icon, label, value, subtitle, gradient, accent, delay = 0 }) {
  return (
    <div
      className="sb-stat-card"
      style={{
        background: gradient,
        borderLeft: `4px solid ${accent}`,
        animationDelay: `${delay}ms`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: `${accent}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: accent,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 0.8,
              color: "#64748b",
              marginBottom: 2,
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: accent, lineHeight: 1.1 }}>
            {value}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 11,
                color: "#64748b",
                marginTop: 4,
                fontWeight: 500,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatsCard;
