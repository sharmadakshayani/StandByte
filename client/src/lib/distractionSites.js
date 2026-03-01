/* Default: all these count as distraction. User can set to false for "don't count" (e.g. work use). */
export const DISTRACTION_SITES = [
  { id: "youtube", name: "YouTube" },
  { id: "netflix", name: "Netflix" },
  { id: "spotify", name: "Spotify" },
  { id: "instagram", name: "Instagram" },
  { id: "twitter", name: "Twitter / X" },
  { id: "facebook", name: "Facebook" },
  { id: "reddit", name: "Reddit" },
  { id: "tiktok", name: "TikTok" },
];

export function getDefaultSiteCountsAsDistraction() {
  return DISTRACTION_SITES.reduce((acc, { id }) => ({ ...acc, [id]: true }), {});
}

export function loadSiteSettings() {
  try {
    const raw = localStorage.getItem("standbyte_site_settings");
    if (!raw) return getDefaultSiteCountsAsDistraction();
    const parsed = JSON.parse(raw);
    const defaults = getDefaultSiteCountsAsDistraction();
    return { ...defaults, ...parsed };
  } catch {
    return getDefaultSiteCountsAsDistraction();
  }
}

export function saveSiteSettings(settings) {
  try {
    localStorage.setItem("standbyte_site_settings", JSON.stringify(settings));
  } catch (_) {}
}
