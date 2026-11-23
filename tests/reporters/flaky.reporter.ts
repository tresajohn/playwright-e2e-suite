import type { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';

interface AttemptRecord {
  retry: number;
  status: string;
}

interface FlakyTestEntry {
  title: string;
  file: string;
  passedOnAttempt: number;
  totalAttempts: number;
}

interface FlakyReport {
  runDate: string;
  totalTests: number;
  flakyTests: FlakyTestEntry[];
  flakyCount: number;
  flakyRate: number;
  threshold: number;
  thresholdExceeded: boolean;
}

class FlakyReporter implements Reporter {
  readonly attempts: Map<string, AttemptRecord[]> = new Map();
  private testMeta: Map<string, { title: string; file: string }> = new Map();

  onTestEnd(test: TestCase, result: TestResult): void {
    if (!this.attempts.has(test.id)) {
      this.attempts.set(test.id, []);
      this.testMeta.set(test.id, {
        title: test.title,
        file: test.location.file,
      });
    }
    this.attempts.get(test.id)!.push({ retry: result.retry, status: result.status });
  }

  async onEnd(_result: FullResult): Promise<void> {
    const flakyTests: FlakyTestEntry[] = [];

    for (const [id, records] of this.attempts) {
      const hasFailed = records.some((r) => r.status === 'failed');
      const passedRecord = records.find((r) => r.status === 'passed');
      if (hasFailed && passedRecord) {
        const meta = this.testMeta.get(id)!;
        flakyTests.push({
          title: meta.title,
          file: meta.file,
          passedOnAttempt: passedRecord.retry,
          totalAttempts: records.length,
        });
      }
    }

    const totalTests = this.attempts.size;
    const flakyCount = flakyTests.length;
    const flakyRate = totalTests > 0 ? flakyCount / totalTests : 0;
    const threshold = parseFloat(process.env.FLAKY_THRESHOLD ?? '0.10');
    const thresholdExceeded = flakyRate > threshold;

    const report: FlakyReport = {
      runDate: new Date().toISOString(),
      totalTests,
      flakyTests,
      flakyCount,
      flakyRate,
      threshold,
      thresholdExceeded,
    };

    const outputDir = path.resolve('test-results');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(path.join(outputDir, 'flaky-report.json'), JSON.stringify(report, null, 2));

    if ((thresholdExceeded || flakyCount > 0) && process.env.CI) {
      console.error(
        `\nFlaky tests detected: ${flakyCount}/${totalTests} (${(flakyRate * 100).toFixed(1)}%). Threshold: ${(threshold * 100).toFixed(0)}%`
      );
      process.exitCode = 1;
    }
  }
}

export default FlakyReporter;
