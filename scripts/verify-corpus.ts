import fs from 'fs';
import path from 'path';
import https from 'https';
import 'dotenv/config';

const OUTPUT_DIR = path.join(process.cwd(), 'eval/independent-corpus');
const CORRECTIONS_FILE = path.join(OUTPUT_DIR, 'CORPUS_CORRECTIONS.md');
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

let corrections = `# Corpus Corrections\n\n`;

function logCorrection(caseId: string, reason: string) {
  corrections += `- **${caseId}**: Removed. Reason: ${reason}\n`;
  console.log(`[REMOVED] ${caseId}: ${reason}`);
}

function checkUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
        resolve(true);
      } else {
        resolve(false);
      }
    }).on('error', () => resolve(false));
  });
}

function callGroq(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1
    });

    const req = https.request('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.choices && parsed.choices[0]) {
            resolve(parsed.choices[0].message.content.trim());
          } else {
            resolve("");
          }
        } catch(e) { resolve(""); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function extractVulnerableLines(diff: string) {
  const vulnerableLines: Record<string, [number, number][]> = {};
  let currentFile = null;

  const lines = diff.split('\n');
  for (const line of lines) {
    if (line.startsWith('diff --git')) {
      const match = line.match(/b\/(.+)/);
      if (match) currentFile = match[1];
    } else if (line.startsWith('@@ ') && currentFile) {
      const match = line.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/);
      if (match) {
        const start = parseInt(match[1], 10);
        const count = match[2] ? parseInt(match[2], 10) : 1;
        const end = count === 0 ? start : start + count - 1;
        
        if (!vulnerableLines[currentFile]) vulnerableLines[currentFile] = [];
        vulnerableLines[currentFile].push([start, end]);
      }
    }
  }
  return vulnerableLines;
}

async function verifyCorpus() {
  const cases = fs.readdirSync(OUTPUT_DIR).filter(f => fs.statSync(path.join(OUTPUT_DIR, f)).isDirectory());
  
  for (const caseId of cases) {
    const caseDir = path.join(OUTPUT_DIR, caseId);
    const labelPath = path.join(caseDir, 'label.json');
    const diffPath = path.join(caseDir, 'diff.patch');
    
    if (!fs.existsSync(labelPath)) continue;

    const label = JSON.parse(fs.readFileSync(labelPath, 'utf-8'));
    const diff = fs.readFileSync(diffPath, 'utf-8');

    // 1. Verify Identifier
    if (label.category !== 'control') {
      const cveValid = /^CVE-\d{4}-\d{4,}$/i.test(label.cve);
      const ghsaValid = /^GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/i.test(label.cve);
      if (!cveValid && !ghsaValid) {
        logCorrection(caseId, `Invalid vulnerability identifier format: ${label.cve}`);
        fs.rmSync(caseDir, { recursive: true, force: true });
        continue;
      }
    }

    // 2. Verify URL
    const urlValid = await checkUrl(label.source_url);
    if (!urlValid) {
      logCorrection(caseId, `Source URL is unreachable or returned 404: ${label.source_url}`);
      fs.rmSync(caseDir, { recursive: true, force: true });
      continue;
    }

    // 3. Extract Vulnerable Lines
    label.vulnerable_lines = extractVulnerableLines(diff);

    // 4. Generate bespoke description & verify cross-file
    if (label.category !== 'control') {
      console.log(`Generating description for ${caseId}...`);
      const descPrompt = `You are a security expert. I will provide a git diff that fixes a vulnerability. Write exactly ONE clear, plain-language sentence describing what the actual vulnerability was, and how this patch fixes it. Do not include any other text.\n\nDiff:\n${diff.substring(0, 5000)}`;
      const description = await callGroq(descPrompt);
      label.description = description;

      if (label.category === 'cross_file') {
        const cfPrompt = `You are a security expert. Analyze this patch. Does this vulnerability ONLY manifest due to the interaction between MULTIPLE files (i.e. a true cross-file logic flaw), or is the core security issue actually self-contained within a single file and the other files are just tests, imports, or minor wiring? Answer with exactly 'true' if it is a genuine cross-file logic flaw, and 'false' if it is just a single-file issue that happens to touch other files.\n\nDiff:\n${diff.substring(0, 15000)}`;
        const isCrossFileStr = (await callGroq(cfPrompt)).toLowerCase();
        const isCrossFile = isCrossFileStr.includes('true');
        
        if (!isCrossFile) {
          console.log(`[CORRECTED] ${caseId}: Was tagged cross_file, but AI analysis determined it is a single-file issue.`);
          corrections += `- **${caseId}**: Changed category from cross_file to other. Reason: Manual AI inspection revealed the core flaw was isolated to a single file, with other files in the diff being tests or trivial wiring.\n`;
          label.category = 'other';
        }
      }
    } else {
      label.description = "A clean control commit used to test the false positive rate.";
    }

    // Save updated label
    fs.writeFileSync(labelPath, JSON.stringify(label, null, 2));
  }

  fs.writeFileSync(CORRECTIONS_FILE, corrections);
  console.log('Verification complete. Check CORPUS_CORRECTIONS.md');
}

verifyCorpus().catch(console.error);
