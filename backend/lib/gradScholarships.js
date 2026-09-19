import scholarshipsData from "../data/grad_scholarships.json";

export function getAllGradScholarships() {
  return scholarshipsData.scholarships;
}

export function getGradScholarshipById(id) {
  return getAllGradScholarships().find((s) => s.id === id) || null;
}
