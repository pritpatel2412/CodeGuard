# CodeGuard AI Agent

### Automated Security & Code Quality Orchestrator

[![Security Score](https://img.shields.io/badge/Security-A+-brightgreen?style=for-the-badge)](https://github.com/pritpatel2412/CodeGuard)
[![AI Powered](https://img.shields.io/badge/AI-OpenAI_GPT--4o-blue?style=for-the-badge)](https://openai.com/)
[![Premium UI](https://img.shields.io/badge/UI-Obsidian_Midnight-ec4899?style=for-the-badge)](https://github.com/pritpatel2412/CodeGuard)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel)](https://github.com/pritpatel2412/CodeGuard)

---

CodeGuard is an intelligent, autonomous **Security and Code Quality Agent** designed to act as a "Senior App Sec Engineer" monitoring your repositories 24/7. It doesn't just find bugs — it **fixes** them using state-of-the-art AI while providing a world-class, high-fidelity developer experience.

---

## Table of Contents

- [Premium Experience](#-premium-experience)
- [Core Capabilities](#-core-capabilities)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Repository Structure](#-repository-structure)
- [Security & Safety Guards](#-security--safety-guards)

---

## ✨ Premium Experience

CodeGuard isn't just a security tool — it's a premium development environment.

| Feature | Description |
| :--- | :--- |
| 🌑 **Obsidian Midnight Theme** | An elite, true-black interface with a custom **Cyber Cyan** and **CodeGuard Pink** palette. |
| 🎴 **Interactive PixelCards** | Canvas-based, high-performance card animations that react to developer interactions. |
| 🎭 **Aura Farming Identity** | Exclusive developer profile tiers featuring pulsating neon auras and verified badges. |
| 🎞️ **Cinematic Transitions** | Ultra-smooth animations and glassmorphism throughout the platform. |
| 🪄 **Dynamic UI** | Monochrome iconography and interactive border-glow effects that react to your presence. |

---

## 🚀 Core Capabilities

Modern development moves fast, but security often lags. CodeGuard bridges this gap by automatically analyzing every Pull Request (PR) across three core pillars:

### 🔍 Detection — *The Sentry*

- **OWASP Top 10** — Deep scanning for SQLi, XSS, CSRF, and broken access control.
- **Logic Flaws** — Identifying complex off-by-one errors and race conditions.
- **Secret Exposure** — Detecting leaked API keys, tokens, and credentials in real-time.
- **Performance** — Highlighting N+1 queries and memory-intensive loops.

### 🔧 Remediation — *The Surgeon*

- **Auto-Fix Generation** — For critical issues, CodeGuard reads the entire file context (not just the diff) to generate architecturally sound fixes.
- **One-Click PRs** — Automatically creates a branch, commits the fix, and opens a secondary PR targeting the developer's branch.
- **Safety Guards** — Verifies fixes for syntax and logic before ever touching your code.

### 📊 Intelligence — *The Observer*

- **Risk Scoring** — Every review gets a weighted risk score (Low / Medium / High).
- **Fix Flow Visualizer** — Real-time visualization of the AI remediation pipeline.
- **PR History** — Comprehensive tracking of security trends and remediation success rates.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Framer Motion, Tailwind CSS, Canvas API |
| **Backend** | Node.js, Express.js, Socket.io, Passport.js (GitHub OAuth) |
| **AI Engine** | OpenAI GPT-4o / GPT-4 Turbo |
| **Database** | PostgreSQL + Drizzle ORM (Type-safe migrations) |
| **Integration** | GitHub Webhooks + GitHub API |
| **Deployment** | Vercel |

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following:

- **Node.js** v18 or higher
- **PostgreSQL** Database (Neon, Local, or Docker)
- **OpenAI API Key**
- **GitHub Personal Access Token** (for automated PR comments and fixes)

### Environment Variables

Create a `.env` file in the project root and populate it with the following:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/codeguard
OPENAI_API_KEY=your_openai_api_key
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback
SESSION_SECRET=your_random_secure_string
```

### Installation & Running Locally

```bash
# 1. Clone the repository
git clone https://github.com/pritpatel2412/CodeGuard
cd CodeGuard

# 2. Install dependencies
npm install

# 3. Initialize the database (push schema)
npm run db:push

# 4. Start the development server
npm run dev
```

---

## 📂 Repository Structure

```
CodeGuard/
├── client/       # Premium React frontend (Vite, Tailwind, PixelCard, Framer Motion)
├── server/       # Node.js/Express backend — AI orchestrators and VCS hooks
├── shared/       # Shared TypeScript types and Drizzle database models
└── script/       # Automated build and deployment utility scripts
```

| Directory | Purpose |
| :--- | :--- |
| `client/` | Premium React frontend (Vite, Tailwind, PixelCard, Framer Motion). |
| `server/` | Node.js/Express backend handling AI orchestrators and VCS hooks. |
| `shared/` | Shared TypeScript types and Drizzle database models. |
| `script/` | Automated build and deployment utility scripts. |

---

## 🛡️ Security & Safety Guards

CodeGuard includes built-in safety mechanisms to protect your codebase at every stage:

- **Path Sanitization** — Sensitive files (`.env`, `secrets.yaml`, `auth.ts`) are automatically flagged and never modified by AI.
- **Context Isolation** — All AI actions occur on dedicated, isolated branches.
- **Ownership Verification** — Strict IDOR prevention across all API routes ensures users only access their own data.

---

<div align="center">

**Developed with ❤️ by [Prit Patel](https://github.com/pritpatel2412)**
*B.Tech CSE @ CHARUSAT University*

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/pritpatel2412)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/pritpatel2412)

</div>