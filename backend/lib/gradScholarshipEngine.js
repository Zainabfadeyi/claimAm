import { FunctionCallingConfigMode } from "@google/genai";
import { generateContentWithRetry, MODEL } from "./geminiClient";
import { gradIntakeSystemPrompt, gradMatchSystemPrompt } from "./gradSystemPrompt";
import { gradIntakeTool, gradMatchTool } from "./gradReasoningTool";
import { getAllGradScholarships } from "./gradScholarships";

function callTool({ systemInstruction, contents, tool }) {
  return generateContentWithRetry({
    model: MODEL,
    systemInstruction,
    contents,
    config: {
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.ANY,
          allowedFunctionNames: [tool.name],
        },
      },
      tools: [
        {
          functionDeclarations: [
            {
              name: tool.name,
              description: tool.description,
              parametersJsonSchema: tool.parameters,
            },
          ],
        },
      ],
    },
  });
}

function extractCall(response, toolName) {
  const call = (response.functionCalls || []).find((c) => c.name === toolName);
  if (!call) {
    throw new Error(`No function call (${toolName}) in model response.`);
  }
  return call.args;
}

// Phase 1: decide if we have enough to match, or need 2-3 follow-up questions first.
export async function assessGradProfile({ description }) {
  const response = await callTool({
    systemInstruction: gradIntakeSystemPrompt,
    contents: `Student's description of their situation:\n${description.trim()}`,
    tool: gradIntakeTool,
  });

  const result = extractCall(response, gradIntakeTool.name);
  validateIntakeResult(result);
  return result;
}

function validateIntakeResult(result) {
  if (!result || typeof result !== "object") {
    throw new Error("Model response missing structured result.");
  }
  if (!["english", "pidgin"].includes(result.detected_language)) {
    throw new Error("Invalid detected_language in model response.");
  }
  if (typeof result.is_complete !== "boolean") {
    throw new Error("Invalid is_complete in model response.");
  }
  if (!Array.isArray(result.follow_up_questions)) {
    throw new Error("Invalid follow_up_questions in model response.");
  }
}

// Phase 2: tiered relevance match against the verified scholarship dataset, plus gap
// analysis and per-match essay predictions (grounded only in each scholarship's own
// known essay_topics — never invented).
export async function matchGradScholarships({ description, followUps }) {
  const scholarships = getAllGradScholarships();

  const scholarshipsForModel = scholarships.map(
    ({
      id,
      name,
      scope,
      degree_levels,
      study_destination,
      fields_of_study,
      nationality_eligibility,
      financial_need_required,
      min_academic_requirement,
      work_experience_required,
      benefit,
      eligibility,
      required_documents,
      essay_or_interview,
      application_process,
    }) => ({
      id,
      name,
      scope,
      degree_levels,
      study_destination,
      fields_of_study,
      nationality_eligibility,
      financial_need_required,
      min_academic_requirement,
      work_experience_required,
      benefit,
      eligibility,
      required_documents,
      essay_topics: essay_or_interview?.essay_topics || [],
      application_process,
    })
  );

  let profileText = `Student's own description:\n${description.trim()}`;
  if (Array.isArray(followUps) && followUps.length > 0) {
    const qa = followUps
      .filter((f) => f && f.question && f.answer)
      .map((f, i) => `${i + 1}. Q: ${f.question}\n   A: ${f.answer}`)
      .join("\n");
    if (qa) {
      profileText += `\n\nFollow-up question answers:\n${qa}`;
    }
  }

  const contents = `Verified scholarships:\n${JSON.stringify(
    scholarshipsForModel,
    null,
    2
  )}\n\n${profileText}`;

  const response = await callTool({
    systemInstruction: gradMatchSystemPrompt,
    contents,
    tool: gradMatchTool,
  });

  const result = extractCall(response, gradMatchTool.name);
  validateMatchResult(result, scholarships);

  const scholarshipById = new Map(scholarships.map((s) => [s.id, s]));
  const matches = result.matches
    .map((match) => {
      const scholarship = scholarshipById.get(match.scholarship_id);
      if (!scholarship) return null;
      return {
        scholarship_id: scholarship.id,
        name: scholarship.name,
        scope: scholarship.scope,
        degree_levels: scholarship.degree_levels,
        relevance_score: match.relevance_score,
        tier: match.tier,
        reason: match.reason,
        checklist: match.checklist,
        essay_predictions: match.essay_predictions,
        benefit: scholarship.benefit,
        apply_url: scholarship.apply_url,
        deadline_note: scholarship.deadline_note,
        status: scholarship.status,
        confidence: scholarship.confidence,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.relevance_score - a.relevance_score);

  return {
    detected_language: result.detected_language,
    matches,
    gap_analysis: result.gap_analysis,
  };
}

function validateMatchResult(result, scholarships) {
  if (!result || typeof result !== "object") {
    throw new Error("Model response missing structured result.");
  }
  if (!["english", "pidgin"].includes(result.detected_language)) {
    throw new Error("Invalid detected_language in model response.");
  }
  if (!Array.isArray(result.matches)) {
    throw new Error("Invalid matches array in model response.");
  }
  if (!Array.isArray(result.gap_analysis)) {
    throw new Error("Invalid gap_analysis in model response.");
  }

  const validIds = new Set(scholarships.map((s) => s.id));
  const validTiers = new Set(["top_match", "strong_potential"]);
  for (const match of result.matches) {
    if (
      !match ||
      typeof match.scholarship_id !== "string" ||
      !validIds.has(match.scholarship_id)
    ) {
      throw new Error(`Unknown or missing scholarship_id: ${match && match.scholarship_id}`);
    }
    if (
      typeof match.relevance_score !== "number" ||
      match.relevance_score < 0 ||
      match.relevance_score > 100
    ) {
      throw new Error("Invalid relevance_score in model response.");
    }
    if (!validTiers.has(match.tier)) {
      throw new Error("Invalid tier in model response.");
    }
    if (typeof match.reason !== "string" || !match.reason.trim()) {
      throw new Error("Invalid reason in model response.");
    }
    if (!Array.isArray(match.checklist)) {
      throw new Error("Invalid checklist in model response.");
    }
    if (!Array.isArray(match.essay_predictions)) {
      throw new Error("Invalid essay_predictions in model response.");
    }
  }
}
