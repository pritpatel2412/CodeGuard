interface WorkflowIncidentInput {
  owner: string;
  repo: string;
  prNumber: number;
  prUrl: string;
  riskLevel: string;
  policyViolationCount: number;
  summary: string;
}

function buildTitle(input: WorkflowIncidentInput): string {
  return `[CodeGuard] ${input.riskLevel.toUpperCase()} risk in ${input.owner}/${input.repo} PR #${input.prNumber}`;
}

function buildDescription(input: WorkflowIncidentInput): string {
  return [
    `Repository: ${input.owner}/${input.repo}`,
    `PR: #${input.prNumber}`,
    `Risk: ${input.riskLevel}`,
    `Policy violations: ${input.policyViolationCount}`,
    `URL: ${input.prUrl}`,
    "",
    "Summary:",
    input.summary,
  ].join("\n");
}

async function sendSlackAlert(input: WorkflowIncidentInput): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: `:rotating_light: ${buildTitle(input)}`,
      blocks: [
        { type: "section", text: { type: "mrkdwn", text: `*${buildTitle(input)}*` } },
        { type: "section", text: { type: "mrkdwn", text: buildDescription(input) } },
      ],
    }),
  });
}

async function sendPagerDutyAlert(input: WorkflowIncidentInput): Promise<void> {
  const routingKey = process.env.PAGERDUTY_ROUTING_KEY;
  if (!routingKey) return;

  await fetch("https://events.pagerduty.com/v2/enqueue", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      routing_key: routingKey,
      event_action: "trigger",
      payload: {
        summary: buildTitle(input),
        source: "codeguard",
        severity: input.riskLevel === "high" ? "critical" : "warning",
        custom_details: {
          prUrl: input.prUrl,
          policyViolations: input.policyViolationCount,
          riskLevel: input.riskLevel,
        },
      },
    }),
  });
}

async function createLinearIssue(input: WorkflowIncidentInput): Promise<void> {
  const apiKey = process.env.LINEAR_API_KEY;
  const teamId = process.env.LINEAR_TEAM_ID;
  if (!apiKey || !teamId) return;

  const query = `
    mutation IssueCreate($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
      }
    }
  `;

  await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
    body: JSON.stringify({
      query,
      variables: {
        input: {
          teamId,
          title: buildTitle(input),
          description: buildDescription(input),
        },
      },
    }),
  });
}

async function createJiraIssue(input: WorkflowIncidentInput): Promise<void> {
  const baseUrl = process.env.JIRA_BASE_URL;
  const email = process.env.JIRA_EMAIL;
  const apiToken = process.env.JIRA_API_TOKEN;
  const projectKey = process.env.JIRA_PROJECT_KEY;
  if (!baseUrl || !email || !apiToken || !projectKey) return;

  const auth = Buffer.from(`${email}:${apiToken}`).toString("base64");
  await fetch(`${baseUrl.replace(/\/+$/, "")}/rest/api/3/issue`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
    },
    body: JSON.stringify({
      fields: {
        project: { key: projectKey },
        summary: buildTitle(input),
        description: {
          type: "doc",
          version: 1,
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: buildDescription(input) }],
            },
          ],
        },
        issuetype: { name: "Bug" },
      },
    }),
  });
}

export async function triggerWorkflowIntegrations(input: WorkflowIncidentInput): Promise<void> {
  const tasks = [
    sendSlackAlert(input),
    sendPagerDutyAlert(input),
    createLinearIssue(input),
    createJiraIssue(input),
  ];
  const results = await Promise.allSettled(tasks);
  for (const result of results) {
    if (result.status === "rejected") {
      console.error("[Workflow Integrations] Failed:", result.reason);
    }
  }
}

