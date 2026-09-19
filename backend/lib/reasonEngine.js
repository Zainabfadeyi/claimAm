import { FunctionCallingConfigMode } from "@google/genai";
import { generateContentWithRetry, MODEL } from "./geminiClient";
import { systemPrompt } from "./systemPrompt";
import { reasoningTool } from "./reasoningTool";
import { findCategory } from "./categories";
import { getAllPrograms } from "./programs";

// Runs the eligibility reasoning call and returns { detected_language, matches }.
// The model only ever decides WHICH programs match and WHY — benefit, apply_url,
// and status always come from the verified program record, never from the model.
export async function getEligibilityMatches({ input, category }) {
  const programs = getAllPrograms();

  const programsForModel = programs.map(
    ({
      id,
      name,
      category: cat,
      benefit,
      eligibility,
      required_documents,
      application_process,
    }) => ({
      id,
      name,
      category: cat,
      benefit,
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
