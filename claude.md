# Antigravity Build Prompt — CodeGuard → AI-Native Compliance Audit Service

Copy everything in the box below into Antigravity as a single mission. It is written so Antigravity (or any agent) can act on it without you in the loop for clarification — it states current state, target state, exact gap, and acceptance criteria.

---

```
ROLE
You are a senior full-stack engineer + AppSec architect working inside the existing
CodeGuard repository. Treat this as a scoped feature-branch mission, not a rewrite.
Read the actual code before changing anything — the summary below is my understanding
from documentation, not a substitute for you reading server/, client/, and shared/.

═══════════════════════════════════════════════════════════════
PART 1 — CURRENT STATE (what CodeGuard already does, verify against code)
═══════════════════════════════════════════════════════════════

CodeGuard today is a PR/MR review copilot:
- GitHub/GitLab webhook → HMAC-verified → fetch diff (server/routes.ts,
  app.post("/api/webhooks/github/:repositoryId")).
- server/openai.ts: analyzeCodeDiff() sends the diff to GPT-4o with a
  "Senior AppSec Engineer" persona prompt, returns categorized findings
  (bug / security / performance / readability / maintainability) + a
  Low/Medium/High risk score.
- Policy-as-Prompt: fetches .codeguard.yml from repo root at PR head SHA,
  validates with js-yaml + zod, injects org-specific rules into a second
  GPT-4o policy-enforcement prompt. Violations persist per review. APIs:
  GET /api/policy/:repositoryId, GET /api/policy/violations/:reviewId,
  PUT /api/policy/:repositoryId/toggle.
- Cross-file taint analysis: graph construction + taint path propagation
  over the changed-code scope, optional AI enrichment, persisted graph +
  path artifacts, exposed via a Taint Paths tab and Semantic Graph tab.
- Auto-Fix: on High-Risk findings, Safety Guards block sensitive paths
  (auth.ts, .env, payment-gateway/), then generateFix() in server/openai.ts
  fetches the full file, generates a complete secure replacement, creates
  branch security-fix-PR-{NUMBER}-{RANDOM}, opens a new PR, posts a
  pointer comment on the original PR.
- Dashboard (client/src/pages/dashboard.tsx): live Socket.io review feed,
  Recharts trend graphs, advanced filtering (risk/status/platform/type),
  PDF report generator for stakeholders, AI Fix Flow Visualizer.
- Hardening already in place: CSRF on mutating routes, sanitized
  /api/user (no token leakage), production CORS allowlist, tightened CSP,
  masked webhook secrets, redacted log output, repo identity checks on
  webhook payloads.
- Stack: React 18 / Vite / TS / TanStack Query / Tailwind / Radix /
  Framer Motion (frontend); Node/Express/Passport GitHub OAuth/Socket.io
  (backend); PostgreSQL + Drizzle ORM (db); GPT-4o (AI); Recharts/XYFlow/
  Dagre (viz).

THE STRUCTURAL GAP vs. the target below: every output CodeGuard produces
today is advisory and UI-shaped — a PR comment, a dashboard tab, a PDF for
a human stakeholder to read. There is no signed, evidence-backed,
framework-mapped artifact that a buyer could accept as the deliverable
itself, and there is no "no PR, no developer in the loop" entry point —
everything currently assumes a live PR/MR event as the trigger.

═══════════════════════════════════════════════════════════════
PART 2 — TARGET STATE (the YC ask, verified against the actual Summer 2026 RFS language)
═══════════════════════════════════════════════════════════════

YC's "AI-Native Service Company" category (compliance/audit named explicitly)
asks for companies that do not sell a tool for a human to operate — they sell
the finished outcome and bill on results. For us that means: instead of
"CodeGuard found 14 issues, here's your dashboard," the product is
"here is your signed OWASP ASVS 5.0 (or SOC 2 CC) readiness report, with a
traceable evidence chain from control → test → code artifact, ready to hand
to a customer, auditor, or procurement team."

Two facts from current research that should shape scope, not be ignored:
1. OWASP ASVS 5.0 (released May 2025, the current version — do not target
   the older 4.0.3 prose-only model) was explicitly redesigned around
   machine-readable evidence types per requirement: configuration evidence,
   code-review evidence, static-analysis evidence, dynamic-test evidence,
   IaC evidence, external-audit evidence. This is the framework to target
   first because it was built to be automated against, unlike SOC 2 which
   is process/narrative-heavy and harder to evidence from code alone.
2. Industry estimates ~60-70% of ASVS requirements are automatable via
   SAST, dependency scanning, and config review. That is the realistic
   ceiling for v1 — do NOT design as if 100% automation is achievable.
   The remaining 30-40% must be explicitly flagged as
   "requires manual attestation" rather than silently skipped or faked.

═══════════════════════════════════════════════════════════════
PART 3 — THE MVP TO BUILD (what you should actually implement this mission)
═══════════════════════════════════════════════════════════════

Build a new top-level mode in CodeGuard called "Audit Mode" (separate
entry point from the existing PR-review flow; do not break the existing
flow). Audit Mode takes a full repository (not a diff) and produces a
signed, versioned Compliance Readiness Report mapped to OWASP ASVS 5.0.

3.1 — New ingestion path (does NOT require a webhook or open PR)
  - New route: POST /api/audits  — accepts { repositoryUrl, branch,
    framework: "asvs-5.0" } (only support asvs-5.0 for v1, but design the
    schema so soc2-cc and pci-dss-4.0.1 can be added later without a
    migration).
  - Clone or fetch the target repo at the given ref (read-only, sandboxed,
    no write-back — this is NOT the PR auto-fix path and must never call
    createBranch/createPullRequest).
  - New table audits (Drizzle schema in shared/schema.ts): id,
    repository_url, branch, framework, status (pending/running/complete/
    failed), started_at, completed_at, report_id (FK).

3.2 — Control-mapping engine (this is the core IP, build it as its own module)
  - New file server/compliance/asvs-controls.ts: load the ASVS 5.0
    requirement set (V1-V14 chapters) as structured data — id, chapter,
    level (L1/L2/L3), description, evidence_type (one of: config,
    code_review, static_analysis, dynamic_test, iac, external_audit).
  - New file server/compliance/evidence-collectors/: one collector per
    automatable evidence_type, reusing what CodeGuard already has:
      - static_analysis collector → reuse analyzeCodeDiff's underlying
        prompt logic, but run it as a full-repo static pass per relevant
        ASVS chapter (auth, session mgmt, access control, input
        validation, crypto, etc.) instead of per-PR-diff.
      - code_review collector → reuse the taint-analysis graph engine;
        a taint path that terminates safely is evidence FOR a control,
        one that reaches a sink is evidence AGAINST it.
      - config collector → static checks against repo config files
        (CSP headers, CORS allowlist, session cookie flags, dependency
        lockfile presence, .env handling) — this is mostly deterministic
        code, not an LLM call; keep AI usage to what genuinely needs
        judgment.
      - iac collector → if Dockerfile/IaC files are present, scan for
        known misconfig patterns; otherwise mark not_applicable.
      - dynamic_test and external_audit evidence types → mark
        requires_manual_attestation = true. Do not attempt to fake these
        with an LLM guess. This is the honesty boundary that separates a
        real audit product from a toy.
  - Each control gets a verdict: pass / fail / not_applicable /
    requires_manual_attestation, plus an evidence_trail: array of
    { source_file, line_range, finding_id, collector, timestamp,
    raw_evidence_snippet }. The evidence_trail is the actual deliverable —
    treat it as a legal/audit artifact, not a debug log.

3.3 — Report generation (the sellable artifact)
  - New endpoint GET /api/audits/:id/report — returns a structured JSON
    report: framework, repo, commit_sha, generated_at, overall_readiness_
    score, per-chapter breakdown, per-control verdict + evidence_trail,
    a manual_attestation_checklist for everything not automatable.
  - Extend the existing PDF report generator (it already exists for the
    dashboard — find and reuse it, do not rewrite from scratch) into a
    new "Audit Report" PDF template: cover page with repo/commit/date,
    executive summary with readiness score, per-chapter pass/fail table,
    full evidence appendix, and a manual-attestation checklist page.
  - Add a cryptographic signature: hash the final report JSON (sha256),
    sign with a server-held key (store the public key alongside the
    report so a third party can verify it wasn't altered after issuance).
    This is what makes it "signed," not just "exported" — a buyer needs
    to trust the artifact didn't get edited after generation.
  - New DB table audit_reports: id, audit_id, report_json, report_hash,
    signature, pdf_path, created_at.

3.4 — Minimal new UI (do not over-build this — it's a B2B deliverable
       flow, not a consumer dashboard)
  - One new page client/src/pages/audit.tsx: form to kick off an audit
    (repo URL + branch + framework selector, framework selector disabled
    to ASVS 5.0 only for now), a status view while running (reuse
    Socket.io for live progress the same way the existing dashboard does),
    and a final report view with download-PDF and "verify signature"
    button.
  - Do NOT touch or redesign the existing PR-review dashboard, taint
    tabs, or policy tabs. Audit Mode is additive.

3.5 — Explicitly out of scope this mission (so you don't scope-creep)
  - Do not build SOC 2 or PCI mapping yet — schema-ready only.
  - Do not build billing/Stripe integration this mission.
  - Do not attempt to auto-remediate findings discovered in Audit Mode —
    Audit Mode is read-only by design; that is precisely what makes the
    output trustworthy as an audit artifact instead of a self-graded
    PR-fix loop.
  - Do not call this "SOC2-ready" anywhere in code or copy — be precise
    that v1 targets OWASP ASVS 5.0 only.

═══════════════════════════════════════════════════════════════
PART 4 — WHY THIS SCOPE (context for your own judgment calls while building)
═══════════════════════════════════════════════════════════════
- The reused taint engine and GPT-4o analysis pipeline are the actual
  unlock here — re-deriving threat detection from scratch would waste
  the one real moat this codebase already has. Wire Audit Mode to call
  into the existing analysis modules, don't duplicate them.
- The single most important design decision is the honesty boundary in
  3.2 (pass/fail/not_applicable/requires_manual_attestation). A compliance
  product that silently fabricates evidence for unautomatable controls is
  not a sellable audit product, it's a liability. Preserve that boundary
  even under pressure to "show 100% automated."
- Keep the evidence_trail schema stable and versioned from the start —
  it's the part future paying customers and real auditors will actually
  scrutinize, and schema churn later is expensive once reports are signed
  and issued.

═══════════════════════════════════════════════════════════════
PART 5 — DELIVERABLES / ACCEPTANCE CRITERIA FOR THIS MISSION
═══════════════════════════════════════════════════════════════
1. POST /api/audits successfully clones a small public repo I provide,
   runs the full collector pipeline, and reaches status=complete without
   manual intervention.
2. GET /api/audits/:id/report returns a JSON report with at least the
   V2 (Authentication), V4 (Access Control), and V5 (Validation) ASVS
   chapters populated with real verdicts and non-empty evidence_trails
   pulled from the actual cloned repo (not hardcoded/mocked data).
3. A signed PDF report is generated and downloadable, and a
   "verify signature" check confirms the report_hash matches a
   re-computed hash of the stored report_json.
4. The existing PR-review webhook flow, dashboard, taint tabs, and
   policy tabs all continue to work unmodified — run the existing test
   suite (or add one if none exists for these paths) to confirm no
   regression.
5. Produce a short ARCHITECTURE_AUDIT_MODE.md in docs/ explaining the
   new module boundaries, so this is reviewable as a real PR, not a
   black box.

Work in a new branch (feature/audit-mode), commit incrementally with
clear messages per sub-step in Part 3, and stop to summarize before
starting Part 3.3 (report generation) so I can review the control-mapping
output before you wire up signing and PDF export.
```

