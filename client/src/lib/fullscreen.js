/**
 * Cross-browser fullscreen helpers.
 * The Fullscreen API has different vendor prefixes across browsers.
 */

export function requestFullscreen(element = document.documentElement) {
  if (element.requestFullscreen) return element.requestFullscreen();
  if (element.webkitRequestFullscreen) return element.webkitRequestFullscreen();
  if (element.mozRequestFullScreen) return element.mozRequestFullScreen();
  if (element.msRequestFullscreen) return element.msRequestFullscreen();
  return Promise.reject(new Error("Fullscreen API not supported"));
}

export function exitFullscreen() {
  if (document.exitFullscreen) return document.exitFullscreen();
  if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
  if (document.mozCancelFullScreen) return document.mozCancelFullScreen();
  if (document.msExitFullscreen) return document.msExitFullscreen();
  return Promise.resolve();
}

export function getFullscreenElement() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement ||
    null
  );
}

export function isFullscreen() {
  return getFullscreenElement() != null;
}

/** Attach a listener for fullscreen change events (all vendor prefixes) */
export function addFullscreenChangeListener(handler) {
  document.addEventListener("fullscreenchange", handler);
  document.addEventListener("webkitfullscreenchange", handler);
  document.addEventListener("mozfullscreenchange", handler);
  document.addEventListener("MSFullscreenChange", handler);
}

export function removeFullscreenChangeListener(handler) {
  document.removeEventListener("fullscreenchange", handler);
  document.removeEventListener("webkitfullscreenchange", handler);
  document.removeEventListener("mozfullscreenchange", handler);
  document.removeEventListener("MSFullscreenChange", handler);
}
