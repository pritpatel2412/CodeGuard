import { Octokit } from "@octokit/rest";
import path from "path";

export interface RepoFile {
  path: string;   // relative path, e.g. "src/controllers/user.ts"
  content: string;
}

const SUPPORTED_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
const EXCLUDED_DIRS = new Set(["node_modules", ".git", "dist", "build", ".next", "coverage"]);

/**
 * Fetches ONLY the source files changed in a specific Pull Request.
 *
 * This is the correct strategy for per-PR taint analysis:
 * - Prevents unrelated files from other branches polluting results
 * - Dramatically reduces API calls for large repositories
 * - Ensures findings are always relevant to the current PR changes
 */
export async function crawlPRFiles(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number,
  ref: string,
  maxFiles: number = 300
): Promise<RepoFile[]> {

  // 1. Get the list of files changed in this PR (single API call)
  const { data: prFiles } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: prNumber,
    per_page: 100,
  });

  // 2. Filter to supported source files only, skip deleted files
  const sourceFiles = prFiles
    .filter((item) => {
      if (item.status === "removed") return false;  // Skip deleted files
      const ext = path.extname(item.filename);
      const parts = item.filename.split("/");
      const inExcluded = parts.some((p) => EXCLUDED_DIRS.has(p));
      return !inExcluded && SUPPORTED_EXTENSIONS.has(ext);
    })
    .slice(0, maxFiles);

  if (sourceFiles.length === 0) {
    return [];
  }

  // 3. Fetch full file contents at the PR head SHA in parallel
  const { default: pLimit } = await import("p-limit");
  const limit = pLimit(10); // 10 concurrent GitHub API calls

  const files = await Promise.all(
    sourceFiles.map((item) =>
      limit(async () => {
        try {
          const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path: item.filename,
            ref,
          });
          if ("content" in data && data.encoding === "base64") {
            return {
              path: item.filename,
              content: Buffer.from(data.content, "base64").toString("utf8"),
            } as RepoFile;
          }
        } catch {
          return null;
        }
      })
    )
  );

  return files.filter((f): f is RepoFile => f !== null);
}

/**
 * Fetches ALL supported source files from a GitHub repository.
 * Use this for full-repo analysis (not scoped to a specific PR).
 */
export async function crawlRepository(
  octokit: Octokit,
  owner: string,
  repo: string,
  ref: string,
  maxFiles: number = 300
): Promise<RepoFile[]> {

  // 1. Get the full recursive file tree in ONE API call
  const { data: tree } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: ref,
    recursive: "1",
  });

  // 2. Filter to supported source files only
  const sourceFiles = tree.tree.filter((item) => {
    if (item.type !== "blob" || !item.path) return false;
    const ext = path.extname(item.path);
    const parts = item.path.split("/");
    const inExcluded = parts.some((p) => EXCLUDED_DIRS.has(p));
    return !inExcluded && SUPPORTED_EXTENSIONS.has(ext);
  }).slice(0, maxFiles);

  // 3. Fetch file contents in parallel with concurrency limit
  const { default: pLimit } = await import("p-limit");
  const limit = pLimit(10);

  const files = await Promise.all(
    sourceFiles.map((item) =>
      limit(async () => {
        try {
          const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path: item.path!,
            ref,
          });
          if ("content" in data && data.encoding === "base64") {
            return {
              path: item.path!,
              content: Buffer.from(data.content, "base64").toString("utf8"),
            } as RepoFile;
          }
        } catch {
          return null;
        }
      })
    )
  );

  return files.filter((f): f is RepoFile => f !== null);
}
