<p align="center">
  <h1 align="center">🛡️ CodeGuard</h1>
  <p align="center"><strong>AI-Powered Code Security & Pull Request Risk Analysis Platform</strong></p>
  <p align="center">Your 24/7 Senior AppSec Engineer — automatically reviewing every PR before it hits production.</p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js" />
  <img src="https://img.shields.io/badge/React-Vite-blue?style=flat-square&logo=react" />
  <img src="https://img.shields.io/badge/OpenAI-GPT--4o-orange?style=flat-square&logo=openai" />
  <img src="https://img.shields.io/badge/GitHub-Webhook_Integration-black?style=flat-square&logo=github" />
  <img src="https://img.shields.io/badge/PostgreSQL-Drizzle_ORM-blue?style=flat-square&logo=postgresql" />
</p>

---

## What is CodeGuard?

CodeGuard is an **autonomous AI security agent** that hooks into your GitHub workflow and analyzes every pull request for security vulnerabilities, logic errors, and high-risk code changes — before they reach production.

For critical issues, it doesn't just flag them. It **generates a secure fix**, creates a new branch, and opens a secondary PR automatically.

---

## The Problem It Solves

Modern dev teams ship fast. Security reviews are slow, expensive, and inconsistent. A single missed SQL injection or exposed API key can cost millions.

CodeGuard makes security review instant, automated, and intelligent — acting as a Senior AppSec Engineer watching every commit 24/7.

---

## How It Works

### 1. 🔍 Detection Phase (The Sentry)
- GitHub webhook fires when a PR is opened or updated
- CodeGuard fetches the full diff and analyzes it line-by-line
- GPT-4o understands **context and intent** — not just pattern matching
- Every review gets a risk score: Low / Medium / High

### 2. 🔧 Remediation Phase (The Surgeon)
- For High-Risk issues: Safety Guards verify the file isn't critical auth/payment logic
- Fix agent reads the **entire vulnerable file** (not just the diff) for architectural soundness
- Generates a secure, contextually correct fix
- Auto-creates a branch + commits the fix + opens a new PR targeting the developer's branch

### 3. 📊 Monitoring Phase (The Observer)
- All reviews stored in PostgreSQL via Drizzle ORM
- Dashboard shows PR history, risk trends, fix success rates
- Fix Flow Visualizer shows the full remediation pipeline

---

## What It Catches

- 🔒 **OWASP Top 10** — SQL injection, XSS, CSRF, insecure deserialization
- 🔑 **Secrets exposure** — API keys, tokens, passwords in code
- ⚡ **Performance bottlenecks** — N+1 queries, unoptimized loops
- 🐞 **Logic errors** — off-by-one, null pointer, race conditions
- 📖 **Code quality** — readability, maintainability, dead code

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, TypeScript, Tailwind CSS |
| Backend | Node.js, Express.js |
| AI Engine | OpenAI GPT-4o |
| Database | PostgreSQL + Drizzle ORM |
| Integration | GitHub Webhooks + GitHub API |
| Deployment | Vercel |

---

## Pipeline

```
Developer opens PR
        │
        ▼
GitHub Webhook → CodeGuard Backend
        │
        ▼
Fetch Full Diff + File Context
        │
        ▼
GPT-4o Analysis (line-by-line, context-aware)
        │
        ├── Low/Medium Risk → Comment on PR with findings
        │
        └── High Risk → Safety Guards check
                              │
                        ┌─────▼──────┐
                        │  Generate   │
                        │  Secure Fix │
                        └─────┬───────┘
                              │
                    Create Branch → Commit Fix → Open Fix PR
        │
        ▼
Store in PostgreSQL → Update Dashboard
```

---

## Getting Started

```bash
git clone https://github.com/pritpatel2412/CodeGuard
cd CodeGuard
npm install

# Set up environment
cp .env.example .env
# Add: OPENAI_API_KEY, DATABASE_URL, GITHUB_APP_ID, GITHUB_PRIVATE_KEY

# Run migrations
npm run db:migrate

# Start
npm run dev
```

---

## Why This Matters

- **Shift security left** — catch vulnerabilities at PR time, not in production
- **Reduce review overhead** — engineers focus on logic, not boilerplate security checks
- **Auto-remediation** — critical issues get fixed, not just flagged

---

## Built By

**Prit Patel** — B.Tech CSE @ CHARUSAT University
[GitHub](https://github.com/pritpatel2412) · [LinkedIn](https://linkedin.com/in/pritpatel2412)
