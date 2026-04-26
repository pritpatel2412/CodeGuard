# Security incident response (pre-deploy checklist)

If secrets, tokens, or webhook keys were ever committed, exposed in logs, or shared:

1. **Rotate immediately**
   - `OPENAI_API_KEY`, `GITHUB_TOKEN`, `GITHUB_CLIENT_SECRET`, `SESSION_SECRET`
   - GitHub OAuth app client secret (if applicable)
   - Database credentials (`DATABASE_URL`)
   - Any per-repo webhook secrets in GitHub/GitLab settings

2. **Invalidate sessions**
   - Truncate the `session` table in PostgreSQL, or rotate `SESSION_SECRET` (invalidates all cookies).

3. **Revoke OAuth tokens**
   - In GitHub: Settings → Applications → revoke CodeGuard / PATs tied to leaked `users.access_token` values.

4. **Repository hygiene**
   - Remove `users.json`, `session.json`, `repositories.json`, `.env` from git tracking if they were committed; use `git filter-repo` or BFG for history purge, then force-push only with team agreement.

5. **Verify**
   - Run secret scanning (e.g. gitleaks) on CI.
   - Confirm production requires `SESSION_SECRET` (see README).
   - Confirm webhooks reject unsigned payloads when secret is configured.

Document completion with date and owner.
