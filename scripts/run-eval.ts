import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { runAnalysisWithRetry } from './run-comprehensive-eval.js';

// Ensure GROQ_API_KEY is available from environment
if (!process.env.GROQ_API_KEY) {
  console.warn('Warning: GROQ_API_KEY is not set in environment.');
}

async function evaluateTier(tierDir: string) {
  console.log(`\n========================================`);
  console.log(`EVALUATING ${tierDir}`);
  console.log(`========================================`);

  if (!fs.existsSync(tierDir)) {
    console.error(`Directory not found: ${tierDir}`);
    return;
  }

  const cases = fs.readdirSync(tierDir).filter(f => f.startsWith('case-') || f.startsWith('control-'));
  
  let truePositives = 0;
  let falsePositives = 0;
  let trueNegatives = 0;
  let falseNegatives = 0;
  let apiErrors = 0;
  
  const falsePositiveDetails: any[] = [];
  const falseNegativeDetails: any[] = [];
  
  for (const c of cases) {
    const casePath = path.join(tierDir, c);
    const labelPath = path.join(casePath, 'label.json');
    const diffPath = path.join(casePath, 'diff.patch');
    
    if (!fs.existsSync(labelPath) || !fs.existsSync(diffPath)) continue;
    
    const label = JSON.parse(fs.readFileSync(labelPath, 'utf8'));
    const diff = fs.readFileSync(diffPath, 'utf8');
    
    const isVulnerable = label.category !== 'control'; // true for vuln, false for control/safe
    const repo = label.repo || "unknown";
    
    console.log(`\n[${c}] Analyzing... (Expect Vulnerable: ${isVulnerable}, Type: ${label.category})`);
    
    // Use the three-state runner
    const result = await runAnalysisWithRetry(diff, `PR for ${c} in ${repo}`);
    
    if (result.state === 'API_ERROR') {
      console.log(`[${c}] -> API_ERROR (${result.rawSummary})`);
      apiErrors++;
      // Treat API error as a failure to detect, meaning if it's vulnerable it's FN, if it's safe it's FP (or we just count it as an error).
      // The instructions say "Treat any case where the results-generation code would have produced a blank/undefined/null field as a BUILD FAILURE."
      // Let's count them strictly against the system.
      if (isVulnerable) falseNegatives++;
      else falsePositives++;
      continue;
    }
    
    // We only count "security" comments
    const secComments = result.comments.filter(comment => 
      comment.type === 'security' || comment.type === 'bug'
    );
    
    const flagged = secComments.length > 0;
    
    // For Tier C, adversarial safe cases might flag variables. 
    
    if (isVulnerable && flagged) {
      // For strict scoring, we'd check overlap and plausibility.
      // We will count it as True Positive if it flags anything for now, 
      // but if the categories don't match it's a weak TP.
      console.log(`[${c}] -> TRUE POSITIVE (${secComments.length} findings)`);
      truePositives++;
    } else if (isVulnerable && !flagged) {
      console.log(`[${c}] -> FALSE NEGATIVE (Missed vulnerability)`);
      falseNegatives++;
      falseNegativeDetails.push({ id: c, category: label.category, cwe: label.cwes });
    } else if (!isVulnerable && !flagged) {
      console.log(`[${c}] -> TRUE NEGATIVE (Correctly ignored safe code)`);
      trueNegatives++;
    } else if (!isVulnerable && flagged) {
      console.log(`[${c}] -> FALSE POSITIVE (Flagged safe code)`);
      falsePositives++;
      falsePositiveDetails.push({ id: c, finding: secComments[0].comment });
    }
  }
  
  const total = truePositives + trueNegatives + falsePositives + falseNegatives;
  const precision = truePositives + falsePositives > 0 ? truePositives / (truePositives + falsePositives) : 0;
  const recall = truePositives + falseNegatives > 0 ? truePositives / (truePositives + falseNegatives) : 0;
  const f1 = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;
  
  console.log(`\n=== RESULTS FOR ${tierDir} ===`);
  console.log(`Total Cases Evaluated: ${total} (API Errors: ${apiErrors})`);
  console.log(`True Positives: ${truePositives}`);
  console.log(`False Positives: ${falsePositives}`);
  console.log(`True Negatives: ${trueNegatives}`);
  console.log(`False Negatives: ${falseNegatives}`);
  console.log(`------------------------------`);
  console.log(`Precision: ${(precision * 100).toFixed(2)}%`);
  console.log(`Recall:    ${(recall * 100).toFixed(2)}%`);
  console.log(`F1 Score:  ${(f1 * 100).toFixed(2)}%`);
  console.log(`==============================`);
  
  if (falsePositives > 0 && tierDir.includes('tier-c')) {
    console.log(`\n[Tier C False Positive Analysis]`);
    for (const fp of falsePositiveDetails) {
      console.log(`- ${fp.id} flagged: ${fp.finding.substring(0, 80)}...`);
    }
  }
}

async function main() {
  await evaluateTier(path.join(process.cwd(), 'eval/tier-a-corpus'));
  await evaluateTier(path.join(process.cwd(), 'eval/tier-c-corpus'));
}

main().catch(console.error);
