// verify_corpus.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const corpusDir = path.join(__dirname, 'independent-corpus');
const correctionsPath = path.join(corpusDir, 'CORPUS_CORRECTIONS.md');

function logCorrection(msg: string) {
  fs.appendFileSync(correctionsPath, `- ${msg}\n`);
}

function isValidCve(id: string): boolean {
  const cvePattern = /^CVE-\d{4}-\d{4,7}$/i;
  const ghsaPattern = /^GHSA-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;
  return cvePattern.test(id) || ghsaPattern.test(id);
}

async function verifyCase(caseId: string) {
  const caseDir = path.join(corpusDir, caseId);
  const labelPath = path.join(caseDir, 'label.json');
  if (!fs.existsSync(labelPath)) {
    logCorrection(`${caseId}: missing label.json`);
    return;
  }
  const label = JSON.parse(fs.readFileSync(labelPath, 'utf-8'));
  const cve = label.cve as string;
  const sourceUrl = label.source_url as string;
  let valid = true;
  if (!isValidCve(cve)) {
    logCorrection(`${caseId}: invalid CVE/ID "${cve}"`);
    valid = false;
  }
  if (sourceUrl) {
    try {
      const resp = await fetch(sourceUrl, { method: 'HEAD' });
      if (!resp.ok) {
        logCorrection(`${caseId}: source URL returned ${resp.status}`);
        valid = false;
      }
    } catch (e) {
      logCorrection(`${caseId}: error fetching source URL – ${(e as Error).message}`);
      valid = false;
    }
  } else {
    logCorrection(`${caseId}: missing source_url`);
    valid = false;
  }
  // Additional checks for cross‑file logic can be added later.
}

async function main() {
  // Reset corrections file
  fs.writeFileSync(correctionsPath, '# Corpus Corrections\n\n');
  const entries = fs.readdirSync(corpusDir).filter(f => {
    const full = path.join(corpusDir, f);
    return fs.statSync(full).isDirectory();
  });
  for (const entry of entries) {
    await verifyCase(entry);
  }
  console.log('Verification completed. See CORPUS_CORRECTIONS.md');
}

main().catch(err => console.error(err));
