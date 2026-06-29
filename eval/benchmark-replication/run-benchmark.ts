import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { analyzeCodeDiff } from '../../server/openai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const corpusDir = path.join(__dirname, '../independent-corpus');

async function smokeTest() {
  console.log("Running smoke test...");
  
  // Use case-001 from independent-corpus
  const caseDir = path.join(corpusDir, 'case-001');
  const diffPath = path.join(caseDir, 'diff.patch');
  
  if (!fs.existsSync(diffPath)) {
    console.error("Diff path not found:", diffPath);
    return;
  }
  
  const diff = fs.readFileSync(diffPath, 'utf-8');
  
  try {
    const aiResponse = await analyzeCodeDiff(diff, "Smoke Test PR");
    console.log("Success! AI Response:");
    console.log(JSON.stringify(aiResponse, null, 2));
    console.log(`\nRisk Level: ${aiResponse.risk_level}`);
    console.log(`Comments count: ${aiResponse.comments?.length || 0}`);
  } catch (e) {
    console.error("Smoke test failed:", e);
  }
}

smokeTest();
