# Architecture: Audit Mode

CodeGuard's Audit Mode introduces a new read-only, end-to-end repository analysis pipeline mapped to the OWASP ASVS 5.0 framework. Unlike the existing PR Review Copilot, Audit Mode does not evaluate a specific Git diff, nor does it create automated remediation PRs. Instead, it serves as an AI-Native Compliance Audit tool capable of producing a signed, verifiable evidence report.

## Module Boundaries

### 1. Ingestion & Storage (`server/routes/audits.ts`, `shared/schema.ts`, `server/storage.ts`)
- **API Endpoints**: 
  - `POST /api/audits`: Initiates an asynchronous clone and analysis.
  - `GET /api/audits/:id/report`: Retrieves the live status and evidence.
  - `GET /api/audits/:id/download` & `GET /api/audits/:id/pdf`: Export signed artifacts.
  - `POST /api/audits/:id/verify`: Validates the HMAC cryptographic signature.
- **Data Models**: 
  - `audits`: Tracks target repo, branch, and state.
  - `audit_reports`: Stores the immutable `reportJson`, SHA-256 `reportHash`, and `signature`.

### 2. The Orchestrator (`server/compliance/orchestrator.ts`)
The `orchestrator.ts` acts as the director. When an audit is triggered, the target repository is temporarily cloned into a sandboxed `.local/audits/<id>` directory. The orchestrator:
1. Loads the defined control frameworks (`server/compliance/asvs-controls.ts`).
2. Iterates over controls, calling specialized evidence collectors based on the control's `evidence_type`.
3. Compiles the `ControlResult[]` array.
4. Cleans up the cloned repository.

### 3. Evidence Collectors (`server/compliance/evidence-collectors/`)
Instead of a monolithic AI prompt, we use specialized collectors suited for the requirement:
- **`config-collector.ts`**: Deterministic file scanning (e.g., checking `package.json` for known dependencies or `tsconfig.json` for strict flags).
- **`iac-collector.ts`**: Dockerfile and infrastructure-as-code linting (e.g., `USER root` checks).
- **`static-analysis.ts`**: A heavy LLM pipeline reusing the `openai.ts` infrastructure. It chunks the target codebase and queries the AI agent specifically against ASVS chapter heuristics.
- **`code-review.ts`**: The bridge to the existing Taint Engine for verifying sanitized input pathways.

> **The Honesty Boundary**: Controls designated as `dynamic_test` or `external_audit` are explicitly returned as `requires_manual_attestation`. The AI is intentionally blocked from hallucinating evidence for controls that require runtime or physical verification.

### 4. Cryptographic Non-Repudiation (`server/compliance/report-generator.ts`, `pdf-generator.ts`)
To function as a B2B deliverable, reports must be tamper-proof.
- **JSON Signing**: The `report-generator` uses Node's native `crypto` module. A SHA-256 hash is generated from the JSON payload, which is then signed via HMAC using a protected `AUDIT_SECRET`.
- **PDF Generation**: The `pdf-generator` builds a highly readable PDF artifact featuring a cover page, performance scores, control breakdowns, and a verification signature string.

### 5. Frontend UI (`client/src/pages/audit.tsx`)
A minimal UI built atop existing TanStack Query and Shadcn UI components.
- Handles kick-off, asynchronous polling of the audit status, and live rendering of evidence.
- Provides immediate export links and a direct Verify Signature API call to confirm the artifact hasn't been modified externally.
