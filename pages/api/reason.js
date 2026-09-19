import { getEligibilityMatches } from "../../backend/lib/reasonEngine";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { input, category } = req.body || {};

  if (typeof input !== "string" || !input.trim()) {
    return res.status(400).json({ error: "Please describe your situation before submitting." });
  }

  try {
    const result = await getEligibilityMatches({ input, category });
    return res.status(200).json(result);
  } catch (err) {
    console.error("pages/api/reason.js error:", err);
    return res.status(500).json({ error: "Something went wrong on our end — please try again." });
  }
}
