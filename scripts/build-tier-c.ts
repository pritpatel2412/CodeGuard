import fs from 'fs';
import path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'eval/tier-c-corpus');
const METHODOLOGY_FILE = path.join(OUTPUT_DIR, 'SELECTION_METHODOLOGY.md');

const cases = [
  {
    id: "case-001",
    cve: "ADV-SAFE-001",
    repo: "internal/adversarial",
    category: "control",
    desc: "Safe: Log password length, not password",
    cwes: [],
    diff: `diff --git a/auth.js b/auth.js
index a1b2c3d..e4f5g6h 100644
--- a/auth.js
+++ b/auth.js
@@ -10,4 +10,5 @@
 function login(username, password) {
   const user = db.findUser(username);
-  console.log("User login attempt", username);
+  // Log attempt with password length to debug entropy issues
+  console.log("User login attempt", username, "pw_len:", password.length);
   if (verify(user.hash, password)) {
`
  },
  {
    id: "case-002",
    cve: "ADV-VULN-001",
    repo: "internal/adversarial",
    category: "access_control",
    desc: "Vuln: Auth check after action",
    cwes: ["CWE-285"],
    diff: `diff --git a/admin.js b/admin.js
index a1b2c3d..e4f5g6h 100644
--- a/admin.js
+++ b/admin.js
@@ -10,6 +10,5 @@
 function deleteUser(req, res) {
   const target = req.body.userId;
+  db.users.delete(target);
   if (!req.user.isAdmin) {
     return res.status(403).send("Forbidden");
   }
-  db.users.delete(target);
   res.send("Deleted");
 }
`
  },
  {
    id: "case-003",
    cve: "ADV-SAFE-002",
    repo: "internal/adversarial",
    category: "control",
    desc: "Safe: Hardcoded test password",
    cwes: [],
    diff: `diff --git a/test/auth.test.js b/test/auth.test.js
index a1b2c3d..e4f5g6h 100644
--- a/test/auth.test.js
+++ b/test/auth.test.js
@@ -5,4 +5,5 @@
 it('should login successfully', () => {
-  const token = api.login("testuser", process.env.TEST_PASS);
+  // Using mock DB, hardcode password for test runner
+  const token = api.login("testuser", "SuperSecretMockPass123!");
   expect(token).toBeDefined();
 });
`
  },
  {
    id: "case-004",
    cve: "ADV-SAFE-003",
    repo: "internal/adversarial",
    category: "control",
    desc: "Safe: SQL concat with trusted ENUM",
    cwes: [],
    diff: `diff --git a/db.js b/db.js
index a1b2c3d..e4f5g6h 100644
--- a/db.js
+++ b/db.js
@@ -5,5 +5,7 @@
 function getItems(sortDirection) {
-  const dir = sortDirection === "DESC" ? "DESC" : "ASC";
-  return db.query("SELECT * FROM items ORDER BY created_at " + dir);
+  // Explicitly validate against allowed enum to prevent SQLi
+  const allowed = ["ASC", "DESC"];
+  const dir = allowed.includes(sortDirection) ? sortDirection : "ASC";
+  return db.query("SELECT * FROM items ORDER BY created_at " + dir);
 }
`
  },
  {
    id: "case-005",
    cve: "ADV-VULN-002",
    repo: "internal/adversarial",
    category: "ssrf",
    desc: "Vuln: SSRF via host header bypass",
    cwes: ["CWE-918"],
    diff: `diff --git a/fetcher.js b/fetcher.js
index a1b2c3d..e4f5g6h 100644
--- a/fetcher.js
+++ b/fetcher.js
@@ -5,5 +5,4 @@
 function fetchImage(req, res) {
   let targetUrl = req.query.url;
-  if (!targetUrl.startsWith("https://trusted.com/")) return res.status(400);
   // allow fetching from other domains if host header matches
+  if (req.headers.host !== "trusted.com") return res.status(400);
   request.get(targetUrl).pipe(res);
 }
`
  },
  {
    id: "case-006",
    cve: "ADV-SAFE-004",
    repo: "internal/adversarial",
    category: "control",
    desc: "Safe: Regex vulnerability fixed (lookalike)",
    cwes: [],
    diff: `diff --git a/validate.js b/validate.js
index a1b2c3d..e4f5g6h 100644
--- a/validate.js
+++ b/validate.js
@@ -2,5 +2,5 @@
 function validateEmail(email) {
-  // Vulnerable to ReDoS
-  return /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/.test(email);
+  // Fixed ReDoS by removing nested quantifiers
+  return /^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9]{2,4}$/.test(email);
 }
`
  },
  {
    id: "case-007",
    cve: "ADV-VULN-003",
    repo: "internal/adversarial",
    category: "access_control",
    desc: "Vuln: Path traversal via replace",
    cwes: ["CWE-22"],
    diff: `diff --git a/files.js b/files.js
index a1b2c3d..e4f5g6h 100644
--- a/files.js
+++ b/files.js
@@ -2,5 +2,6 @@
 function readFile(req, res) {
   let filename = req.query.file;
-  filename = filename.replace(/\\.\\.\\//g, ""); // strip traversal
+  // Buggy fix: only replaces first instance, or can be bypassed with ....//
+  filename = filename.replace("../", ""); 
   const filepath = path.join("/var/www/html", filename);
   res.sendFile(filepath);
 }
`
  },
  {
    id: "case-008",
    cve: "ADV-SAFE-005",
    repo: "internal/adversarial",
    category: "control",
    desc: "Safe: Eval used in safe build script",
    cwes: [],
    diff: `diff --git a/scripts/build-config.js b/scripts/build-config.js
index a1b2c3d..e4f5g6h 100644
--- a/scripts/build-config.js
+++ b/scripts/build-config.js
@@ -10,4 +10,5 @@
 const configRaw = fs.readFileSync("internal-config.txt", "utf8");
 // Safe because internal-config.txt is part of the repo and trusted
-const config = eval("(" + configRaw + ")");
+const config = JSON.parse(configRaw); // Refactoring to JSON, but eval was technically safe here
`
  },
  {
    id: "case-009",
    cve: "ADV-VULN-004",
    repo: "internal/adversarial",
    category: "injection",
    desc: "Vuln: Command injection via exec",
    cwes: ["CWE-78"],
    diff: `diff --git a/util.js b/util.js
index a1b2c3d..e4f5g6h 100644
--- a/util.js
+++ b/util.js
@@ -2,5 +2,5 @@
 function pingHost(req, res) {
   const host = req.query.host;
-  exec(\`ping -c 1 \${escapeShellArg(host)}\`, (err, stdout) => {
+  exec("ping -c 1 " + host, (err, stdout) => {
     res.send(stdout);
   });
 }
`
  },
  {
    id: "case-010",
    cve: "ADV-SAFE-006",
    repo: "internal/adversarial",
    category: "control",
    desc: "Safe: XSS looking variable but sanitized in template",
    cwes: [],
    diff: `diff --git a/view.js b/view.js
index a1b2c3d..e4f5g6h 100644
--- a/view.js
+++ b/view.js
@@ -2,5 +2,6 @@
 function renderPage(userInput) {
-  return \`<div>\${userInput}</div>\`; // XSS
+  // We use a trusted HTML sanitization library before rendering
+  const safeInput = DOMPurify.sanitize(userInput);
+  return \`<div>\${safeInput}</div>\`;
 }
`
  }
];

