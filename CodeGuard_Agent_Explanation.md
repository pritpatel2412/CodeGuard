# CodeGuard AI Agent — Architecture & Pipeline Explanation

This document explains how the **CodeGuard AI Agent** works, its step-by-step pipeline from detecting high-risk pull requests to generating automated fixes, and where the corresponding code is located in the repository.

## 🎯 What is the CodeGuard Agent?
The CodeGuard Agent is an intelligent, automated Security and Code Quality reviewer. It acts like a "Senior App Sec Engineer" that constantly monitors your repositories. When a developer creates a Pull Request (PR), the agent automatically reads the code, detects vulnerabilities or bugs, and adds comments. 

For **High-Risk** issues, the agent takes it a step further: it automatically generates the fixed code, creates a new branch, and opens a new Pull Request that is secure (Medium or Low Risk), significantly speeding up the remediation process.

---

## ⚙️ How the Pipeline Works

### 1. Webhook Trigger & PR Analysis (The "Detection" Phase)
- **Action:** A developer opens or updates a Pull Request on GitHub or GitLab.
- **Trigger:** GitHub/GitLab sends a webhook payload to the CodeGuard backend.
- **Processing:** CodeGuard validates the webhook signature, fetches the full **Diff** (the exact code changes), and sends this data to the OpenAI Engine.
- **AI Analysis:** The AI analyzes the diff for Bugs, Security, Performance, and Readability issues. It assigns an overall "Risk Level" (High, Medium, or Low).
- **Feedback:** CodeGuard immediately posts line-by-line comments directly on the PR in GitHub, along with an executive summary.

### 2. The Auto-Fix Trigger (The "Remediation" Phase)
- **Action:** When a High-Risk vulnerability is detected, CodeGuard is triggered to resolve the specific issue.
- **Safety Checks:** Before proceeding, the system checks built-in **Safety Guards**. If the file contains highly sensitive logic (e.g., `auth`, `payment`, `.env`), auto-fix is blocked to enforce manual review.
- **File Retrieval:** CodeGuard uses the GitHub API to fetch the complete context of the vulnerable file from the exact branch.

### 3. AI Fix Generation
- **Action:** The fragile file and the vulnerability description are sent to the AI fix agent (using a strict "Senior App Sec Engineer" persona).
- **Generation:** The AI generates a complete, secure replacement for the file.
- **Validation:** CodeGuard validates the generated code to ensure it isn't empty or malicious (e.g., blocking `rm -rf`).

### 4. Creating the Secure Pull Request (The "Delivery" Phase)
- **Branch Creation:** CodeGuard creates a brand new branch named `security-fix-PR_NUMBER-RANDOM`.
- **Committing:** The AI-generated secure code is committed to this new branch.
- **New Pull Request:** CodeGuard opens a **new Pull Request** targeting the original PR's branch. This new PR contains the safe, refactored code (effectively turning a High-Risk issue into a Low/Medium-Risk state).
- **Notification:** Finally, CodeGuard posts a comment on the *original* PR with a link: *"🚨 High-risk security issue detected. A security-fix PR has been created: ➡️ [Link]."* 

---

## 📂 Where is the Code Located?

If you need to show the exact files and code that run this pipeline, refer to the following locations in the codebase:

### Backend Architecture (Node.js/Express)
- **Webhook & API Routes (`server/routes.ts`)**:
  - The brain of the API. You can find the GitHub Webhook listener at `app.post("/api/webhooks/github/:repositoryId")`.
  - The Auto-Fix API logic is located at `app.post("/api/reviews/:reviewId/comments/:commentId/fix")`. This is where the branch creation, AI prompting, and new PR generation happens.
- **AI Logic (`server/openai.ts`)**:
  - Contains `analyzeCodeDiff` (for initial PR review) and `generateFix` (for writing the secure code). Here you will see the prompts and OpenAI integration.
- **GitHub Integrations (`server/github.ts` / `server/gitlab.ts`)**:
  - Contains all the helper functions for interacting with remote repositories: `getPullRequestDiff`, `createBranch`, `updateFile`, and `createPullRequest`.

### Frontend / UI (React)
- **Dashboard (`client/src/pages/dashboard.tsx`)**:
  - Provides the main view where developers can see their connected repositories and review statistics.
- **AI Fix Visualizer (`client/src/components/ai-fix-flow.tsx` & `client/src/pages/demo-ai-fix.tsx`)**:
  - Contains animated components that visualize the automated security fix workflow to the user.

### Database Layer
- **Schema & Tables (`shared/schema.ts`)**:
  - Defines the database tables (`repositories`, `reviews`, `review_comments`) that store the state of the PRs and the AI findings.
- **Database Storage (`server/storage.ts`)**:
  - Contains the logic for reading from and writing to the database.

---

## 🚀 Summary for your Teacher
1. **Webhook receives the PR.**
2. **AI analyzes the PR and flags High-Risk issues mapping to exact lines.**
3. **If triggered, the platform runs Safety Guards, fetches the full file, and prompts the AI to write a secure replacement.**
4. **CodeGuard Agent automatically creates a new branch, pushes the fix, and opens a secondary, Secure Pull Request to fix the original High-Risk PR.**
