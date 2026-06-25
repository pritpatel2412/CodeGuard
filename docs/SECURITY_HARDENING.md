# Security Hardening Posture

This document outlines the security controls implemented in CodeGuard to protect its unique attack surface, specifically focusing on rate limiting, session timeouts, and repository ingestion safety.

## 1. Rate Limiting Tiers

CodeGuard uses a tiered rate-limiting strategy (enforced via `express-rate-limit`) to balance usability with abuse prevention, rather than a single global limit.

| Endpoint Category | Limit | Enforcement Scope | Rationale |
| :--- | :--- | :--- | :--- |
| **Auth** (`/auth/*`) | 5 req / 15 min | Per IP | Standard protection against credential stuffing and brute-force attacks on login endpoints. |
| **Public Intake** (`/api/public/free-audit-request`) | 3 req / 24 hours | Per IP & Email | Strictest IP limit. This unauthenticated marketing surface is highly exposed. Limits low-effort scripted spam. |
| **Audit Ingestion** (`POST /api/audits`) | 5 req / 24 hours | Per User ID | Most expensive endpoint (clones repos, calls GPT-4o). Tied to User ID to prevent authenticated cost-exhaustion attacks. |
| **Standard API** (`/api/*`) | 100 req / 1 min | Per IP | Generous limit for normal dashboard usage so legitimate users never hit the ceiling, while still stopping rapid programmatic abuse. |
| **Webhooks** | Unrestricted | N/A | Webhooks from GitHub/GitLab rely on HMAC signature validation for trust. Throttling them risks dropping legitimate PR events. |

## 2. Server-Side Session Timeout

To protect OAuth tokens and sensitive repository access, CodeGuard enforces strict server-side session timeouts (idle and absolute) via custom middleware.

*   **Session Fixation**: On successful OAuth callback, `req.session.regenerate()` is explicitly called to issue a new session ID before assigning privileges.
*   **Enforcement**: Timeouts are checked on every authenticated request. If exceeded, the server actively destroys the session in the store and clears the cookie.
*   **Values**:
    *   **Standard Users**: 20 minutes Idle, 12 hours Absolute.
    *   **Admin Users**: 10 minutes Idle, 4 hours Absolute. (Admins have a larger blast radius due to access to PII and system controls).

*Timeouts are configurable via `SESSION_IDLE_TIMEOUT_MINUTES` and related environment variables.*

## 3. CodeGuard-Specific Attack Surface Mitigations

### 3.1 Repository Ingestion (SSRF Protection)
The `POST /api/audits` endpoint dynamically clones arbitrary URLs provided by users.
*   **Protocol Check**: Rejects any scheme other than `http:` or `https:`.
*   **DNS Resolution & Private IP Block**: Before cloning, the hostname is resolved to its IP addresses. If any IP falls into private/reserved ranges (e.g., `10.0.0.0/8`, `192.168.0.0/16`, `127.0.0.0/8`, `::1`), the request is rejected. This prevents an attacker from supplying a URL that makes the CodeGuard server scan internal network services.

### 3.2 Auto-Fix Safety Guard
The Auto-Fix safety guard (`server/policy/safety-guard.ts`) has been verified to use **content-aware matching** alongside filename blocklists. It actively scans generated PR code for:
*   Imports of sensitive libraries (`crypto`, `passport`, `stripe`, etc.).
*   Patterns matching hardcoded secrets (`process.env.STRIPE_SECRET`, `JWT_KEY`, etc.).

### 3.3 Free-Audit-Request Bot Resistance
Beyond strict rate-limiting, the public intake form includes a hidden honeypot field (`website`). If a bot populates this invisible field, the server silently returns a `201 Created` without actually processing the request, dropping low-effort spam.

### 3.4 Secrets Hygiene
Both `SESSION_SECRET` and `AUDIT_SECRET` enforce a minimum length of 32 characters. If the environment is `production`, the server will `process.exit(1)` rather than falling back to weak development defaults. No new hardcoded secrets were introduced in recent missions.

### 3.5 Dependency Audit
A high-severity dependency audit was conducted, and findings in `lodash`, `drizzle-orm`, `esbuild`, `ws`, and others were resolved using `npm audit fix` to close known prototype pollution, XSS, and regex DoS vectors in the dependency tree.
