import type { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';

interface AdfNode {
  type: string;
  content?: AdfNode[];
  text?: string;
  marks?: { type: string }[];
  attrs?: Record<string, unknown>;
}

class JiraReporter implements Reporter {
  private failures: Array<{ test: TestCase; result: TestResult }> = [];

  onTestEnd(test: TestCase, result: TestResult): void {
    // Only collect on the final attempt to avoid duplicate tickets per retry
    const isFinalAttempt = result.retry === test.retries;
    if ((result.status === 'failed' || result.status === 'timedOut') && isFinalAttempt) {
      this.failures.push({ test, result });
    }
  }

  async onEnd(_result: FullResult): Promise<void> {
    if (this.failures.length === 0) return;

    const { JIRA_BASE_URL, JIRA_API_TOKEN, JIRA_EMAIL, JIRA_PROJECT_KEY } = process.env;

    if (!JIRA_BASE_URL || !JIRA_API_TOKEN || !JIRA_EMAIL || !JIRA_PROJECT_KEY) {
      console.log('\n⚠️  Jira reporter: skipping ticket creation (env vars not set)');
      return;
    }

    console.log(`\n🎫 Creating ${this.failures.length} Jira ticket(s) for failed tests...`);

    for (const { test, result } of this.failures) {
      await this.createTicket(test, result, { JIRA_BASE_URL, JIRA_API_TOKEN, JIRA_EMAIL, JIRA_PROJECT_KEY });
    }
  }

  private buildDescription(test: TestCase, result: TestResult): AdfNode {
    const errorMessage = result.errors[0]?.message?.replace(/\[[0-9;]*m/g, '') || 'Unknown error';
    const filePath = test.location.file.split('/').slice(-3).join('/');
    const isSmoke = test.tags.includes('@smoke');
    const isBdd = test.tags.includes('@bdd');
    const isApi = test.tags.includes('@api');
    const testType = isBdd ? 'BDD (Gherkin)' : isApi ? 'API' : 'UI (Playwright POM)';
    const severity = isSmoke ? 'High' : 'Medium';
    const ciRunUrl = process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
      ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
      : 'Local run';
    const commitSha = process.env.GITHUB_SHA ? process.env.GITHUB_SHA.substring(0, 7) : 'unknown';

    const heading = (text: string): AdfNode => ({
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text }],
    });

    const para = (...nodes: AdfNode[]): AdfNode => ({
      type: 'paragraph',
      content: nodes,
    });

    const bold = (text: string): AdfNode => ({
      type: 'text',
      text,
      marks: [{ type: 'strong' }],
    });

    const text = (t: string): AdfNode => ({ type: 'text', text: t });

    const codeBlock = (code: string): AdfNode => ({
      type: 'codeBlock',
      attrs: { language: 'text' },
      content: [{ type: 'text', text: code.substring(0, 2000) }],
    });

    const rule = (): AdfNode => ({ type: 'rule' });

    return {
      type: 'doc',
      version: 1,
      content: [
        heading('Environment'),
        para(bold('App: '), text('OrangeHRM Demo (https://opensource-demo.orangehrmlive.com)')),
        para(bold('Test Type: '), text(testType)),
        para(bold('Tags: '), text(test.tags.join(', ') || 'none')),
        para(bold('Severity: '), text(severity)),
        para(bold('CI Run: '), text(ciRunUrl)),
        para(bold('Commit: '), text(commitSha)),

        rule(),
        heading('Failed Test'),
        para(bold('Title: '), text(test.title)),
        para(bold('Suite: '), text(test.titlePath().slice(0, -1).join(' › '))),
        para(bold('File: '), text(filePath)),
        para(bold('Duration: '), text(`${(result.duration / 1000).toFixed(1)}s`)),

        rule(),
        heading('Actual Result (Error)'),
        codeBlock(errorMessage),

        rule(),
        heading('Expected Result'),
        para(text('Test should pass without errors. See test file for assertion details.')),

        rule(),
        heading('Impact'),
        para(text(
          isSmoke
            ? '🔴 Smoke test failure — this blocks the CI pipeline and may prevent deployment.'
            : '🟡 Regression test failure — functionality may be degraded for end users.'
        )),

        rule(),
        heading('Automation Reference'),
        para(bold('File: '), text(filePath)),
        para(bold('Reproduce locally: '), text(`npx playwright test --grep "${test.title}" --headed`)),
        para(bold('View trace: '), text('npx playwright show-trace test-results/**/trace.zip')),

        rule(),
        heading('Triage Checklist'),
        {
          type: 'bulletList',
          content: [
            { type: 'listItem', content: [para(text('[ ] Reproduce manually'))] },
            { type: 'listItem', content: [para(text('[ ] Check if environment-specific or consistent'))] },
            { type: 'listItem', content: [para(text('[ ] Assign to developer'))] },
            { type: 'listItem', content: [para(text('[ ] Retest after fix and close ticket'))] },
          ],
        },
      ] as AdfNode[],
    } as unknown as AdfNode;
  }

  private async createTicket(
    test: TestCase,
    result: TestResult,
    env: { JIRA_BASE_URL: string; JIRA_API_TOKEN: string; JIRA_EMAIL: string; JIRA_PROJECT_KEY: string }
  ): Promise<void> {
    const isSmoke = test.tags.includes('@smoke');
    const isBdd = test.tags.includes('@bdd');
    const isApi = test.tags.includes('@api');
    const testType = isBdd ? 'BDD' : isApi ? 'API' : 'UI';
    const component = test.titlePath()[1] || 'General';

    const summary = `[${testType} Failure] ${component}: ${test.title}`;

    const payload = {
      fields: {
        project: { key: env.JIRA_PROJECT_KEY },
        summary: summary.substring(0, 255),
        description: this.buildDescription(test, result),
        issuetype: { name: 'Task' },
        priority: { name: isSmoke ? 'High' : 'Medium' },
        labels: [
          'automation-failure',
          'playwright',
          testType.toLowerCase(),
          isSmoke ? 'smoke' : 'regression',
        ],
      },
    };

    try {
      const auth = Buffer.from(`${env.JIRA_EMAIL}:${env.JIRA_API_TOKEN}`).toString('base64');
      const response = await fetch(`${env.JIRA_BASE_URL}/rest/api/3/issue`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json() as { key: string };
        console.log(`  ✅ ${data.key} — "${test.title}" [${isSmoke ? 'High' : 'Medium'}, ${testType}]`);
        const screenshot = result.attachments.find(a => a.name === 'screenshot' && a.path);
        if (screenshot?.path) {
          await this.attachScreenshot(data.key, screenshot.path, env);
        }
      } else {
        const text = await response.text();
        console.error(`  ❌ Failed to create ticket for "${test.title}": ${response.status} ${text}`);
      }
    } catch (err) {
      console.error(`  ❌ Jira API error for "${test.title}": ${err}`);
    }
  }

  private async attachScreenshot(
    issueKey: string,
    screenshotPath: string,
    env: { JIRA_BASE_URL: string; JIRA_API_TOKEN: string; JIRA_EMAIL: string }
  ): Promise<void> {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const fileBuffer = fs.readFileSync(screenshotPath);
      const fileName = path.basename(screenshotPath);

      const form = new FormData();
      form.append('file', new Blob([fileBuffer], { type: 'image/png' }), fileName);

      const auth = Buffer.from(`${env.JIRA_EMAIL}:${env.JIRA_API_TOKEN}`).toString('base64');
      const attachResponse = await fetch(`${env.JIRA_BASE_URL}/rest/api/3/issue/${issueKey}/attachments`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'X-Atlassian-Token': 'no-check',
        },
        body: form,
      });

      if (attachResponse.ok) {
        console.log(`    📎 Screenshot attached to ${issueKey}`);
      } else {
        const errorText = await attachResponse.text();
        console.error(`    ⚠️  Failed to attach screenshot to ${issueKey}: ${attachResponse.status} ${errorText}`);
      }
    } catch (err) {
      console.error(`    ⚠️  Screenshot attachment error for ${issueKey}: ${err}`);
    }
  }
}

export default JiraReporter;
