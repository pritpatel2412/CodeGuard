# CodeGuard

Automated security and code-quality review platform for pull/merge requests, with AI analysis, optional AI remediation, custom policy enforcement, and developer-focused triage UI.

## What CodeGuard Does

CodeGuard connects repositories, receives webhook events, analyzes code changes, stores findings, and surfaces actionable review output in a dashboard.

Core outcomes:

- Detect security, bug, performance, and maintainability risks in PR/MR changes.
- Enforce organization-specific rules from `.codeguard.yml` (Policy-as-Prompt).
- Generate optional AI-assisted fix PRs/MRs with safety checks.
- Expose taint-propagation views for cross-file risk paths and semantic flow.
- Track review history, risk trends, and downloadable reports.

## Feature Coverage

### 1) AI Review Pipeline

- GPT-4o diff analysis with typed/validated review responses.
- Categorized findings (`bug`, `security`, `performance`, `readability`, `maintainability`).
- Risk scoring and summary generation per review.
- Comment posting to source control and dashboard-level history.

### 2) Policy-as-Prompt (`.codeguard.yml`)

- Fetches `.codeguard.yml` from repository root at PR head SHA.
- YAML parsing + strict schema validation (`js-yaml` + `zod`).
- Injects validated policy rules into dedicated GPT-4o policy enforcement prompt.
- Persists policy definitions and per-review policy violations.
- UI support:
  - Policy tab on review detail
  - Policy viewer and enforcement toggle on repositories page
- New APIs:
  - `GET /api/policy/:repositoryId`
  - `GET /api/policy/violations/:reviewId`
  - `PUT /api/policy/:repositoryId/toggle`

Specification doc: [docs/codeguard-yml-spec.md](docs/codeguard-yml-spec.md)

### 3) Cross-File Taint Analysis

- Graph construction and taint path propagation for changed code scope.
- Optional AI enrichment for explanation/fix context.
- Persisted graph + path artifacts with dedicated endpoints.
- UI support:
  - Taint Paths tab
  - Semantic Graph tab

### 4) AI Auto-Fix Workflow

- Trigger fix from actionable review comments.
- Retrieves file context, generates full-file fix, creates branch and PR/MR.
- Includes safety blocks for sensitive file families.
- Presents progress flow in UI and links back to created PR/MR.

### 5) Developer UX Enhancements

- Security-fix indicator badges (icon-based, emoji-free).
- Reviews page advanced filtering:
  - risk
  - status
  - platform
  - review type (security fix vs regular)
  - sorting + reset filters
- Legal pages updated with detailed terms/privacy language aligned to platform behavior.
- Settings page refactor with better reliability:
  - query-driven loading
  - dirty-state tracking
  - reset/save controls
  - clearer webhook/security guidance

## Security Hardening Implemented

CodeGuard now includes stronger production safeguards:

- Session secret enforcement in production (`SESSION_SECRET` required, min length policy).
- Sanitized `/api/user` response (no token exposure).
- CSRF protection for state-changing API routes (with defined exemptions).
- Mandatory GitHub webhook signature validation when processing repository webhooks.
- Repository identity checks on webhook payloads.
- Redacted API response logging for sensitive keys.
- Stronger CORS handling with `APP_ORIGIN` allowlist in production.
- Production CSP tightened (notably removing `unsafe-eval`).
- Safe external URL handling in frontend for PR/MR links.
- Masked webhook secrets in UI (explicit reveal/copy flow).
- Incident-response guidance and secure env template:
  - [.env.example](.env.example)
  - [docs/SECURITY_INCIDENT_RESPONSE.md](docs/SECURITY_INCIDENT_RESPONSE.md)

## Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | React 18, Vite, TypeScript, TanStack Query, Tailwind, Radix UI, Framer Motion |
| Backend | Node.js, Express, Passport (GitHub OAuth), Socket.io |
| AI | OpenAI GPT-4o |
| Database | PostgreSQL, Drizzle ORM, Drizzle Kit |
| Integrations | GitHub Webhooks/API, partial GitLab workflow support |
| Visualization | Recharts, XYFlow, Dagre |

## Project Structure

| Path | Purpose |
| :--- | :--- |
| `client/` | Frontend app (dashboard, reviews, settings, policy/taint views) |
| `server/` | API routes, auth, integrations, AI orchestration, taint + policy engines |
| `shared/` | Shared schema/types (Drizzle + Zod) |
| `api/` | Serverless entry wiring |
| `script/`, `scripts/` | Build and utility scripts |
| `docs/` | Product/docs specs (including `.codeguard.yml` spec and incident response) |

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- OpenAI API key
- GitHub OAuth app credentials

### Environment Setup

Use [.env.example](.env.example) as your baseline.

Minimum local variables:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/codeguard
OPENAI_API_KEY=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback
SESSION_SECRET=your_long_random_secret_min_32_chars
APP_ORIGIN=http://localhost:5000
```

Optional:

```env
TAINT_ENGINE_ENABLED=true
ENABLE_DEBUG_GITHUB_AUTH=false
```

### Install and Run

```bash
npm install
npm run db:push
npm run dev
```

### Build and Start

```bash
npm run build
npm run start
```

## Deployment Checklist

Before production release:

1. Set strong `SESSION_SECRET` and valid `APP_ORIGIN`.
2. Rotate any previously exposed secrets/tokens.
3. Ensure repository webhook secrets are configured.
4. Run type check: `npm run check`.
5. Verify webhook signature failures are rejected.
6. Verify `/api/user` does not expose token fields.
7. Ensure CI workflow is active (`.github/workflows/ci.yml`).

## CI and Quality Gates

Current CI workflow includes:

- install dependencies
- typecheck
- dependency audit (high severity and above)

Path: [.github/workflows/ci.yml](.github/workflows/ci.yml)

## Notes on GitLab

GitHub webhook flow is the primary production path. GitLab helper logic exists in code for parts of the fix flow, while webhook parity is still evolving.

## Release Notes

### Latest Release (2026-04)

#### Security and Policy Release

- Added Policy-as-Prompt support via repository `.codeguard.yml`:
  - YAML loading/validation
  - rule injection into GPT policy enforcement
  - policy violations persistence and APIs
  - repository policy viewer and review-level policy tab in UI
- Added cross-file taint analysis pipeline integration and UI:
  - taint paths tab
  - semantic graph visualization tab
- Improved review experience:
  - security-fix indicator badges (icon-based)
  - advanced reviews filtering (risk/status/platform/type/sort/reset)
  - emoji-free professional labeling in key review surfaces
- Completed pre-deployment hardening pass:
  - CSRF protection for mutating API routes
  - strict webhook signature and repository identity checks
  - sanitized `/api/user` response model
  - sensitive log redaction
  - production CORS allowlist + tighter CSP policy
  - safe external URL validation for PR/MR links
  - masked webhook secrets in UI with explicit reveal/copy flow
- Upgraded legal and settings content:
  - detailed Terms and Privacy pages aligned with current platform behavior
  - settings page reliability improvements (query-based loading, dirty-state, reset/save controls)
- Added operational readiness artifacts:
  - `.env.example`
  - `docs/SECURITY_INCIDENT_RESPONSE.md`
  - baseline CI workflow in `.github/workflows/ci.yml`

### Previous Releases

- Initial platform release: AI-powered PR review pipeline, dashboard, repository management, and risk tracking foundation.

## License

MIT (see repository license metadata).