# Benchmark Improvement Analysis - 2026-07-06

## Executive Summary
This document summarizes the results of our targeted prompt engineering effort to improve CodeGuard's precision. We modified the `BASE_SYSTEM_PROMPT` in `server/openai.ts` to heavily prioritize identifying the **PRIMARY functional or security defect**, deliberately de-prioritizing general code quality, style, and test coverage comments. 

While the change successfully achieved its primary goal—dramatically increasing the precision of the comments we do generate—it resulted in a strict tradeoff that lowered our overall recall and F1 score. Furthermore, the evaluation run was affected by network failures in the AI Provider layer towards the end of the run.

## Results & Metric Changes

**Methodology Note**: The benchmark run (48 cases) completed, but cases 041 through 048 experienced hard network connection errors (`Connection error` and `Request timed out`) across all fallback AI providers (Gemini -> Groq/NIM -> OpenAI). Because of this, those 8 cases returned `no_finding` for 26 golden comments.

### Official Output (Including Network Failures)
- **Precision**: 65.8% (25 Matches / 38 CodeGuard Comments)
- **Recall**: 19.2% (25 Matches / 130 Golden Comments)
- **F1 Score**: 29.8% (Down from baseline 40.9%)

### Adjusted Output (Excluding Network Failures)
If we exclude the 26 golden comments from the 8 failed cases to see the true impact of the prompt change:
- **Valid Golden Comments**: 104
- **Precision**: 65.8% 
- **Adjusted Recall**: 24.0% (25 / 104)
- **Adjusted F1 Score**: 35.2%

## Analysis of the Prompt Change

Our prompt modifications had a profound impact on model behavior:
1. **Hyper-Focus on Precision**: The precision jumped to an impressive 65.8%. When CodeGuard speaks, it is highly likely to be pointing out a critical, real bug (e.g., race conditions, logical flaws) rather than a nitpick.
2. **Plummeting Recall**: CodeGuard generated only 38 comments across 40 successful cases (less than 1 comment per PR on average). By instructing it to find "the one specific issue", we successfully stopped the spam, but we also caused the model to hesitate and miss many valid secondary bugs that the Golden Comments expected us to catch.
3. **The "No Match" Shift**: Previously, we received many `no_match` judgments because CodeGuard outputted style/quality comments instead of finding the bug. Now, many `no_match` judgments are due to CodeGuard successfully finding a *different* critical bug than the one the Entelligence judges flagged as the "Golden" bug. (For instance, in `case-006`, CodeGuard found an orphaned database record bug, while the golden comment flagged a missing `await` loop).

## Network Failure Note
The AI provider abstraction in `server/ai/provider.ts` experienced a cascading failure at the very end of the run:
- Gemini failed with `fetch failed`.
- Groq/NIM fallback failed with `Connection error`.
- OpenAI fallback failed with `Connection error` or `Request timed out`.
This suggests a potential network issue on the host machine or a widespread API outage at the time of execution.

## Recommendations & Next Steps
1. **Calibrate the Tradeoff**: We over-corrected. While precision is great, a 24% adjusted recall means we are letting too many bugs slip through. We should soften the prompt from finding *only* the "PRIMARY" defect to allowing *multiple* high-severity functional/security defects.
2. **Address Provider Resiliency**: Investigate the root cause of the cascading connection errors in the AI Provider logic to ensure production reliability.
3. **Golden Comment Ambiguity**: We may want to manually review cases where CodeGuard found a severe bug that didn't match the Golden Comment to see if the benchmark itself is penalizing us unfairly for finding *better* bugs.
