// Provider-neutral schema for the structured output we force the model to return.
// reasonEngine.js adapts this into whichever provider's tool/function-calling shape is active.
export const reasoningTool = {
  name: "report_eligibility_matches",
  description: "Report which verified programs the user likely qualifies for.",
  parameters: {
    type: "object",
    properties: {
      detected_language: { type: "string", enum: ["english", "pidgin"] },
      matches: {
        type: "array",
        items: {
          type: "object",
          properties: {
            program_id: { type: "string" },
            confidence: { type: "string", enum: ["high", "needs_verification"] },
            reason: { type: "string" },
            next_steps: { type: "array", items: { type: "string" } },
          },
          required: ["program_id", "confidence", "reason", "next_steps"],
        },
      },
    },
    required: ["detected_language", "matches"],
  },
};
