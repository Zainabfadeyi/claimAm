// Carries a match's personalized reason/next_steps across a client-side navigation
// to the program detail page. Session-only (sessionStorage), never sent to a server —
// consistent with "no persistence beyond the current browser session".
const PREFIX = "claimam:match:";

export function saveMatch(match) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      PREFIX + match.program_id,
      JSON.stringify({
        confidence: match.confidence,
        reason: match.reason,
        next_steps: match.next_steps,
      })
    );
  } catch {
    // sessionStorage unavailable (private mode, etc.) — detail page falls back to generic content.
  }
}

export function readMatch(programId) {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PREFIX + programId);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
