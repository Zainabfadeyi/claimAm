import { GoogleGenAI, ApiError } from "@google/genai";

// Pinned rather than "gemini-flash-latest" — the latest alias tracks newer preview
// models that saw frequent 503 "high demand" errors on the free tier during testing.
// gemini-2.5-flash is retired for new accounts; Google's own 404 pointed at this one.
export const MODEL = "gemini-3.6-flash";

// Supports a primary key plus up to 2 fallback keys (e.g. separate free-tier Google
// accounts/projects), so a quota-exhausted or momentarily-unavailable key doesn't take
// the whole app down. Set GEMINI_API_KEY, GEMINI_API_KEY_2, GEMINI_API_KEY_3 in the
// environment (e.g. Vercel project settings) — only GEMINI_API_KEY is required.
const KEY_ENV_VARS = ["GEMINI_API_KEY", "GEMINI_API_KEY_2", "GEMINI_API_KEY_3"];

const clients = KEY_ENV_VARS.map((envVar) => process.env[envVar])
  .map((key, i) => ({ envVar: KEY_ENV_VARS[i], key }))
  .filter(({ key }) => key)
  .map(({ envVar, key }) => ({
    label: envVar,
    client: new GoogleGenAI({ apiKey: key }),
  }));

const MAX_ATTEMPTS_PER_KEY = 3;
// Worth a quick backoff retry on the SAME key — usually resolves within a few seconds.
const RETRYABLE_STATUS = new Set([429, 500, 503]);
// A malformed request or bad config (wrong model name, invalid schema) — every key will
// fail the same way, so there's no point retrying or falling back.
const NON_RECOVERABLE_STATUS = new Set([400, 404]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Tries each configured key in order. Within a key, transient errors (429/500/503) get
// a quick backoff retry. If a key still can't get through (retries exhausted, or an
// error like an invalid/revoked key), moves on to the next configured key. Only throws
// once every configured key has failed.
export async function generateContentWithRetry(request) {
  if (clients.length === 0) {
    throw new Error(
      "No Gemini API key configured — set GEMINI_API_KEY (and optionally GEMINI_API_KEY_2 / GEMINI_API_KEY_3) in the environment."
    );
  }

  let lastError;
  for (let keyIndex = 0; keyIndex < clients.length; keyIndex++) {
    const { label, client } = clients[keyIndex];

    for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_KEY; attempt++) {
      try {
        return await client.models.generateContent(request);
      } catch (err) {
        lastError = err;
        const status = err instanceof ApiError ? err.status : null;

        if (status !== null && NON_RECOVERABLE_STATUS.has(status)) {
          throw err;
        }

        const canRetrySameKey =
          status !== null && RETRYABLE_STATUS.has(status) && attempt < MAX_ATTEMPTS_PER_KEY;
        if (canRetrySameKey) {
          const backoffMs = 500 * 2 ** (attempt - 1); // 500ms, 1000ms, ...
          console.warn(
            `Gemini request failed (status ${status}) on ${label}, retrying in ${backoffMs}ms (attempt ${attempt}/${MAX_ATTEMPTS_PER_KEY})`
          );
          await sleep(backoffMs);
          continue;
        }

        break; // give up on this key, fall through to the next one (if any)
      }
    }

    if (keyIndex < clients.length - 1) {
      console.warn(
        `${label} could not complete the request (status ${lastError && lastError.status}), falling back to ${clients[keyIndex + 1].label}`
      );
    }
  }

  throw lastError;
}
