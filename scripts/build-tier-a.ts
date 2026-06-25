import fs from 'fs';
import path from 'path';
import https from 'https';

const OUTPUT_DIR = path.join(process.cwd(), 'eval/tier-a-corpus');
const METHODOLOGY_FILE = path.join(OUTPUT_DIR, 'SELECTION_METHODOLOGY.md');

const PACKAGES = [
  // JS/TS
  { name: 'express', ecosystem: 'npm' },
  { name: 'next', ecosystem: 'npm' },
  { name: 'strapi', ecosystem: 'npm' },
  { name: 'ghost', ecosystem: 'npm' },
  // Python
  { name: 'django', ecosystem: 'PyPI' },
  { name: 'tensorflow', ecosystem: 'PyPI' },
  { name: 'flask', ecosystem: 'PyPI' },
  { name: 'fastapi', ecosystem: 'PyPI' },
  // Ruby
  { name: 'rails', ecosystem: 'RubyGems' },
  { name: 'discourse', ecosystem: 'RubyGems' },
  { name: 'gitlab', ecosystem: 'RubyGems' },
  // PHP
  { name: 'symfony/symfony', ecosystem: 'Packagist' },
  { name: 'laravel/framework', ecosystem: 'Packagist' },
  // Go
  { name: 'github.com/kubernetes/kubernetes', ecosystem: 'Go' },
  { name: 'github.com/prometheus/prometheus', ecosystem: 'Go' },
  { name: 'github.com/grafana/grafana', ecosystem: 'Go' },
  { name: 'github.com/hashicorp/vault', ecosystem: 'Go' },
  // Java
  { name: 'org.springframework:spring-core', ecosystem: 'Maven' },
  { name: 'org.apache.tomcat:tomcat', ecosystem: 'Maven' },
  { name: 'org.elasticsearch:elasticsearch', ecosystem: 'Maven' },
  // Rust
  { name: 'tokio', ecosystem: 'crates.io' },
  { name: 'hyper', ecosystem: 'crates.io' },
  { name: 'actix-web', ecosystem: 'crates.io' }
];

const CATEGORIES = {
  'injection': ['CWE-89', 'CWE-78', 'CWE-94', 'CWE-79'],
  'access_control': ['CWE-284', 'CWE-285', 'CWE-862', 'CWE-863', 'CWE-22'],
  'ssrf': ['CWE-918'],
  'deserialization': ['CWE-502'],
  'secrets': ['CWE-798', 'CWE-256', 'CWE-312'],
  'other': []
};

// State
let selectedCases: any[] = [];
let selectedControls: any[] = [];
let categoryCounts: Record<string, number> = {
  injection: 0,
  access_control: 0,
  ssrf: 0,
  deserialization: 0,
  secrets: 0,
  other: 0
};

// Helpers
function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

