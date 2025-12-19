import { Octokit } from '@octokit/rest';

let connectionSettings: any;

async function getAccessToken() {
  // Prefer a user-provided GitHub token when running outside Replit.
  if (process.env.GITHUB_TOKEN) {
    return process.env.GITHUB_TOKEN;
  }

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
export async function getUncachableGitHubClient(accessToken?: string) {
  const token = accessToken || await getAccessToken();
  return new Octokit({ auth: token });
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

// Create a new branch
export async function createBranch(owner: string, repo: string, newBranch: string, baseSha: string, accessToken?: string) {
  const octokit = await getUncachableGitHubClient(accessToken);

  await octokit.git.createRef({
    owner,
    repo,
    ref: `refs/heads/${newBranch}`,
    sha: baseSha
  });
}

// Get raw file content
export async function getFileContent(owner: string, repo: string, path: string, ref?: string, accessToken?: string) {
  const octokit = await getUncachableGitHubClient(accessToken);

  const response = await octokit.repos.getContent({
    owner,
    repo,
    path,
    ref,
  });

  if (!Array.isArray(response.data) && response.data.type === 'file') {
    return Buffer.from(response.data.content, response.data.encoding as BufferEncoding).toString('utf-8');
  } else {
    throw new Error('Path is not a file');
  }
}

// Update file content
export async function updateFile(
  owner: string,
  repo: string,
  path: string,
  content: string,
  message: string,
  branch: string,
  sha?: string, // Optional: if known, helps concurrency
  accessToken?: string
) {
  const octokit = await getUncachableGitHubClient(accessToken);

  // If sha not provided, fetch it (blind update)
  let fileSha = sha;
  if (!fileSha) {
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });
      if (!Array.isArray(data)) {
        fileSha = data.sha;
      }
    } catch (e: any) {
      // If file doesn't exist, we might be creating it, so sha remains undefined
      if (e.status !== 404) throw e;
    }
  }

  await octokit.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: Buffer.from(content).toString('base64'),
    branch,
    sha: fileSha,
  });
}

// Create a Pull Request
export async function createPullRequest(
  owner: string,
  repo: string,
  title: string,
  body: string,
  head: string,
  base: string = 'main',
  accessToken?: string
) {
  const octokit = await getUncachableGitHubClient(accessToken);

  const { data } = await octokit.pulls.create({
    owner,
    repo,
    title,
    body,
    head,
    base,
  });

  return data;
}
