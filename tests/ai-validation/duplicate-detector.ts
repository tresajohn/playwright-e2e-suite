export interface DuplicatePair {
  scenarioA: string;
  scenarioB: string;
  similarity: number;
}

// 0.60 Jaccard similarity is aggressive enough to surface scenarios that share
// the same navigation target, form fields, and assertion — the clearest signal
// that two scenarios are functionally identical at the step level.
const DUPLICATE_THRESHOLD = 0.6;

function tokenize(text: string): string[] {
  return text.toLowerCase().match(/\b\w{3,}\b/g) ?? [];
}

function jaccardSimilarity(a: string[], b: string[]): number {
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((t) => setB.has(t)).length;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

function scenarioFingerprint(scenario: {
  title: string;
  steps: Array<{ action: string; target: string; value?: string }>;
}): string[] {
  const titleTokens = tokenize(scenario.title);
  const stepTokens = scenario.steps.flatMap((s) =>
    tokenize(`${s.action} ${s.target} ${s.value ?? ''}`)
  );
  return [...titleTokens, ...stepTokens];
}

export function detectDuplicates(
  scenarios: Array<{
    scenarioId: string;
    title: string;
    steps: Array<{ action: string; target: string; value?: string }>;
  }>
): DuplicatePair[] {
  const pairs: DuplicatePair[] = [];

  for (let i = 0; i < scenarios.length; i++) {
    for (let j = i + 1; j < scenarios.length; j++) {
      const a = scenarios[i];
      const b = scenarios[j];
      if (!a || !b) continue;

      const fingerprintA = scenarioFingerprint(a);
      const fingerprintB = scenarioFingerprint(b);
      const similarity = jaccardSimilarity(fingerprintA, fingerprintB);

      if (similarity >= DUPLICATE_THRESHOLD) {
        pairs.push({ scenarioA: a.scenarioId, scenarioB: b.scenarioId, similarity });
      }
    }
  }

  return pairs;
}
