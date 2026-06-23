# GitLab Parity Gap Analysis

Currently, CodeGuard fully supports GitHub for both PR webhooks and automated fixes. While some GitLab integration exists (especially for the automated "Apply AI Fix" functionality), there is a significant parity gap regarding the primary PR/MR review loop.

## The Gap

1. **Webhook Handler is a Stub**
   In `server/routes.ts`, the GitHub webhook endpoint (`POST /api/webhooks/github/:repositoryId`) is fully implemented, handling payload validation, fetching diffs, running AI analysis, and posting comments. 
   The GitLab endpoint (`POST /api/webhooks/gitlab/:repositoryId`) is currently just a stub returning `501 Not Implemented`.

2. **Webhook Signature Verification**
   GitHub uses `X-Hub-Signature-256` and HMAC SHA256. GitLab uses `X-Gitlab-Token` which requires a plain-text secret comparison (or custom headers). The current webhook verification logic only supports GitHub.

3. **Status Checks / Commit Gates**
   GitHub uses `setCommitGateStatus` to post pending/success/failure statuses to the PR. GitLab requires equivalent functionality using the Commits Status API (`/projects/:id/statuses/:sha`). This function needs to be written in `server/gitlab.ts`.

4. **Webhook Payload Parsing**
   GitLab Merge Request events have a fundamentally different JSON schema than GitHub Pull Request events. The handler needs logic to extract the `owner`, `repoName`, `mrNumber`, `baseSha`, and `headSha` from the GitLab payload.

## Existing Functions
The following functions are already implemented in `server/gitlab.ts` and just need to be wired into the webhook:
- `getMergeRequestDiff`
- `getMergeRequestDetails`
- `postMergeRequestComment` (for inline review comments)
- `postMergeRequestReview` (for the summary comment)

## Action Plan
1. **Implement `setGitLabCommitStatus`** in `server/gitlab.ts`.
2. **Flesh out the GitLab Webhook** in `server/routes.ts` to mirror the GitHub logic, utilizing the existing `getMergeRequestDiff` and `postMergeRequestComment` functions.
3. **Handle Webhook Validation** to verify the `X-Gitlab-Token` header instead of the GitHub HMAC signature.
