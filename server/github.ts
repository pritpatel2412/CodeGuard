import { Octokit } from '@octokit/rest';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings?.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('GitHub not connected');
  }
  return accessToken;
}

// WARNING: Never cache this client.
// Access tokens expire, so a new client must be created each time.
export async function getUncachableGitHubClient() {
  const accessToken = await getAccessToken();
  return new Octokit({ auth: accessToken });
}

// Fetch PR diff from GitHub
export async function getPullRequestDiff(owner: string, repo: string, prNumber: number): Promise<string> {
  const octokit = await getUncachableGitHubClient();
  
  const response = await octokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
    owner,
    repo,
    pull_number: prNumber,
    headers: {
      accept: 'application/vnd.github.v3.diff'
    }
  });
  
  return response.data as unknown as string;
}

// Get PR details
export async function getPullRequestDetails(owner: string, repo: string, prNumber: number) {
  const octokit = await getUncachableGitHubClient();
  
  const { data } = await octokit.pulls.get({
    owner,
    repo,
    pull_number: prNumber,
  });
  
  return data;
}

// Post a review comment on the PR
export async function postReviewComment(
  owner: string,
  repo: string,
  prNumber: number,
  commitId: string,
  path: string,
  line: number,
  body: string
) {
  const octokit = await getUncachableGitHubClient();
  
  try {
    await octokit.pulls.createReviewComment({
      owner,
      repo,
      pull_number: prNumber,
      commit_id: commitId,
      path,
      line,
      body,
      side: 'RIGHT',
    });
  } catch (error: any) {
    console.error(`Failed to post comment on ${path}:${line}:`, error.message);
  }
}

// Post a general review on the PR
export async function postReview(
  owner: string,
  repo: string,
  prNumber: number,
  body: string,
  event: 'COMMENT' | 'APPROVE' | 'REQUEST_CHANGES' = 'COMMENT'
) {
  const octokit = await getUncachableGitHubClient();
  
  await octokit.pulls.createReview({
    owner,
    repo,
    pull_number: prNumber,
    body,
    event,
  });
}
