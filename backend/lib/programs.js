import programsData from "../data/programs.json";

export function getAllPrograms() {
  return programsData.programs;
}

export function getProgramById(id) {
  return getAllPrograms().find((p) => p.id === id) || null;
}
