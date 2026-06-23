# CodeGuard: Legal & Liability Open Questions

## The Core Problem: Auto-Fix Liability
When CodeGuard operates purely as a Static/Semantic Analysis tool, liability generally falls on the developer for ignoring or misinterpreting alerts. However, by actively generating and proposing "AI Auto-Fixes," CodeGuard steps into the role of a contributor.

**Scenario A:** CodeGuard generates a fix for an IDOR vulnerability. The fix appears correct and passes the PR gate, but introduces a subtle logic flaw (e.g., a timing attack or cache poisoning vector). The developer merges the PR, assuming CodeGuard's "Senior AppSec Engineer" persona implies a guarantee of safety. A breach occurs. 
*Is CodeGuard (the vendor) liable for providing the malicious code?*

**Scenario B:** CodeGuard flags a PR as "High Risk" and blocks the merge gate. A senior developer bypasses the gate, overriding the policy. A breach occurs. 
*How do we cryptographically prove that CodeGuard warned the user and blocked the PR, and the user actively overrode it?*

## Proposed Mitigation: TEE Audit Logging
To defend against Scenario B, we cannot rely on standard database logs (which can be altered by database admins or compromised hosts). We need an immutable, cryptographically verifiable audit trail.

**Implementation Strategy:**
We can utilize Trusted Execution Environments (TEEs) and append-only cryptographic ledgers (like the `tee_audit_log` structure). 
1. **Immutable Decision Logging:** Every time CodeGuard issues a "High Risk" block, it writes a cryptographic receipt containing the PR hash, the policy violation, and a timestamp into a TEE-backed audit log.
2. **Override Tracking:** If the PR is eventually merged by a developer, the GitHub/GitLab webhook triggers an "Override" event. This event is signed with the user's identity and appended to the TEE audit log.
3. **Non-Repudiation:** In the event of a breach investigation, the `tee_audit_log` serves as undeniable proof that CodeGuard correctly identified the vulnerability and attempted to block it, successfully shifting liability back to the engineering team who overrode the gate.

## Open Legal Questions (Requires Human Decision)
1. **Terms of Service:** Do our current Terms of Service explicitly disclaim liability for AI-generated code? We must clearly state that "AI Auto-Fixes" are *suggestions* requiring manual human review and testing.
2. **Indemnification Clauses:** Will enterprise customers accept our tool if we completely disclaim liability for its active code contributions?
3. **Cyber Insurance:** Does our current cyber insurance policy cover "AI error and omissions" that lead to third-party data breaches?
