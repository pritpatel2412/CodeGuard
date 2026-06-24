# CodeGuard Free Offer Mechanism

This document describes the architectural implementation of the public "Free Audit" offer, a temporary promotion that provides a full CodeGuard Audit Mode pass (typically gated behind a $1,500+ paywall) for free.

## Why Admin-Mediated?

The public offer was designed intentionally as an **admin-mediated** process rather than a fully self-serve free tier. This fulfills three goals:
1. **Quality Control & Engagement:** A core promise of the offer is that the founder personally reviews the request. It's a high-touch sales and onboarding motion disguised as a free trial.
2. **Abuse Prevention:** A self-serve $1,500 coupon would be immediately scraped by bots, costing thousands of dollars in API usage before it could be shut down.
3. **No Auth Friction:** Prospective users do not need to create an account, install a GitHub app, or add a credit card to request the audit. The admin handles the orchestration.

## How the Flow Works

1. **Intake (`client/src/pages/free-audit-request.tsx`)**
   - The public visits the intake page. If the current `promo_offers` row for this campaign has an `ends_at` date in the future, the form is shown.
   - Submissions are recorded in the `free_audit_requests` table with a `pending` status.
   
2. **Admin Queue (`client/src/pages/admin/free-audit-queue.tsx`)**
   - An admin logs in and navigates to the "Free Audit Queue".
   - The admin reviews the repository URL and the submitter's motivation text.
   - The admin clicks "Approve" (or "Reject").

3. **Orchestration (`server/routes/admin.ts`)**
   - Upon "Approve", the backend performs several actions:
     - Updates the `free_audit_requests` status to `approved`.
     - Creates a standard `audits` record attributed to the Admin's `userId`.
     - Creates an `audit_orders` record with `status: "comped"`. This ensures the finance and billing layer ignores this audit when reconciling payments, bypassing the paywall.
     - Kicks off the standard `runAuditAsync` function just as a paid order would.
     - Logs the action in `adminActionLog`.

## Cost Ceilings and Safety

Because CodeGuard's backend utilizes LLMs that incur real-world costs per token, a sudden viral spike could theoretically bankrupt the system if an admin rapidly approved requests.

To mitigate this, two safety limits are enforced:
1. **Public Volume Warning:** If there are more than 50 `pending` requests in the queue, the public intake form automatically displays a "High volume" warning, setting expectations that new requests might not be fulfilled.
2. **Hard Cost Ceiling:** The admin dashboard calculates the total API spend for the current day across the entire platform (by summing `cost_usd` in `api_usage_log`). If this sum exceeds **$100**, the "Approve" button is disabled and the backend strictly rejects further approvals. This guarantees the platform cannot lose more than $100 per day on free audits.

## Managing the Offer Window

The offer window is controlled purely via the database `promo_offers` table.
- **To End Early:** Set the `ends_at` timestamp to a past date. The frontend will immediately fall back to the standard pricing page link.
- **To Restart/Extend:** Update the `ends_at` timestamp to a future date.

*Note: No code changes are required to turn the offer on or off.*
