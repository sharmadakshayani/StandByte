import { useState, useEffect } from "react";
import { DISTRACTION_SITES } from "../lib/distractionSites";

function Settings({ siteCountsAsDistraction, setSiteCountsAsDistraction }) {
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    if (!savedMessage) return;
    const t = setTimeout(() => setSavedMessage(false), 2000);
    return () => clearTimeout(t);
  }, [savedMessage]);

  const handleToggle = (id) => {
    setSiteCountsAsDistraction((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    setSavedMessage(true);
  };

  return (
    <div className="py-4">
      <div className="mb-4">
        <h1 className="h2 fw-bold mb-2">Settings</h1>
        <p className="text-muted mb-0">Manage your preferences and which sites count as distractions.</p>
      </div>

      <div className="card border-0 shadow-sm rounded-3 overflow-hidden card-hover">
        <div className="card-header bg-primary text-white py-3">
          <h5 className="mb-0 fw-semibold">Sites that don&apos;t count as distraction</h5>
          <p className="small mb-0 opacity-90">Turn off for sites you use for work (e.g. music, tutorials).</p>
        </div>
        <div className="card-body p-4">
          <p className="text-muted small mb-2">
            When you switch tabs during a focus session, we ask if it was work-related. Sites marked as &quot;don&apos;t count&quot; below won&apos;t add to your distraction total when you choose them in the prompt.
          </p>
          {savedMessage && (
            <p className="small text-success mb-3">Saved.</p>
          )}
          <div className="row g-3">
            {DISTRACTION_SITES.map(({ id, name }) => (
              <div key={id} className="col-12 col-md-6">
                <div className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-light border">
                  <span className="fw-medium">{name}</span>
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`site-${id}`}
                      checked={siteCountsAsDistraction[id] !== false}
                      onChange={() => handleToggle(id)}
                    />
                    <label className="form-check-label small text-muted" htmlFor={`site-${id}`}>
                      {siteCountsAsDistraction[id] !== false ? "Count as distraction" : "Don't count"}
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
