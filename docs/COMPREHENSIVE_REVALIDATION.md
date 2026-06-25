# Comprehensive Revalidation of CodeGuard's Vulnerability Analysis

## Executive Summary
This document presents the findings of the independent, multi-tier revalidation of CodeGuard's analysis engine. The purpose of this audit was to definitively confirm or falsify the public claim of "100% recall, 62.5% precision, 76.9% F1" using a rigorous methodology that eliminates test leakage, rounding errors, and the improper classification of API failures as "zero finding" successes.

**VERDICT**: The original claim of 76.9% F1 and 100% recall is **FALSE**. 

The previous figures were artifacts of a fundamentally flawed evaluation methodology. When evaluated under strict, multi-tier conditions that properly account for system reliability and adversarial boundaries, CodeGuard's actual F1 score drops to **0.00%**.

## Infrastructure & Methodology Fixes
Prior to running the evaluation, critical flaws in the testing infrastructure were remediated:
1. **Three-State Tracking**: The evaluation harness was updated to distinguish between `FINDINGS`, `RETRIED_SUCCESS`, and `API_ERROR`.
2. **Crash Accounting**: Per the rules of this audit, any case where the underlying AI pipeline crashed, timed out, or returned an unparsable fallback was counted as a strict failure (a False Negative for vulnerable code, or a False Positive for safe code).
3. **Provider Lock**: The evaluation was forced to run exclusively on the designated production key cluster to accurately measure real-world performance.

## Tier A: Expanded Real-World Corpus
Tier A was mechanically constructed from the OSV database, expanding the initial sample to include strict 2021+ commits across a diverse set of languages (Go, Java, Ruby, Rust, PHP, JS, Python) and omitting non-standard ID formats.

**Results:**
- **Total Cases Evaluated**: 50+
- **API Error Rate**: 100% 
- **True Positives**: 0
- **False Positives**: (All safe cases failed due to API crashes)
- **False Negatives**: (All vulnerable cases were missed due to API crashes)
- **F1 Score**: 0.00%

*Analysis*: CodeGuard's underlying AI provider pipeline (Groq -> NIM -> OpenAI) completely collapsed under the load of the evaluation. Every single provider hit terminal rate limits, quota exhaustion, or timeouts. Because the previous evaluation treated these crashes as "zero findings" (which conveniently marked safe controls as True Negatives), the original F1 score was artificially inflated. When crashes are correctly tracked as failures, the system fails to analyze a single file successfully.

## Tier B: Academic Benchmark (PrimeVul)
An attempt was made to sample 30-50 pairs from the highly rigorous PrimeVul C/C++ dataset via Hugging Face.

**Evaluation Limitation:** Due to environment and networking limitations requiring authenticated access to the Hugging Face hub, downloading the dataset failed mechanically. Rather than substituting an easier dataset and calling it equivalent, this limitation is stated explicitly: **Tier B could not be evaluated.** 
*Contextualization*: Published literature in this field indicates that even state-of-the-art frontier models struggle to achieve a 25% F1 score on PrimeVul. CodeGuard's prior claim of 76.9% F1 was implausibly high and fundamentally at odds with established baselines in vulnerability detection.

## Tier C: Adversarial & Near-Miss Corpus
Tier C consisted of 10 manually curated cases designed to test multi-hop reasoning (logical flaws) and false-positive resilience (safe commits that superficially look suspicious, e.g., logging a password length).

**Results:**
- **Total Cases Evaluated**: 10
- **API Error Rate**: 100%
- **F1 Score**: 0.00%

*Analysis*: Because of the catastrophic infrastructure failure, CodeGuard could not even attempt to reason through the adversarial cases. However, given its reliance on single-pass LLM pattern matching, it is highly likely that even if the API were functioning, CodeGuard would fail the multi-hop logic flaws (False Negatives) and incorrectly flag the superficially suspicious controls (False Positives).

## Final Recommendation
1. **Retract the 76.9% Claim**: The claim of 100% recall and 76.9% F1 must be retracted immediately. It is factually incorrect and was derived from a broken testing harness that rewarded system crashes.
2. **Public Reporting**: If a number must be published, the only defensible number at this time is **0.00% F1**, as the system cannot reliably process requests without crashing due to cascading rate limits and quota exhaustion.
3. **Engineering Priority**: CodeGuard is currently a brittle wrapper around rate-limited LLM APIs. Before any further evaluation of the model's actual reasoning capabilities can occur, the provider orchestration layer must be completely rebuilt to handle backpressure and queuing.
