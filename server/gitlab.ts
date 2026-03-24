
import { z } from "zod";

// Types for GitLab API responses
interface GitLabUser {
    id: number;
    name: string;
    username: string;
    avatar_url: string;
}

interface GitLabMergeRequest {
    id: number;
    iid: number;
    project_id: number;
    title: string;
    description: string;
    state: string;
    created_at: string;
    updated_at: string;
    target_branch: string;
    source_branch: string;
    author: GitLabUser;
    web_url: string;
    sha: string;
}

const GITLAB_API_URL = "https://gitlab.com/api/v4";

async function getGitLabToken() {
    if (process.env.GITLAB_TOKEN) {
        return process.env.GITLAB_TOKEN;
    }
    throw new Error("GITLAB_TOKEN not found");
}

async function gitlabFetch(path: string, options: RequestInit = {}) {
    const token = await getGitLabToken();
    const response = await fetch(`${GITLAB_API_URL}${path}`, {
        ...options,
        headers: {
            "PRIVATE-TOKEN": token,
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`GitLab API error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    return response.json();
}

// Convert "owner/repo" to Project ID (URL encoded path) or assume numeric ID if provided?
// GitLab uses ID or URL-encoded path. e.g. "namespace/project" -> "namespace%2Fproject"
function getProjectPath(owner: string, repo: string) {
    return encodeURIComponent(`${owner}/${repo}`);
}

// Fetch MR diff from GitLab
export async function getMergeRequestDiff(owner: string, repo: string, mrNumber: number): Promise<string> {
    const projectPath = getProjectPath(owner, repo);
    // Get changes to construct a diff-like string or fetch actual diff
    // GitLab API: /projects/:id/merge_requests/:merge_request_iid/changes
    const data = await gitlabFetch(`/projects/${projectPath}/merge_requests/${mrNumber}/changes`);

    // Construct a unified diff-like string from the changes
    let fullDiff = "";
    for (const change of data.changes) {
        fullDiff += `diff --git a/${change.old_path} b/${change.new_path}\n`;
        fullDiff += `--- a/${change.old_path}\n`;
        fullDiff += `+++ b/${change.new_path}\n`;
        fullDiff += change.diff + "\n";
    }

    return fullDiff;
}

// Get MR details
export async function getMergeRequestDetails(owner: string, repo: string, mrNumber: number) {
    const projectPath = getProjectPath(owner, repo);
    const data = await gitlabFetch(`/projects/${projectPath}/merge_requests/${mrNumber}`);
    return data;
}

// Post a review comment on the MR
export async function postMergeRequestComment(
    owner: string,
    repo: string,
    mrNumber: number,
    commitId: string, // GitLab uses sha, but for discussions we might rely on position
    path: string,
    line: number,
    body: string
) {
    const projectPath = getProjectPath(owner, repo);

    // In GitLab, we create a discussion
    // We need to fetch the MR version to get the base_sha, start_sha, head_sha for the position
    const mr = await getMergeRequestDetails(owner, repo, mrNumber);
    const versions = await gitlabFetch(`/projects/${projectPath}/merge_requests/${mrNumber}/versions`);
    const latestVersion = versions[0];

    const position = {
        base_sha: latestVersion.base_commit_sha,
        start_sha: latestVersion.start_commit_sha,
        head_sha: latestVersion.head_commit_sha,
        position_type: "text",
        new_path: path,
        new_line: line,
    };

    await gitlabFetch(`/projects/${projectPath}/merge_requests/${mrNumber}/discussions`, {
        method: "POST",
        body: JSON.stringify({
            body: body,
            position: position,
        }),
    });
}

// Post a general review (note) on the MR
export async function postMergeRequestReview(
    owner: string,
    repo: string,
    mrNumber: number,
    body: string
) {
    const projectPath = getProjectPath(owner, repo);
    await gitlabFetch(`/projects/${projectPath}/merge_requests/${mrNumber}/notes`, {
        method: "POST",
        body: JSON.stringify({ body }),
    });
}

// Get raw file content
export async function getGitLabFileContent(owner: string, repo: string, path: string, ref: string = "main") {
    const projectPath = getProjectPath(owner, repo);
    const encodedPath = encodeURIComponent(path);
    const data = await gitlabFetch(`/projects/${projectPath}/repository/files/${encodedPath}?ref=${ref}`);
    return Buffer.from(data.content, "base64").toString("utf-8");
}

// Create a new branch
export async function createGitLabBranch(owner: string, repo: string, newBranch: string, ref: string) {
    const projectPath = getProjectPath(owner, repo);
    await gitlabFetch(`/projects/${projectPath}/repository/branches`, {
        method: "POST",
        body: JSON.stringify({
            branch: newBranch,
            ref: ref
        })
    });
}

// Update file content
export async function updateGitLabFile(
    owner: string,
    repo: string,
    path: string,
    content: string,
    message: string,
    branch: string
) {
    const projectPath = getProjectPath(owner, repo);
    const encodedPath = encodeURIComponent(path);

    await gitlabFetch(`/projects/${projectPath}/repository/files/${encodedPath}`, {
        method: "PUT",
        body: JSON.stringify({
            branch,
            content,
            commit_message: message,
            encoding: "text"
        })
    });
}

// Create a Merge Request
export async function createMergeRequest(
    owner: string,
    repo: string,
    title: string,
    description: string,
    sourceBranch: string,
    targetBranch: string
) {
    const projectPath = getProjectPath(owner, repo);

    const data = await gitlabFetch(`/projects/${projectPath}/merge_requests`, {
        method: "POST",
        body: JSON.stringify({
            source_branch: sourceBranch,
            target_branch: targetBranch,
            title,
            description
        })
    });

    // Return a structure compatible with the PR object we use or just the data
    // Our route handler expects { html_url, number }
    return {
        ...data,
        html_url: data.web_url,
        number: data.iid
    };
}
