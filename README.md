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

---

## 🛠️ Architecture & Pipeline

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
        DS[Premium Dashboard]
        VX[Fix Flow Visualizer]
        TM[Theme Engine - 3 Modes]
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
```bash
# Clone the repository
git clone https://github.com/pritpatel2412/CodeGuard.git
cd CodeGuard

# Install dependencies
npm install

# Initialize the database
npm run db:push

# Start the development server
npm run dev
```

---

## 🔒 Security & Safety Guards

CodeGuard includes built-in safety mechanisms to protect your code:
- **Path Sanitization**: Sensitive files (`.env`, `secrets.yaml`, `auth.ts`) are automatically flagged and never modified by AI.
- **Syntax Validation**: Generated fixes are validated for syntax and logic before PR creation.
- **Branch Isolation**: All AI actions occur on dedicated, isolated branches.

---

Developed with ❤️ by [Prit Patel](https://github.com/pritpatel2412)
