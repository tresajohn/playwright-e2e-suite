export interface ReviewGateResult {
  blocked: string[]; // scenario IDs that must not enter the suite
  approved: string[];
  rejected: string[];
}

// Scenarios must be explicitly approved by a human before they can be promoted
// to the live test suite. 'pending' and 'rejected' are both blocked from CI.
export function checkReviewGate(
  scenarios: Array<{ scenarioId: string; reviewStatus: string }>
): ReviewGateResult {
  const blocked: string[] = [];
  const approved: string[] = [];
  const rejected: string[] = [];

  for (const scenario of scenarios) {
    switch (scenario.reviewStatus) {
      case 'approved':
        approved.push(scenario.scenarioId);
        break;
      case 'rejected':
        rejected.push(scenario.scenarioId);
        blocked.push(scenario.scenarioId);
        break;
      default:
        // 'pending' or any unknown status is treated as blocked
        blocked.push(scenario.scenarioId);
        break;
    }
  }

  return { blocked, approved, rejected };
}
