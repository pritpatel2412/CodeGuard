<<<<<<< HEAD
# 🛡️ CodeGuard AI Agent
### Automated Security & Code Quality Orchestrator

[![Security Score](https://img.shields.io/badge/Security-A+-brightgreen?style=for-the-badge)](https://github.com/pritpatel2412/CodeGuard)
[![AI Powered](https://img.shields.io/badge/AI-OpenAI_GPT--4o-blue?style=for-the-badge)](https://openai.com/)
[![Premium UI](https://img.shields.io/badge/UI-Obsidian_Midnight-ec4899?style=for-the-badge)](https://github.com/pritpatel2412/CodeGuard)

CodeGuard is an intelligent, automated **Security and Code Quality Reviewer** designed to act as a "Senior App Sec Engineer" monitoring your repositories 24/7. It doesn't just find bugs; it **fixes** them using state-of-the-art AI while providing a world-class, cinematic developer experience.

---

## ✨ Premium Experience
CodeGuard isn't just a tool; it's a high-end development environment.

- 🌑 **Obsidian Midnight Theme**: An elite, true-black interface designed for high-performance developer workflows.
- 🎭 **Premium Identity System**: AI-generated, artistic avatars with verified rings and premium badges.
- 🎞️ **Cinematic Transitions**: Ultra-smooth circular reveal animations using the View Transitions API.
- 🪄 **Dynamic UI**: Monochrome iconography and interactive border-glow cards that react to your presence.

---

## 🚀 Core Capabilities

Modern development moves fast, but security often lags behind. CodeGuard bridges this gap by automatically analyzing every Pull Request (PR) for:
- 🐞 **Bugs & Logical Flaws**: Identify complex logic errors before they hit production.
- 🔒 **Security Vulnerabilities**: Deep scanning for OWASP Top 10, SQLi, XSS, and broken access control.
- ⚡ **Performance Bottlenecks**: Real-time detection of N+1 queries and memory-intensive loops.
- 📖 **Maintainability**: AI-driven refactoring suggestions for cleaner, more readable code.

**The "Surgeon" Agent**: For High-Risk issues, CodeGuard automatically generates a secure fix, creates a new branch, and opens a secondary PR—resolving vulnerabilities in seconds.
=======
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
>>>>>>> 6ec92882a691b74ab7c49fcfce1179be77d993ba

---

## The Problem It Solves

<<<<<<< HEAD
```mermaid
graph TD
    subgraph "External VCS (GitHub/GitLab)"
        PR[Developer opens PR]
        WH[Webhook Trigger]
        COM[Post Comments to PR]
        FIXPR[Open Security-Fix PR]
    end
=======
Modern dev teams ship fast. Security reviews are slow, expensive, and inconsistent. A single missed SQL injection or exposed API key can cost millions.

CodeGuard makes security review instant, automated, and intelligent — acting as a Senior AppSec Engineer watching every commit 24/7.
>>>>>>> 6ec92882a691b74ab7c49fcfce1179be77d993ba

---

<<<<<<< HEAD
    subgraph "CodeGuard Frontend (React)"
        DS[Premium Dashboard]
        VX[Fix Flow Visualizer]
        TM[Theme Engine - 3 Modes]
    end
=======
## How It Works
>>>>>>> 6ec92882a691b74ab7c49fcfce1179be77d993ba

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

<<<<<<< HEAD
## 📂 Repository Structure

| Directory | Purpose |
| :--- | :--- |
| `client/` | Premium React frontend (Vite, Tailwind, Framer Motion, Radix UI). |
| `server/` | Node.js/Express backend handling AI orchestrators and VCS hooks. |
| `shared/` | Shared TypeScript types and Drizzle database models. |
| `script/` | Automated build and utility scripts. |

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Radix UI, Recharts, Wouter.
- **Backend:** Node.js, Express, Socket.io, Passport.js.
- **AI Engine:** OpenAI GPT-4o / GPT-4 Turbo with custom "Security Engineer" personas.
- **Persistence:** PostgreSQL with Drizzle ORM (Type-safe migrations).
- **Architecture:** Monorepo with end-to-end TypeScript safety.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- OpenAI API Key
- GitHub/GitLab Personal Access Token (for PR comments and fixes)

### 2. Environment Variables
Create a `.env` file in the root:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/codeguard
OPENAI_API_KEY=your_openai_api_key
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
SESSION_SECRET=your_random_session_secret
```

### 3. Installation & Run
=======
## Getting Started

>>>>>>> 6ec92882a691b74ab7c49fcfce1179be77d993ba
```bash
git clone https://github.com/pritpatel2412/CodeGuard
cd CodeGuard
npm install

<<<<<<< HEAD
# Initialize the database
npm run db:push
=======
# Set up environment
cp .env.example .env
# Add: OPENAI_API_KEY, DATABASE_URL, GITHUB_APP_ID, GITHUB_PRIVATE_KEY
>>>>>>> 6ec92882a691b74ab7c49fcfce1179be77d993ba

# Run migrations
npm run db:migrate

# Start
npm run dev
```

<<<<<<< HEAD
---

## 🔒 Security & Safety Guards

CodeGuard includes built-in safety mechanisms to protect your code:
- **Path Sanitization**: Sensitive files (`.env`, `secrets.yaml`, `auth.ts`) are automatically flagged and never modified by AI.
- **Syntax Validation**: Generated fixes are validated for syntax and logic before PR creation.
- **Branch Isolation**: All AI actions occur on dedicated, isolated branches.

---

Developed with ❤️ by [Prit Patel](https://github.com/pritpatel2412)
=======
---

## Why This Matters

- **Shift security left** — catch vulnerabilities at PR time, not in production
- **Reduce review overhead** — engineers focus on logic, not boilerplate security checks
- **Auto-remediation** — critical issues get fixed, not just flagged

---

## Built By

**Prit Patel** — B.Tech CSE @ CHARUSAT University
[GitHub](https://github.com/pritpatel2412) · [LinkedIn](https://linkedin.com/in/pritpatel2412)
>>>>>>> 6ec92882a691b74ab7c49fcfce1179be77d993ba
