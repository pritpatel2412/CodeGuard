# Replication Methodology: Entelligence 2026 Code Review Benchmark

## Benchmark Replicated
This evaluation replicates the **Entelligence 2026 AI Code Review Benchmark**.
- **Original Source**: [Entelligence 2026 Benchmark Report](https://www.entelligence.ai/blog/ai-code-review-benchmark-2026)
- **Primary Metric**: F1 Score (Precision and Recall)

## Methodology-Equivalent Replication
> **IMPORTANT DISCLOSURE**: This is a **methodology-equivalent replication**, NOT a literal reproduction of the original benchmark's exact dataset.

Because Entelligence's 67-bug "golden dataset" is not public, this evaluation sources its bugs from the open-source **Martian Code Review Benchmark** (which shares the exact same 5 repositories: Cal.com, Sentry, Discourse, Keycloak, Grafana) to mirror the exact spirit, scale, and diversity of the original Entelligence methodology. 

The evaluation uses real production bugs with confirmed fixes and pre-written "golden comments" detailing what a correct review should catch.

## Evaluation Process (LLM-as-Judge)
Following the Entelligence methodology, we do not rely on simple string-matching for evaluation. Instead, an LLM acts as a semantic judge.

For each case, the judge is provided with:
1. The **Golden Comments** (the ground truth issues)
2. **CodeGuard's Output** (the actual review comments generated)

The judge categorizes CodeGuard's performance into one of three states for each golden comment:
- `match`: CodeGuard successfully identified the core issue described in the golden comment.
- `no_match`: CodeGuard generated comments, but they missed the core issue.
- `no_finding`: CodeGuard generated zero comments for this file/PR.

## Metric Calculation
The scoring directly mirrors the F1 score calculation used to produce the original 47.2% / 33.0% / 22.6% industry benchmarks.

- **True Positives (TP)**: Golden comments marked as `match`
- **False Negatives (FN)**: Golden comments missed (`no_match` or `no_finding`)
- **Precision**: We calculate precision by tracking the total number of comments CodeGuard generated vs. how many were actually matches.
  `Precision = Total Matches / Total CodeGuard Comments`
- **Recall**: 
  `Recall = Total Matches / Total Golden Comments`
- **F1 Score**: 
  `F1 = 2 * (Precision * Recall) / (Precision + Recall)`