---

## Why I structured it this way

**Two-part shape (current state → target state) instead of just "build X."** Antigravity works by planning then executing autonomously across editor/terminal/browser — if I just describe the YC idea, it has to reverse-engineer your actual code to know what to reuse. Telling it explicitly to wire into `analyzeCodeDiff`, the taint engine, and the existing PDF generator stops it from re-implementing things you already paid build-time for.

**The "honesty boundary" (Part 3.2 / Part 4) is the one design decision I'd protect hardest.** ASVS 5.0 itself is built around evidence-typed controls precisely because compliance buyers need to know what's machine-verified versus what still needs a human attestation — that 60-70% automatable ceiling I found in research is real, and a report that pretends to auto-verify the rest isn't a sellable audit artifact, it's a fabrication.

**Why ASVS 5.0 over SOC 2 for the MVP**: SOC 2 is heavily process/narrative (policies, access reviews, vendor management) — much harder to evidence purely from a code repo. ASVS 5.0 was restructured in May 2025 specifically to make automated, machine-readable evidence collection tractable per control, which matches what CodeGuard's taint engine and static analysis can actually produce today. SOC 2/PCI are left schema-ready, not built, so the pivot to them later is a config change, not a rewrite.

**A stop-point before signing/PDF export** is built into the acceptance criteria — you'll want to eyeball real control verdicts on a real repo before the artifact gets cryptographically signed and treated as a deliverable.

One thing worth deciding before you run this: do you want the first test repo to be a real small open-source project, or one of your own private repos?