function fetchOsv(pkg: any): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ package: pkg });
    const req = https.request('https://api.osv.dev/v1/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body).vulns || []));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function build() {
  console.log("Building Tier A corpus via OSV API...");
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const pkg of PACKAGES) {
    if (selectedCases.length >= 50 && selectedControls.length >= 10) break;

    console.log(`Querying ${pkg.ecosystem}/${pkg.name}...`);
    let vulns = [];
    try {
      vulns = await fetchOsv(pkg);
    } catch(e) { continue; }

    for (const data of vulns) {
      if (selectedCases.length >= 50) break;
      if (!data.published || !data.database_specific || !data.references) continue;

      // Must be 2021 or later
      const year = parseInt(data.published.substring(0, 4), 10);
      if (year < 2021) continue;
      
      const cve = data.aliases && data.aliases.length > 0 ? data.aliases[0] : data.id;
      
      // Filter out BIT- format
      if (cve.startsWith('BIT-')) continue;

      const cwes = data.database_specific.cwe_ids || [];
      let cat = 'other';
      for (const [key, cweList] of Object.entries(CATEGORIES)) {
        if (cweList.some(cwe => cwes.includes(cwe))) {
          cat = key;
          break;
        }
      }

      // Find a github commit fix URL
      let fixUrl = null;
      let repoName = null;
      for (const ref of data.references) {
        if (ref.url && ref.url.includes('/commit/')) {
          const match = ref.url.match(/github\.com\/([^\/]+\/[^\/]+)\/commit\/([a-f0-9]+)/);
          if (match) {
            repoName = match[1].toLowerCase();
            fixUrl = ref.url;
            break;
          }
        }
      }

      if (!fixUrl || !repoName) continue;
      
      if (selectedCases.filter(c => c.repo === repoName).length >= 5) continue; // Allow up to 5 per repo now for volume

      // Fetch diff
      let diffText = "";
      try {
        diffText = await fetchUrl(`${fixUrl}.patch`);
      } catch (e) { continue; }

      if (!diffText || diffText.length < 50 || diffText.length > 50000) continue; 
      if (diffText.includes("Not Found")) continue;

      const fileMatches = diffText.match(/^diff --git/gm);
      const numFiles = fileMatches ? fileMatches.length : 0;
      if (numFiles === 0) continue;

      const caseId = `case-${String(selectedCases.length + 1).padStart(3, '0')}`;
      selectedCases.push({
        id: caseId,
        cve: cve,
        repo: repoName,
        url: fixUrl,
        diff: diffText,
        category: cat,
        cwes: cwes
      });
      
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      console.log(`[+] Added ${caseId} (${cat}): ${repoName} ${cve}`);

      // Pick a control
      if (selectedControls.length < 15) { // Try to get more controls
        const parentMatch = diffText.match(/^From ([a-f0-9]+) /);
        if (parentMatch) {
          const parentSha = parentMatch[1];
          try {
            const controlDiff = await fetchUrl(`https://github.com/${repoName}/commit/${parentSha}.patch`);
            if (controlDiff && controlDiff.length > 50 && controlDiff.length < 10000 && !controlDiff.includes("Not Found")) {
              const controlId = `control-${String(selectedControls.length + 1).padStart(3, '0')}`;
              selectedControls.push({
                id: controlId,
                repo: repoName,
                url: `https://github.com/${repoName}/commit/${parentSha}`,
                diff: controlDiff,
                category: 'control',
                cwes: []
              });
              console.log(`[C] Added control ${controlId} for ${repoName}`);
            }
          } catch(e) {}
        }
      }
    }
  }

  const allCases = [...selectedCases, ...selectedControls];

  for (const c of allCases) {
    const caseDir = path.join(OUTPUT_DIR, c.id);
    fs.mkdirSync(caseDir, { recursive: true });
    fs.writeFileSync(path.join(caseDir, 'diff.patch'), c.diff);
    fs.writeFileSync(path.join(caseDir, 'label.json'), JSON.stringify({
      cve: c.cve || c.id,
      category: c.category,
      source_url: c.url,
      repo: c.repo,
      cwes: c.cwes
    }, null, 2));
  }

  const md = `
# Tier A: Expanded Real-World Corpus Selection Methodology

This corpus was constructed adhering to strict mechanical selection rules to prevent bias and increase diversity beyond the initial test sets.

## Rules Applied
1. **Source**: Fetched directly from the public OSV Vulnerability Database using the API.
2. **Timeline**: Only vulnerabilities published from 2021 onwards.
3. **Diversity**: Includes repositories across JS/TS, Python, Ruby, PHP, Go, Java, and Rust.
4. **Validation**: Ignored any "BIT-..." formatted IDs.
5. **Controls**: Fetched the parent commits of the vulnerability fixes to serve as clean, unrelated "control" commits.

## Summary of Corpus
Total Vulnerability Cases: ${selectedCases.length}
Total Control Cases: ${selectedControls.length}

Categories:
${Object.entries(categoryCounts).map(([k, v]) => `- ${k}: ${v}`).join('\n')}
`;

  fs.writeFileSync(METHODOLOGY_FILE, md);
  console.log("Tier A build complete!");
}

build().catch(console.error);
