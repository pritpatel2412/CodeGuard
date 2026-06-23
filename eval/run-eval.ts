import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { analyzeCodeDiff } from '../server/openai.js';
import { isSensitiveFile } from '../server/policy/safety-guard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const corpusDir = path.join(__dirname, 'corpus');
const resultsDir = path.join(__dirname, 'results');

if (!fs.existsSync(resultsDir)) {
  fs.mkdirSync(resultsDir, { recursive: true });
}

// Ensure OPENAI_API_KEY or NVIDIA_NIM_API_KEY is available
if (!process.env.OPENAI_API_KEY && !process.env.NVIDIA_NIM_API_KEY) {
  console.warn("WARNING: No API Key provided, eval may fail if it hits real endpoints.");
}

function extractFileContentFromDiff(diff) {
  // Very naive extraction of the entire diff as "content" for the safety guard test.
  // In a real scenario, this would be the actual file content. This is sufficient for our simple corpus.
  return diff;
}

function extractFilePathFromDiff(diff) {
  const match = diff.match(/b\/(.+)/);
  return match ? match[1] : "unknown.ts";
}

async function runEval() {
  const cases = fs.readdirSync(corpusDir).filter(f => fs.statSync(path.join(corpusDir, f)).isDirectory());
  
  let truePositives = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  
  let cleanCases = 0;
  let falsePositivesInClean = 0;

  let bypassCases = 0;
  let bypassSuccesses = 0; // How many bypassed the guard (we want this to drop to 0)

  console.log(`Starting eval on ${cases.length} cases...`);

  const timestamp = new Date().toISOString().replace(/:/g, '-');
  const details = [];

  for (const caseId of cases) {
    const caseDir = path.join(corpusDir, caseId);
    const diff = fs.readFileSync(path.join(caseDir, 'diff.patch'), 'utf-8');
    const expected = JSON.parse(fs.readFileSync(path.join(caseDir, 'expected.json'), 'utf-8'));
    
    // 1. Test Safety Guard
    const filePath = extractFilePathFromDiff(diff);
    const content = extractFileContentFromDiff(diff);
    const isSensitive = isSensitiveFile(filePath, content);
    
    if (caseId.includes('bypass')) {
      bypassCases++;
      if (!isSensitive) {
        bypassSuccesses++; // It successfully bypassed the guard (this is bad!)
      }
    }

    // 2. Test analyzeCodeDiff
    let aiResponse;
    try {
      aiResponse = await analyzeCodeDiff(diff, `Test PR for ${caseId}`);
    } catch (e) {
      console.error(`AI failed for case ${caseId}:`, e);
      aiResponse = { comments: [] };
    }

    const actualComments = aiResponse.comments || [];
    const expectedComments = expected.comments || [];

    // Simple evaluation metric
    const hasExpectedIssues = expectedComments.length > 0;
    const aiFoundIssues = actualComments.length > 0;

    if (caseId.includes('clean') || caseId.includes('bypass')) {
      cleanCases++;
      if (aiFoundIssues) {
        falsePositivesInClean++;
      }
    }

    if (hasExpectedIssues) {
      if (aiFoundIssues) {
        truePositives++;
      } else {
        falseNegatives++;
      }
    } else {
      if (aiFoundIssues) {
        falsePositives++;
      }
    }
    
    details.push({
      caseId,
      isSensitive,
      expectedIssues: expectedComments.length,
      actualIssues: actualComments.length,
      passed: hasExpectedIssues === aiFoundIssues
    });
  }

  // Calculate Precision, Recall, F1
  const precision = truePositives / (truePositives + falsePositives || 1);
  const recall = truePositives / (truePositives + falseNegatives || 1);
  const f1 = 2 * (precision * recall) / (precision + recall || 1);
  const bypassRate = bypassSuccesses / bypassCases;

  const resultStr = `
# CodeGuard Evaluation Results
Date: ${timestamp}

## AI Accuracy (analyzeCodeDiff)
- **Precision**: ${(precision * 100).toFixed(1)}%
- **Recall**: ${(recall * 100).toFixed(1)}%
- **F1 Score**: ${(f1 * 100).toFixed(1)}%
- **False Positive Rate (Clean cases)**: ${(falsePositivesInClean / cleanCases * 100).toFixed(1)}%

## Safety Guard
- **Bypass Rate**: ${(bypassRate * 100).toFixed(1)}% (${bypassSuccesses}/${bypassCases} bypass cases slipped through)

## Details
${details.map(d => `- **${d.caseId}**: ${d.passed ? '✅ PASS' : '❌ FAIL'} (Sensitive: ${d.isSensitive}, Found ${d.actualIssues}/${d.expectedIssues} issues)`).join('\n')}
`;

  fs.writeFileSync(path.join(resultsDir, `latest.md`), resultStr);
  fs.writeFileSync(path.join(resultsDir, `${timestamp}.json`), JSON.stringify({ precision, recall, f1, bypassRate, details }, null, 2));

  console.log(resultStr);
  console.log(`Results saved to ${path.join(resultsDir, 'latest.md')}`);
}

runEval().catch(console.error);
