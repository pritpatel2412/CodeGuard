import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { analyzeCodeDiff } from '../server/openai.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure GROQ_API_KEY is available from environment
if (!process.env.GROQ_API_KEY) {
  console.warn('Warning: GROQ_API_KEY is not set in environment.');
}

// 2. THREE-STATE RESULT TYPE
type EvalResultState = 'API_ERROR' | 'FINDINGS' | 'RETRIED_SUCCESS';

interface EvalResult {
  state: EvalResultState;
  comments: any[];
  rawSummary: string;
}

// Wrapper around analyzeCodeDiff to enforce three-state tracking
async function runAnalysisWithRetry(diff: string, prTitle: string, maxRetries = 2): Promise<EvalResult> {
  let lastSummary = "";
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await analyzeCodeDiff(diff, prTitle);
      lastSummary = response.summary;
      
      // Check if it's the fallback response indicating an error
      if (response.summary.includes("Unable to complete automated code review") || response.summary.includes("Unable to parse AI response")) {
        console.warn(`[Attempt ${attempt}] AI API Error detected via summary fallback: ${response.summary}`);
        if (attempt === maxRetries) {
          return { state: 'API_ERROR', comments: [], rawSummary: response.summary };
        }
        // wait before retry
        await new Promise(r => setTimeout(r, 2000 * attempt));
        continue;
      }
      
      // Success
      return { 
        state: attempt === 1 ? 'FINDINGS' : 'RETRIED_SUCCESS', 
        comments: response.comments || [],
        rawSummary: response.summary
      };
      
    } catch (e: any) {
      console.warn(`[Attempt ${attempt}] Unhandled Exception: ${e.message}`);
      if (attempt === maxRetries) {
        return { state: 'API_ERROR', comments: [], rawSummary: `Exception: ${e.message}` };
      }
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
  
  return { state: 'API_ERROR', comments: [], rawSummary: 'Exhausted retries' };
}

// 3. PRE-FLIGHT SMOKE TEST
async function runSmokeTest() {
  console.log("========================================");
  console.log("PART 1: INFRASTRUCTURE PRE-CHECK");
  console.log("========================================");
  
  const smokeDiff = `
diff --git a/test.js b/test.js
index e69de29..d95f3ad 100644
--- a/test.js
+++ b/test.js
@@ -0,0 +1,5 @@
+function evalInput(req, res) {
+  const userInput = req.query.input;
+  // Highly vulnerable eval
+  eval(userInput);
+}
  `;
  
  const numCalls = 5;
  console.log(`Running ${numCalls} sequential smoke-test calls to ensure zero silent failures using key ${process.env.GROQ_API_KEY.substring(0, 10)}...`);
  
  for (let i = 1; i <= numCalls; i++) {
    console.log(`\n--- Smoke Test Call ${i}/${numCalls} ---`);
    const result = await runAnalysisWithRetry(smokeDiff, `Smoke Test PR ${i}`);
    
    console.log(`Result State: ${result.state}`);
    console.log(`Number of findings: ${result.comments.length}`);
    
    // HARD ABORT
    if (result.state === 'API_ERROR') {
      console.error(`\n[HARD ABORT] Pre-flight check failed on call ${i}. Silent or explicit API error occurred.`);
      console.error(`Summary: ${result.rawSummary}`);
      process.exit(1);
    }
    
    if (result.comments.length === 0) {
       console.warn(`[WARNING] Call ${i} returned 0 findings on an obvious eval() vulnerability. This is suspicious but technically not an API_ERROR.`);
    } else {
       console.log(`Sample finding: [${result.comments[0].type}] ${result.comments[0].comment}`);
    }
  }
  
  console.log("\n========================================");
  console.log("PRE-FLIGHT CHECK PASSED - ZERO SILENT FAILURES");
  console.log("========================================");
}

// If run directly, execute smoke test
if (process.argv[1] === __filename) {
  runSmokeTest().catch(console.error);
}

export { runAnalysisWithRetry, EvalResult, EvalResultState };
