export function buildChecklistSteps(program) {
  const documentSteps = program.required_documents.map((doc) => ({
    title: `Gather: ${doc}`,
  }));

  return [
    ...documentSteps,
    {
      title: "Complete the application on the official portal",
      description: program.application_process,
    },
  ];
}

export function getChecklistStepCount(program) {
  return program.required_documents.length + 1;
}
