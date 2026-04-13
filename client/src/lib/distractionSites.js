// Config constants — site list and duration options.
// Persistence moved to the backend (see lib/api.js and server/src/routes/settings.js).

export const DISTRACTION_SITES = [
  { id: "youtube", name: "YouTube", icon: "▶" },
  { id: "netflix", name: "Netflix", icon: "🎬" },
  { id: "spotify", name: "Spotify", icon: "🎵" },
  { id: "instagram", name: "Instagram", icon: "📷" },
  { id: "twitter", name: "Twitter / X", icon: "𝕏" },
  { id: "facebook", name: "Facebook", icon: "f" },
  { id: "reddit", name: "Reddit", icon: "⬆" },
  { id: "tiktok", name: "TikTok", icon: "♪" },
];

export const FOCUS_OPTIONS = [
  { label: "15 min", value: 900 },
  { label: "25 min", value: 1500 },
  { label: "30 min", value: 1800 },
  { label: "45 min", value: 2700 },
  { label: "60 min", value: 3600 },
];

export const BREAK_OPTIONS = [
  { label: "3 min", value: 180 },
  { label: "5 min", value: 300 },
  { label: "10 min", value: 600 },
  { label: "15 min", value: 900 },
];
