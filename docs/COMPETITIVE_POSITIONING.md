# CodeGuard vs. Legacy SAST (Snyk, SonarQube)

CodeGuard is fundamentally designed to find the vulnerabilities that legacy Static Application Security Testing (SAST) tools miss. Traditional solutions like Snyk and SonarQube rely on rigid, syntax-based rules and pattern matching. While effective at catching known CVEs in dependencies or common anti-patterns (e.g., `eval()` calls), they fail completely when vulnerabilities span across multiple files or involve complex business logic.

## 1. Cross-File Semantic Logic Flaws
CodeGuard's primary differentiator is its ability to understand **semantic logic and data flow across file boundaries**. 

Legacy SAST tools often analyze files in isolation. If a user ID is extracted from a request in `controller.ts`, passed to a service layer in `service.ts`, and finally used in an unprotected database query in `repository.ts`, traditional tools will not flag it because no single file contains a blatant violation. 

CodeGuard builds a complete **Semantic Graph** of the repository during PR analysis and runs cross-file taint propagation. This allows it to trace untrusted inputs (sources) through arbitrary execution paths (propagation chains) to sensitive sinks. As a result, CodeGuard routinely catches high-impact logic flaws like:
- **Insecure Direct Object References (IDOR)**
- Missing multi-step authorization checks
- Privilege escalation vectors in complex microservice data flows

## 2. Adversarial Patch Verification
Legacy tools typically stop at pointing out an issue—leaving the developer to guess if their fix actually works. 

CodeGuard goes a step further with **Adversarial Verification**. When an AI-generated fix is proposed or a developer pushes a patch, CodeGuard actively attempts to bypass the fix using LLM-driven adversarial reasoning. It assesses the patch not just for syntax correctness, but for semantic resilience against evasion. If the fix can be bypassed (e.g., using different encoding or edge cases), CodeGuard flags it. We don't just find vulnerabilities; we cryptographically ensure that the merged patch closes the loophole permanently.

## Summary
By combining deterministic cross-file taint analysis with advanced AI semantic reasoning and adversarial verification, CodeGuard replaces "best-effort" pattern matching with verifiable, logic-aware application security.
