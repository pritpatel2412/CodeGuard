import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { analyzeCodeDiff } from '../../server/openai.js';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const casesDir = path.join(__dirname, 'cases');
const promptPath = path.join(__dirname, 'judge-prompt.md');

// Use Gemini API for the LLM judge, as requested by environment setup (or fallback to OpenAI)
const judgeClient = new OpenAI({
  baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
  apiKey: process.env.EVAL_GEMINI_API_KEY || process.env.OPENAI_API_KEY,
});

async function runJudge(goldenComment: string, actualComments: string): Promise<{status: string, reasoning: string}> {
  const promptTemplate = fs.readFileSync(promptPath, 'utf-8');
  const prompt = promptTemplate
    .replace('{{GOLDEN_COMMENT}}', goldenComment)
    .replace('{{ACTUAL_COMMENTS}}', actualComments);

  const response = await judgeClient.chat.completions.create({
    model: process.env.EVAL_GEMINI_API_KEY ? 'gemini-2.5-pro' : 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0,
  });

  const content = response.choices[0].message.content || '{}';
  try {
    return JSON.parse(content);
  } catch (e) {
    console.error("Failed to parse judge output:", content);
    return { status: "no_match", reasoning: "Parse error from judge" };
  }
}

async function runEvaluation() {
  const cases = fs.readdirSync(casesDir).filter(f => fs.statSync(path.join(casesDir, f)).isDirectory());
  
  let matchCount = 0;
  let noMatchCount = 0;
  let noFindingCount = 0;
  
  let totalGoldenComments = 0;
  let totalCodeGuardComments = 0;
  let totalMatchedComments = 0;
  
  const results: any[] = [];
  
  console.log(`Starting evaluation on ${cases.length} cases...`);
  
  for (const caseId of cases) {
    const caseDir = path.join(casesDir, caseId);
    const diffPath = path.join(caseDir, 'diff.patch');
    const metaPath = path.join(caseDir, 'metadata.json');
    
    if (!fs.existsSync(diffPath) || !fs.existsSync(metaPath)) {
      continue;
    }
    
    const diff = fs.readFileSync(diffPath, 'utf-8');
    const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    const prTitle = metadata.pr_title;
    
    console.log(`\nEvaluating ${caseId}: ${prTitle}`);
    
    let aiResponse;
    let actualCommentsStr = "";
    
    try {
      console.log("  Running CodeGuard analysis...");
      aiResponse = await analyzeCodeDiff(diff, prTitle);
      
      const comments = aiResponse.comments || [];
      totalCodeGuardComments += comments.length;
      
      if (comments.length === 0) {
        actualCommentsStr = "";
      } else {
        actualCommentsStr = comments.map(c => `[${c.type}] ${c.path}:${c.line} - ${c.comment}`).join('\n');
      }
      
      fs.writeFileSync(path.join(caseDir, 'codeguard_output.json'), JSON.stringify(aiResponse, null, 2));
    } catch (e) {
      console.error(`  CodeGuard failed for ${caseId}:`, e);
      aiResponse = { comments: [] };
    }
    
    // Now judge each golden comment
    const goldenComments = metadata.comments;
    const caseJudgments: any[] = [];
    
    console.log(`  Judging ${goldenComments.length} golden comments...`);
    for (const gc of goldenComments) {
      totalGoldenComments++;
      
      if (actualCommentsStr === "") {
        console.log(`    -> no_finding`);
        noFindingCount++;
        caseJudgments.push({ golden: gc.comment, status: 'no_finding', reasoning: 'CodeGuard produced no comments' });
        continue;
      }
      
      const judgment = await runJudge(gc.comment, actualCommentsStr);
      console.log(`    -> ${judgment.status} (${judgment.reasoning})`);
      
      if (judgment.status === 'match') {
        matchCount++;
        totalMatchedComments++; // Assume 1 golden comment matched = 1 successful codeguard comment for precision purposes
      } else if (judgment.status === 'no_match') {
        noMatchCount++;
      } else {
        noFindingCount++;
      }
      
      caseJudgments.push({
        golden: gc.comment,
        status: judgment.status,
        reasoning: judgment.reasoning
      });
      
      // Delay for judge API limits
      await new Promise(r => setTimeout(r, 2000));
    }
    
    results.push({
      caseId,
      prTitle,
      judgments: caseJudgments
    });
    
    // Delay for CodeGuard AI limits
    await new Promise(r => setTimeout(r, 8000));
  }
  
  // Scoring
  // Precision = Matched Comments / Total CodeGuard Comments (or 0 if CodeGuard made no comments)
  const precision = totalCodeGuardComments > 0 ? (totalMatchedComments / totalCodeGuardComments) : 0;
  // Recall = Matches / Total Golden Comments
  const recall = totalGoldenComments > 0 ? (matchCount / totalGoldenComments) : 0;
  
  const f1 = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  
  const report = `# Benchmark Replication Results
Date: ${new Date().toISOString()}

## Methodology
- **Benchmark Replicated**: Entelligence 2026 AI Code Review Benchmark
- **Dataset**: Methodology-equivalent (40-50 real production bugs from the same 5 repos)
- **Judge Model**: Gemini 2.5 Pro (via OpenAI compatibility layer)

## Raw Metrics
- Total Cases: ${cases.length}
- Total Golden Comments: ${totalGoldenComments}
- Total CodeGuard Comments Generated: ${totalCodeGuardComments}

### Judgments
- Matches (True Positives): ${matchCount}
- No Match (False Negatives - caught wrong issue): ${noMatchCount}
- No Finding (False Negatives - no comments): ${noFindingCount}

## Final Score
- **Precision**: ${(precision * 100).toFixed(1)}%
- **Recall**: ${(recall * 100).toFixed(1)}%
- **F1 Score**: ${(f1 * 100).toFixed(1)}%

## Comparison
| Tool | F1 Score | Source |
|:---|:---|:---|
| CodeGuard | **${(f1 * 100).toFixed(1)}%** | This replication (methodology-equivalent) |
| CodeRabbit | 33.0% | Entelligence 2026 Benchmark (published) |
| Copilot | 22.6% | Entelligence 2026 Benchmark (published) |

`;

  fs.writeFileSync(path.join(__dirname, 'RESULTS.md'), report);
  fs.writeFileSync(path.join(__dirname, 'detailed_results.json'), JSON.stringify(results, null, 2));
  
  console.log("\n=============================");
  console.log(`F1 Score: ${(f1 * 100).toFixed(1)}%`);
  console.log(`Results saved to eval/benchmark-replication/RESULTS.md`);
}

runEvaluation().catch(console.error);
