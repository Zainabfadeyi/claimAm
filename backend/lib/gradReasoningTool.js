// Phase 1: is there enough profile detail to match, or do we need 2-3 follow-up questions first?
export const gradIntakeTool = {
  name: "assess_grad_profile_completeness",
  description:
    "Decide whether the student's profile has enough information to confidently match them against scholarships, or whether a few more targeted questions are needed first.",
  parameters: {
    type: "object",
    properties: {
      detected_language: { type: "string", enum: ["english", "pidgin"] },
      is_complete: { type: "boolean" },
      missing_info_summary: {
        type: "string",
        description: "One short sentence on what's missing. Empty string if complete.",
      },
      follow_up_questions: {
        type: "array",
        description:
          "2-3 short, specific questions to ask the student next. Empty array if is_complete is true.",
        items: { type: "string" },
      },
    },
    required: ["detected_language", "is_complete", "missing_info_summary", "follow_up_questions"],
  },
};

// Phase 2: tiered relevance matching against the verified scholarship dataset.
export const gradMatchTool = {
  name: "report_grad_scholarship_matches",
  description:
    "Report which verified scholarships the student is a plausible match for, tiered by relevance.",
  parameters: {
    type: "object",
    properties: {
      detected_language: { type: "string", enum: ["english", "pidgin"] },
      matches: {
        type: "array",
        items: {
          type: "object",
          properties: {
            scholarship_id: { type: "string" },
            relevance_score: {
              type: "integer",
              description: "0-100 estimate of how well this student fits this scholarship's actual criteria.",
            },
            tier: {
              type: "string",
              enum: ["top_match", "strong_potential"],
            },
            reason: { type: "string" },
            checklist: {
              type: "array",
              items: { type: "string" },
            },
            essay_predictions: {
              type: "array",
              items: { type: "string" },
              description:
                "2-3 likely essay/interview prompts drawn ONLY from the scholarship's own known essay_topics, phrased to hint how this student could approach them. Empty array if the scholarship has no known essay_topics — never invent one.",
            },
          },
          required: [
            "scholarship_id",
            "relevance_score",
            "tier",
            "reason",
            "checklist",
            "essay_predictions",
          ],
        },
      },
      gap_analysis: {
        type: "array",
        description:
          "0-3 short, specific, encouraging suggestions for what could unlock more or stronger scholarship matches.",
        items: { type: "string" },
      },
    },
    required: ["detected_language", "matches", "gap_analysis"],
  },
};
