const STORAGE_KEY = "standbyte_analytics";

export function loadAnalytics() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { totalFocusTime: 0, totalDistractions: 0 };
    const parsed = JSON.parse(raw);
    return {
      totalFocusTime: Number(parsed.totalFocusTime) || 0,
      totalDistractions: Number(parsed.totalDistractions) || 0,
    };
  } catch {
    return { totalFocusTime: 0, totalDistractions: 0 };
  }
}

export function saveAnalytics({ totalFocusTime, totalDistractions }) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        totalFocusTime: Number(totalFocusTime) || 0,
        totalDistractions: Number(totalDistractions) || 0,
      })
    );
  } catch (_) {}
}
