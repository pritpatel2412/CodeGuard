# YC Application Draft

## 1. What is your company going to make?
CodeGuard makes an automated compliance and security engine for B2B software companies that need verifiable security audits. As of June 2026, we have processed 107 automated PR reviews across 13 connected repositories using a semantic graph analysis that catches multi-file logic flaws. We will next expand our automated readiness reports to support SOC2 in addition to the ASVS 5.0 framework.

## 2. How many active users or customers do you have? How many are paying?
We have 12 registered users, but currently 0 active users and 0 paying customers. Out of the 13 repositories connected historically, we have seen 0 active users in the last 30 days resulting in $0 of generated revenue. We plan to manually convert one of the maintainers from our evaluation corpus into a free pilot this week to establish active usage.

## 3. Who are your competitors? What do you understand about your business that they don't?
We compete against legacy static analysis tools like Snyk or SonarQube, and human security consulting firms that perform manual compliance audits. Legacy tools analyze files in isolation and miss logic flaws spanning multiple files, whereas our semantic graph engine successfully identified 100% of vulnerabilities in our evaluation dataset without relying on single-file pattern matching. We will continue to build adversarial patch verification to automatically prove that merged fixes cannot be bypassed, rendering traditional manual penetration testing obsolete.

## 4. How do or will you make money?
We charge software companies a flat fee to generate cryptographically signed compliance readiness artifacts on-demand. While we currently have $0 in revenue, replacing a traditional $15,000 manual audit with a $500 automated API call creates a 96% cost reduction for our future buyers. We will implement a monetization gate for downloading the official PDF reports to convert our upcoming pilot users into paying customers.

## 5. Why now?
The release of advanced LLM reasoning models and agentic code review like GitHub Copilot in early 2026 has fundamentally shifted developer expectations away from manual code review. Our AI-driven engine currently achieves a 76.9% F1 score at detecting complex logic vulnerabilities, a capability that was technically impossible prior to the context window and reasoning upgrades of the newest frontier models. We will leverage this capability to generate automated compliance evidence that satisfies the rigorous new ASVS 5.0 framework requirements introduced recently.

---

## ⚠️ Honest Weak-Points Ranking

These answers are ranked from most damaging to least damaging in an actual YC interview context, based on the current live data:

1. **Active Users & Paying Customers (Critical Weakness)**
   - *Why it hurts*: Having 0 active users in the last 30 days, despite having 12 registered users and 13 connected repos historically, signals high churn or a product that doesn't solve a hair-on-fire problem. Stating we have 0 paying customers is normal for a pivot, but 0 active users means we don't even have a feedback loop.
   - *Impact*: A YC partner will likely stop the interview here and ask why we aren't talking to users.
2. **Unvalidated Revenue Model (Major Weakness)**
   - *Why it hurts*: We claim we will charge for Audit Mode, but we have exactly 0 completed Audit Mode runs and $0 revenue. The core business thesis (that people will pay $500 for an automated ASVS artifact instead of a $15,000 manual audit) is currently a hypothesis, not a fact backed by behavior.
   - *Impact*: It makes the pricing answer sound like a guess rather than a verified willingness-to-pay.
3. **Pivot Mismatch / Feature Usage (Moderate Weakness)**
   - *Why it hurts*: We have processed 107 PR reviews, but our pitch relies heavily on the Audit Mode artifact, which has 0 historical runs. The traction we do have is for a commoditized feature, not the feature we are positioning as our core differentiator. 
   - *Impact*: It forces us to defend a pivot where we haven't yet proven the new direction has traction.
