// Restores the last Eligibility Finder results after the user navigates away (e.g. to a
// program detail page) and hits Back, so they land on their results instead of a blank
// form. Session-only (sessionStorage), scoped per category — consistent with "no
// persistence beyond the current browser session".
const PREFIX = "claimam:finder:";

export function saveFinderState(category, state) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PREFIX + category, JSON.stringify(state));
  } catch {
    // sessionStorage unavailable — results just won't survive a back-navigation.
  }
}

export function readFinderState(category) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PREFIX + category);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
