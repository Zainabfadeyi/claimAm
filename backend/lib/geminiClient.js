import { GoogleGenAI, ApiError } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Pinned rather than "gemini-flash-latest" — the latest alias tracks newer preview
// models that saw frequent 503 "high demand" errors on the free tier during testing.
// gemini-2.5-flash is retired for new accounts; Google's own 404 pointed at this one.
export const MODEL = "gemini-3.6-flash";

const MAX_ATTEMPTS = 3;
const RETRYABLE_STATUS = new Set([429, 500, 503]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The free tier intermittently returns 503 "high demand" / 429 rate-limit errors that
// succeed on a quick retry. Bad requests (400/404/etc.) are not retried — retrying those
// would just fail the same way three times slower.
export async function generateContentWithRetry(request) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await ai.models.generateContent(request);
    } catch (err) {
      lastError = err;
      const isRetryable = err instanceof ApiError && RETRYABLE_STATUS.has(err.status);
      if (!isRetryable || attempt === MAX_ATTEMPTS) {
        throw err;
      }
      const backoffMs = 500 * 2 ** (attempt - 1); // 500ms, 1000ms, ...
      console.warn(
        `Gemini request failed (status ${err.status}), retrying in ${backoffMs}ms (attempt ${attempt}/${MAX_ATTEMPTS})`
      );
      await sleep(backoffMs);
    }
  }
  throw lastError;
}
