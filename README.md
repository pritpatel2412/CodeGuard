# 🛡️ CodeGuard AI Agent — Automated Security & Code Quality

[![Security Score](https://img.shields.io/badge/Security-A+-brightgreen)](https://github.com/pritpatel2412/CodeGuard)
[![AI Powered](https://img.shields.io/badge/AI-OpenAI-blue)](https://openai.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

CodeGuard is an intelligent, automated **Security and Code Quality Reviewer** designed to act as a "Senior App Sec Engineer" monitoring your repositories 24/7. It doesn't just find bugs; it **fixes** them using state-of-the-art AI.

---

## 🚀 The Vision

Modern development moves fast, but security often lags behind. CodeGuard bridges this gap by automatically analyzing every Pull Request (PR) for:
- 🐞 **Bugs & Logical Flaws**
- 🔒 **Security Vulnerabilities** (OWASP Top 10, SQLi, XSS, etc.)
- ⚡ **Performance Bottlenecks**
- 📖 **Code Readability & Maintainability**

For **High-Risk** issues, the agent takes it a step further: it generates a secure fix, creates a new branch, and opens a secondary PR—turning a critical vulnerability into a resolved issue in seconds.

---

## 🛠️ Architecture & Pipeline

CodeGuard follows a structured, multi-stage pipeline from detection to remediation.

```mermaid
graph TD
    subgraph "External VCS (GitHub/GitLab)"
        PR[Developer opens PR]
        WH[Webhook Trigger]
        COM[Post Comments to PR]
        FIXPR[Open Security-Fix PR]
    end

    subgraph "CodeGuard Backend (Node.js/Express)"
        VWH[Validate Webhook]
        FD[Fetch Diff Context]
        AE[AI Engine - OpenAI]
        DB[(PostgreSQL - Drizzle)]
        AF[Auto-Fix Logic]
        SG[Safety Guards]
    end

    subgraph "CodeGuard Frontend (React)"
        DS[Review Dashboard]
        VX[Fix Flow Visualizer]
    end

    PR --> WH
    WH --> VWH
    VWH --> FD
    FD --> AE
    AE --> DB
    DB --> COM
    
    AE -- "High Risk Detected" --> AF
    AF --> SG
    SG -- "Pass" --> AE
    AE -- "Generate Fix" --> FIXPR
    
    DB --> DS
    AF --> VX
```

---

## ⚙️ How It Works (Step-by-Step)

### 1. Detection (The "Sentry" Phase)
- **Webhook Integration:** CodeGuard listens for PR events. When a code change is pushed, the backend validates the signature and fetches the full **Diff**.
- **Deep Analysis:** The AI engine analyzes the diff line-by-line. Instead of simple linting, it understands *context* and *intent*.
- **Risk Scoring:** Every review is assigned a risk level (Low, Medium, High).

### 2. Remediation (The "Surgeon" Phase)
- **Safety First:** Before touching code, **Safety Guards** verify that the file isn't highly sensitive (e.g., core auth logic, payment gateways).
- **Contextual Fixes:** The fix agent (using a strict Senior Sec Engineer persona) reads the entire vulnerable file, not just the diff, to ensure the fix is architecturally sound.
- **Automated Delivery:** A new branch is created, the fix is committed, and a new PR is opened targeting the developer's branch.

### 3. Monitoring (The "Observer" Phase)
- **Live Dashboard:** Real-time visualization of codebase health.
- **Statistical insights:** Track vulnerability trends across your entire organization.

---

## 📂 Repository Structure

| Directory | Purpose |
| :--- | :--- |
| `client/` | React frontend built with Vite, Tailwind CSS, and Framer Motion. |
| `server/` | Node.js/Express backend handling webhooks, AI logic, and VCS integration. |
| `shared/` | Shared TypeScript types and Drizzle ORM database schema. |
| `script/` | Build and utility scripts. |

### Key Files:
- 🧠 `server/openai.ts`: Core AI integration and prompting logic.
- 🔌 `server/github.ts` & `server/gitlab.ts`: VCS API interaction layers.
- 🚦 `server/routes.ts`: Main API router and webhook handlers.
- 📐 `shared/schema.ts`: Database models.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Radix UI, Recharts, Wouter.
- **Backend:** Node.js, Express, Socket.io (Real-time updates), Passport.js (Auth).
- **AI:** OpenAI Engine (GPT-4o / GPT-4 Turbo).
- **Database:** PostgreSQL with Drizzle ORM.
- **Language:** TypeScript (End-to-end type safety).

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL Database
- OpenAI API Key
- GitHub/GitLab Personal Access Token

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/codeguard

# AI
OPENAI_API_KEY=your_openai_api_key

# GitHub Auth (OAuth App)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/auth/github/callback

# GitLab Integration
GITLAB_TOKEN=your_gitlab_personal_access_token

# App Settings
SESSION_SECRET=your_random_session_secret
PORT=5000
```

### 3. Installation & Run
```bash
# Clone the repository
git clone https://github.com/pritpatel2412/CodeGuard.git
cd CodeGuard

# Install dependencies
npm install

# Initialize the database schema
npm run db:push

# Start the development server
npm run dev
```

The application will be accessible at `http://localhost:5000`.

---

## 🔒 Security Guards

CodeGuard includes built-in safety mechanisms to prevent unintended code changes:
- **Sensitive Path Blocking:** Files like `.env`, `secrets.yaml`, or `auth.ts` are automatically flagged for manual review only.
- **Validation:** Generated code is checked for syntax errors and malicious patterns before being committed.
- **Branch isolation:** All fixes occur on isolated branches, never on the source branch directly.

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more information.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Developed with ❤️ by [Prit Patel](https://github.com/pritpatel2412)
