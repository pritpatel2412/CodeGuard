# CodeGuard Demo Script (90 Seconds)

**Objective**: Show YC partners a real, live path through the product that proves we are not just another generic AI coding assistant, but an automated compliance and security audit engine.

**Safety Net / Fallback**: 
Before the interview, record a clean, unedited screen recording of this exact flow using Loom or QuickTime. Keep it saved locally as `codeguard-demo-fallback.mp4` on your desktop. If the live environment flakes, network drops, or a pipeline stalls during the interview, immediately say "The network is slow, but here is exactly what this looks like when run cleanly," and hit play.

**Pre-selected Target Repo**: `CodeGuardHQ/demo-express-sqli`
*Why this repo?* It's a tiny, recognizable Express + Postgres application (under 10 files). It contains a genuine, un-obfuscated SQL injection vulnerability (`req.body.id` directly into `db.query`). It is not a contrived toy example with a planted bug comment; it looks exactly like how junior devs actually write endpoints. It guarantees the taint-tracking engine has something real to catch within a 5-second processing window.

---

## The Script & Flow (Target Time: 85 Seconds)

### Step 1: The Context & The Hook (0:00 - 0:15)
*Action: Start on the CodeGuard dashboard showing connected repos.*
**Speaker**: "Companies pay human security firms $10,000 to $50,000 for compliance audits. CodeGuard replaces that with an autonomous security engine. We start by plugging directly into their existing GitHub workflow."
*Action: Click "Connect Repository" and select `CodeGuardHQ/demo-express-sqli`.*

### Step 2: The Continuous Review (0:15 - 0:35)
*Action: Tab over to GitHub. Open a pre-prepared PR on `demo-express-sqli` that adds a new `GET /user` endpoint with a SQL injection.*
**Speaker**: "Developers just work normally. When they open a PR, our agentic engine does a deep semantic analysis."
*Action: Show the PR timeline. Refresh to show the CodeGuard bot instantly dropping a PR comment blocking the merge.*
**Speaker**: "It caught a live SQL injection here by tracing the exact taint path from `req.body` to the database sink. But catching bugs in PRs is commoditized. Here is the actual business."

### Step 3: The Pivot to Audit Mode (0:35 - 0:55)
*Action: Tab back to the CodeGuard dashboard. Click into the repo, click the "Run ASVS 5.0 Audit" button.*
**Speaker**: "When it's time for SOC2 or a vendor security questionnaire, companies need a verified report. Instead of hiring consultants, they run Audit Mode."
*Action: Show the Audit Mode progress bar rapidly analyzing the entire repository against the ASVS 5.0 framework.*

### Step 4: The Compliance Artifact (0:55 - 1:15)
*Action: The audit completes. Open the generated ASVS Readiness Report.*
**Speaker**: "CodeGuard generates a cryptographically signed, line-by-line evidence document proving compliance against the OWASP Application Security Verification Standard. It doesn't just say 'pass' or 'fail'; it links directly to the AST nodes and mitigation controls in the codebase as proof."
*Action: Scroll through the report showing the green checks and the evidence trail.*

### Step 5: The Monetization Gate (1:15 - 1:25)
*Action: Click "Download Official PDF" on the report.*
*Action: The screen dims, and the Pricing Gate modal appears.*
**Speaker**: "Because this replaces a $15,000 manual audit, we charge a fraction of that value. Companies pay here to unlock the official, signed artifact they can hand to their auditors or enterprise buyers."

### Step 6: The Kicker (1:25 - 1:30)
**Speaker**: "We've turned a multi-week, five-figure consulting engagement into a $500 API call."
*Action: End demo. Stop screen share or pause.*

---

## Pre-Flight Checklist (Do this 30 mins before the interview)
1. Ensure `CodeGuardHQ/demo-express-sqli` is disconnected from the local database.
2. Ensure the demo branch is pushed to GitHub, but the PR is *not* opened yet.
3. Verify the local server is running and ngrok/devtunnel is active for the webhook.
4. Verify the fallback video is on the desktop and opens instantly.
5. Practice the talk track twice while clicking through. No reading from this document.
