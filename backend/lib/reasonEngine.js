import { GoogleGenAI, FunctionCallingConfigMode, ApiError } from "@google/genai";
import { systemPrompt } from "./systemPrompt";
import { reasoningTool } from "./reasoningTool";
import { findCategory } from "./categories";
import { getAllPrograms } from "./programs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Pinned rather than "gemini-flash-latest" — the latest alias tracks newer preview
// models that saw frequent 503 "high demand" errors on the free tier during testing.
// gemini-2.5-flash is retired for new accounts; Google's own 404 pointed at this one.
const MODEL = "gemini-3.6-flash";

const MAX_ATTEMPTS = 3;
const RETRYABLE_STATUS = new Set([429, 500, 503]);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// The free tier intermittently returns 503 "high demand" / 429 rate-limit errors that
// succeed on a quick retry. Bad requests (400/404/etc.) are not retried — retrying those
// would just fail the same way three times slower.
async function generateContentWithRetry(request) {
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

// Runs the eligibility reasoning call and returns { detected_language, matches }.
// The model only ever decides WHICH programs match and WHY — benefit, apply_url,
// and status always come from the verified program record, never from the model.
export async function getEligibilityMatches({ input, category }) {
  const programs = getAllPrograms();

  const programsForModel = programs.map(
    ({ id, name, category: cat, eligibility, required_documents, application_process }) => ({
      id,
      name,
      category: cat,
      eligibility,
      required_documents,
      application_process,
    })
  );

  let userMessage = `Verified programs:\n${JSON.stringify(programsForModel, null, 2)}\n\n`;
  if (category && category !== "unknown") {
    const cat = findCategory(category);
    userMessage += `The user tapped the "${cat.label}" category before describing their situation.\n\n`;
  }
  userMessage += `User's situation:\n${input.trim()}`;

  const response = await generateContentWithRetry({
    model: MODEL,
    systemInstruction: systemPrompt,
    contents: userMessage,
    config: {
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.ANY,
          allowedFunctionNames: [reasoningTool.name],
        },
      },
      tools: [
        {
          functionDeclarations: [
            {
              name: reasoningTool.name,
              description: reasoningTool.description,
              parametersJsonSchema: reasoningTool.parameters,
            },
          ],
        },
      ],
    },
  });

  const call = (response.functionCalls || []).find((c) => c.name === reasoningTool.name);
  if (!call) {
    throw new Error("No function call in model response.");
  }

  const result = call.args;
  validateResult(result, programs);

  const programById = new Map(programs.map((p) => [p.id, p]));
  const matches = result.matches.map((match) => {
    const program = programById.get(match.program_id);
    return {
      program_id: program.id,
      name: program.name,
      confidence: match.confidence,
      reason: match.reason,
      benefit: program.benefit,
      apply_url: program.apply_url,
      status: program.status || null,
      next_steps: match.next_steps,
    };
  });

  return { detected_language: result.detected_language, matches };
}

function validateResult(result, programs) {
  if (!result || typeof result !== "object") {
    throw new Error("Model response missing structured result.");
  }
  if (!["english", "pidgin"].includes(result.detected_language)) {
    throw new Error("Invalid detected_language in model response.");
  }
  if (!Array.isArray(result.matches)) {
    throw new Error("Invalid matches array in model response.");
  }

  const validIds = new Set(programs.map((p) => p.id));
  for (const match of result.matches) {
    if (!match || typeof match.program_id !== "string" || !validIds.has(match.program_id)) {
      throw new Error(`Unknown or missing program_id: ${match && match.program_id}`);
    }
    if (!["high", "needs_verification"].includes(match.confidence)) {
      throw new Error("Invalid confidence value in model response.");
    }
    if (typeof match.reason !== "string" || !match.reason.trim()) {
      throw new Error("Invalid reason in model response.");
    }
    if (!Array.isArray(match.next_steps)) {
      throw new Error("Invalid next_steps in model response.");
    }
  }
}
