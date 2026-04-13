import { useState } from "react";

function ForgivePrompt({ sites, siteSettings, onForgive, onCount }) {
  const [selected, setSelected] = useState("");

  return (
    <div className="sb-forgive">
      <div style={{ fontSize: 13, fontWeight: 600, color: "#92400e", marginBottom: 8 }}>
        ⚠️ Tab switch detected — was that work-related?
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <select
          className="sb-select"
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value);
            if (e.target.value) onForgive(e.target.value);
          }}
        >
          <option value="">Where were you?</option>
          {sites.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <button className="sb-btn sb-btn-sm sb-btn-success" onClick={() => onForgive(null)}>
          Don&apos;t count
        </button>
        <button className="sb-btn sb-btn-sm sb-btn-outline" onClick={onCount}>
          Count it
        </button>
      </div>
    </div>
  );
}

export default ForgivePrompt;
