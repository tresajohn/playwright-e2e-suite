export interface Requirement {
  id: string;
  title: string;
  description: string;
}

export interface TraceabilityReport {
  unmappedScenarios: string[]; // scenario IDs with no matching requirement
  uncoveredRequirements: string[]; // requirement IDs with zero scenarios
}

export function checkTraceability(
  scenarios: Array<{ scenarioId: string; requirementId: string }>,
  requirements: Requirement[]
): TraceabilityReport {
  const requirementIds = new Set(requirements.map((r) => r.id));
  const coveredRequirementIds = new Set<string>();

  const unmappedScenarios: string[] = [];

  for (const scenario of scenarios) {
    if (!requirementIds.has(scenario.requirementId)) {
      unmappedScenarios.push(scenario.scenarioId);
    } else {
      coveredRequirementIds.add(scenario.requirementId);
    }
  }

  const uncoveredRequirements = requirements
    .filter((r) => !coveredRequirementIds.has(r.id))
    .map((r) => r.id);

  return { unmappedScenarios, uncoveredRequirements };
}
