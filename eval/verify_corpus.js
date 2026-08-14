// verify_corpus.js (project version)
const fs = require('fs');
const path = require('path');
// Node v22 provides global fetch

const corpusDir = path.join(__dirname, 'independent-corpus');
const correctionsPath = path.join(corpusDir, 'CORPUS_CORRECTIONS.md');

function logCorrection(msg) {
  fs.appendFileSync(correctionsPath, `- ${msg}\n`);
}

function isValidId(id) {
  const cvePattern = /^CVE-\d{4}-\d{4,7}$/i;
  const ghsaPattern = /^GHSA-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/i;
  return cvePattern.test(id) || ghsaPattern.test(id);
}

async function verifyCase(caseId) {
  const caseDir = path.join(corpusDir, caseId);
  const labelPath = path.join(caseDir, 'label.json');
  if (!fs.existsSync(labelPath)) {
    logCorrection(`${caseId}: missing label.json`);
    return;
  }
  const label = JSON.parse(fs.readFileSync(labelPath, 'utf-8'));
  const id = label.cve;
  const sourceUrl = label.source_url;
  let ok = true;
  if (!isValidId(id)) {
    logCorrection(`${caseId}: invalid CVE/ID "${id}"`);
    ok = false;
  }
  if (sourceUrl) {
    try {
      const resp = await fetch(sourceUrl, { method: 'HEAD' });
      if (!resp.ok) {
        logCorrection(`${caseId}: source URL returned ${resp.status}`);
        ok = false;
      }
    } catch (e) {
      logCorrection(`${caseId}: error fetching source URL – ${e.message}`);
      ok = false;
    }
  } else {
    logCorrection(`${caseId}: missing source_url`);
    ok = false;
  }
}

async function main() {
  fs.writeFileSync(correctionsPath, '# Corpus Corrections\n\n');
  const entries = fs.readdirSync(corpusDir).filter(f => fs.statSync(path.join(corpusDir, f)).isDirectory());
  for (const entry of entries) {
    await verifyCase(entry);
  }
  console.log('Verification completed. See CORPUS_CORRECTIONS.md');
}

main().catch(err => console.error(err));
