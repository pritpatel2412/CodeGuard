import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const corpusDir = path.join(__dirname, '../eval/corpus');

if (!fs.existsSync(corpusDir)) {
  fs.mkdirSync(corpusDir, { recursive: true });
}

const cases = [
  // Clean Diffs (False Positive checks)
  {
    id: "001-clean-ui",
    diff: `diff --git a/client/src/components/Button.tsx b/client/src/components/Button.tsx
--- a/client/src/components/Button.tsx
+++ b/client/src/components/Button.tsx
@@ -10,6 +10,6 @@
 export function Button({ children, ...props }: ButtonProps) {
-  return <button className="bg-blue-500" {...props}>{children}</button>;
+  return <button className="bg-blue-600 hover:bg-blue-700" {...props}>{children}</button>;
 }`,
    expected: { risk_level: "low", comments: [] },
    notes: "A simple UI styling change. Should emit zero findings. Tests false positive rate."
  },
  {
    id: "002-clean-refactor",
    diff: `diff --git a/server/utils.ts b/server/utils.ts
--- a/server/utils.ts
+++ b/server/utils.ts
@@ -1,5 +1,5 @@
-export function add(a: number, b: number) {
-  return a + b;
+export function add(a: number, b: number): number {
+  const sum = a + b;
+  return sum;
 }`,
    expected: { risk_level: "low", comments: [] },
    notes: "Simple refactor adding types and variable. Should emit zero findings."
  },

  // Security Diffs
  {
    id: "003-sqli",
    diff: `diff --git a/server/routes/users.ts b/server/routes/users.ts
--- a/server/routes/users.ts
+++ b/server/routes/users.ts
@@ -20,5 +20,5 @@
 app.get("/api/users", async (req, res) => {
-  const users = await db.execute("SELECT * FROM users WHERE status = 'active'");
+  const status = req.query.status || 'active';
+  const users = await db.execute("SELECT * FROM users WHERE status = '" + status + "'");
   res.json(users);
 });`,
    expected: {
      risk_level: "high",
      comments: [
        { path: "server/routes/users.ts", line: 22, type: "security" } // Let AI figure out the exact line, but we assert it finds a security issue
      ]
    },
    notes: "SQL Injection via string concatenation. Must be flagged as security/high."
  },
  {
    id: "004-xss",
    diff: `diff --git a/client/src/pages/Profile.tsx b/client/src/pages/Profile.tsx
--- a/client/src/pages/Profile.tsx
+++ b/client/src/pages/Profile.tsx
@@ -15,5 +15,5 @@
 export function Profile({ user }) {
-  return <div>{user.bio}</div>;
+  return <div dangerouslySetInnerHTML={{ __html: user.bio }} />;
 }`,
    expected: {
      risk_level: "medium", // or high
      comments: [
        { path: "client/src/pages/Profile.tsx", line: 16, type: "security" }
      ]
    },
    notes: "XSS vulnerability using dangerouslySetInnerHTML."
  },
  {
    id: "005-hardcoded-secret",
    diff: `diff --git a/server/services/stripe.ts b/server/services/stripe.ts
--- a/server/services/stripe.ts
+++ b/server/services/stripe.ts
@@ -1,2 +1,3 @@
 import Stripe from "stripe";
-const stripe = new Stripe(process.env.STRIPE_KEY);
+const stripe = new Stripe("fake_stripe_key_1234567890abcdefGHIJKLMN");
+export default stripe;`,
    expected: {
      risk_level: "high",
      comments: [
        { path: "server/services/stripe.ts", line: 2, type: "security" }
      ]
    },
    notes: "Hardcoded production Stripe secret."
  },

  // Performance
  {
    id: "006-n-plus-1",
    diff: `diff --git a/server/routes/posts.ts b/server/routes/posts.ts
--- a/server/routes/posts.ts
+++ b/server/routes/posts.ts
@@ -30,5 +30,8 @@
 app.get("/posts", async (req, res) => {
   const posts = await db.query.posts.findMany();
+  for (const post of posts) {
+    post.author = await db.query.users.findFirst({ where: eq(users.id, post.authorId) });
+  }
   res.json(posts);
 });`,
    expected: {
      risk_level: "medium",
      comments: [
        { path: "server/routes/posts.ts", type: "performance" }
      ]
    },
    notes: "N+1 query in a loop. Should flag as performance."
  },

  // Bug
  {
    id: "007-off-by-one",
    diff: `diff --git a/client/src/utils/pagination.ts b/client/src/utils/pagination.ts
--- a/client/src/utils/pagination.ts
+++ b/client/src/utils/pagination.ts
@@ -5,5 +5,5 @@
 export function getPages(totalCount: number, pageSize: number) {
-  return Math.ceil(totalCount / pageSize);
+  return Math.floor(totalCount / pageSize);
 }`,
    expected: {
      risk_level: "low",
      comments: [
        { path: "client/src/utils/pagination.ts", type: "bug" }
      ]
    },
    notes: "Logical bug: Math.floor instead of Math.ceil for pagination."
  },

  // Bypass Safety Guard Cases (Gap 3)
  // These should be flagged by the enhanced safety guard, but NOT by the current one.
  {
    id: "008-bypass-auth-session",
    diff: `diff --git a/server/middleware/session.ts b/server/middleware/session.ts
--- a/server/middleware/session.ts
+++ b/server/middleware/session.ts
@@ -1,5 +1,5 @@
+import { verifyToken } from "../utils/crypto";
 export function sessionMiddleware(req, res, next) {
-  const token = req.cookies.token;
+  const token = req.headers.authorization?.split(" ")[1];
   req.user = verifyToken(token);
   next();
 }`,
    expected: { risk_level: "low", comments: [] }, // AI review might find bugs, but the point is testing the auto-fix guard bypass.
    notes: "Bypass test: touches auth (authorization header, crypto import) but filename is 'session.ts'. Expected to bypass old guard, block in new guard."
  },
  {
    id: "009-bypass-payment-stripe",
    diff: `diff --git a/server/services/checkout.ts b/server/services/checkout.ts
--- a/server/services/checkout.ts
+++ b/server/services/checkout.ts
@@ -1,5 +1,6 @@
+import Stripe from "stripe";
 export async function processOrder(orderId: string) {
-  // do something
+  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
+  await stripe.charges.create({ amount: 1000, currency: "usd" });
 }`,
    expected: { risk_level: "low", comments: [] },
    notes: "Bypass test: touches payments (Stripe) but filename is 'checkout.ts'. Expected to bypass old guard, block in new guard."
  },
  {
    id: "010-bypass-crypto-hash",
    diff: `diff --git a/server/utils/hashing.ts b/server/utils/hashing.ts
--- a/server/utils/hashing.ts
+++ b/server/utils/hashing.ts
@@ -1,4 +1,5 @@
+import crypto from "crypto";
 export function hashPassword(pwd: string) {
-  return btoa(pwd);
+  return crypto.createHash("sha256").update(pwd).digest("hex");
 }`,
    expected: { risk_level: "low", comments: [] },
    notes: "Bypass test: touches crypto logic but filename is 'hashing.ts'. Expected to bypass old guard, block in new guard."
  }
];

cases.forEach(c => {
  const caseDir = path.join(corpusDir, c.id);
  if (!fs.existsSync(caseDir)) fs.mkdirSync(caseDir);
  
  fs.writeFileSync(path.join(caseDir, "diff.patch"), c.diff);
  fs.writeFileSync(path.join(caseDir, "expected.json"), JSON.stringify(c.expected, null, 2));
  fs.writeFileSync(path.join(caseDir, "notes.md"), c.notes);
});

console.log("Successfully generated " + cases.length + " corpus cases in " + corpusDir);
