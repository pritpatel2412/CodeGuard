# Investor Readiness Snapshot

**Status:** Technical Foundations Solidified; Traction Required Before Pitching.

## The Objections & Current Status

1. **"The AI just looks for regexes, Snyk already does this."** 
   *Status: Addressed.* We've documented our competitive moat (Cross-file semantic taint analysis) and exposed the `GET /api/repositories/:id/taint-history` endpoint to prove we find logic flaws that static tools miss.
2. **"How do you know the AI's fix actually works?"**
   *Status: Addressed.* We built `eval-harness` to measure bypass rates and verify fixes cryptographically against known vulnerability corpuses.
3. **"OpenAI will go down and you'll fail open or closed."**
   *Status: Addressed.* The `ProviderTracker` circuit breaker successfully routes between NVIDIA NIM (Llama 3 70B) and OpenAI (GPT-4o) ensuring high availability.
4. **"Your unit economics are negative if you scan 100k line repos."**
   *Status: Addressed.* Implemented the `api_usage_log` table and token-based cost heuristics. We now have a `GET /api/admin/system-health` endpoint proving our margins.
5. **"What if the AI auto-fix introduces a backdoor and you get sued?"**
   *Status: Pending Human Decision.* Documented in `LIABILITY_OPEN_QUESTIONS.md`. We have a path to non-repudiation using TEE audit logs (`tee_audit_log`), but we need terms-of-service updates and insurance.
6. **"You only support GitHub, enterprise runs on GitLab."**
   *Status: Partially Addressed.* Auto-fix logic for GitLab is implemented. We mapped the remaining work (webhook parsing, auth, and status gates) in `GITLAB_PARITY_GAP.md`.
7. **"You have zero traction."**
   *Status: UNADDRESSED (Requires Human Action).* VC funding requires proven utility.

## CodeGuard Overview (The Pitch)
- **What it is:** An AI-native compliance and AppSec platform that doesn't just flag vulnerabilities—it semantically verifies fixes and shifts liability through cryptographic audit logs.
- **The Moat:** Combining Deep Cross-File Taint Propagation with LLM Adversarial Verification. We don't just say "this is bad," we say "here is the cross-file path, here is the fix, and here is cryptographic proof that the fix cannot be bypassed."
- **What's left before raising $2M:** 
  You need **3-5 active design partners** running CodeGuard on real, production repositories. The technology is now verifiable, but without real-world telemetry and user-validation, it remains an impressive tech demo, not an investable business. **Stop writing code and go get users.**
