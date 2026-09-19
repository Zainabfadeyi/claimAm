import { assessGradProfile } from "../../backend/lib/gradScholarshipEngine";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { description } = req.body || {};

  if (typeof description !== "string" || !description.trim()) {
    return res.status(400).json({ error: "Please describe your situation before submitting." });
  }

  try {
    const result = await assessGradProfile({ description });
    return res.status(200).json(result);
  } catch (err) {
    console.error("pages/api/grad-intake.js error:", err);
    return res.status(500).json({ error: "Something went wrong on our end — please try again." });
  }
}