function build() {
  console.log("Building Tier C (Adversarial) corpus...");
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const c of cases) {
    const caseDir = path.join(OUTPUT_DIR, c.id);
    fs.mkdirSync(caseDir, { recursive: true });
    
    fs.writeFileSync(path.join(caseDir, 'diff.patch'), c.diff);
    fs.writeFileSync(path.join(caseDir, 'label.json'), JSON.stringify({
      cve: c.cve,
      category: c.category,
      source_url: "internal",
      repo: c.repo,
      cwes: c.cwes
    }, null, 2));
    
    console.log(`[+] Added ${c.id}: ${c.desc}`);
  }

  const md = `
# Tier C: Adversarial & Near-Miss Corpus Selection Methodology

This corpus was manually curated specifically to stress-test CodeGuard against false positives and multi-hop reasoning failures.

## Rules Applied
1. **Source**: Synthetically generated adversarial examples.
2. **Suspicious-but-Safe (Controls)**: Includes commits that look like vulnerabilities (e.g. logging variables named \`password\`, using \`eval\` in a trusted script context) but are actually safe.
3. **Multi-Hop Vulnerabilities**: Includes logical vulnerabilities where the failure requires understanding control flow across lines (e.g. authorization check happening *after* the action).
4. **Volume**: ${cases.length} cases (mix of true positives and adversarial true negatives).
`;

  fs.writeFileSync(METHODOLOGY_FILE, md);
  console.log("Tier C build complete!");
}

build();
