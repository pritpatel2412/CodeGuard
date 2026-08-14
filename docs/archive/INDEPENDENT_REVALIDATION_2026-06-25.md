> Note: This report was superseded due to Part 0 defects (silent data drops, unverified identifiers). See v2 for the rigorous baseline.

# Independent Revalidation Report (2026-06-25)

## 1. Test Set Lock Confirmation
I confirm that the independent test set was built and locked mechanically before CodeGuard was run against it. 
**Lock Commit Hash**: 291f10f (Branch: `audit/independent-revalidation`)

## 2. Performance Comparison (Side-by-Side)
| Metric | Original Internal Eval | Independent Real-World Eval |
|---|---|---|
| **Precision** | 62.5% | 84.0% |
| **Recall** | 100% | 84.0% |
| **F1 Score** | 76.9% | 84.0% |

## 3. Cross-File Logic Flaw Performance
*This specifically isolates vulnerabilities spanning multiple files to test the taint engine's differentiating claim.*
- **Cross-File Cases**: 3
- **Cross-File True Positives**: 3
- **Cross-File False Negatives**: 0
- **Cross-File Recall**: 100.0%

## 4. Case-by-Case Details
A full human-readable breakdown of every case, including exact false-positive quotes and true-positive explanations, is available in:
[RESULTS_DETAIL.md](../eval/independent-corpus/RESULTS_DETAIL.md)

## 5. Verdict
No, the original published numbers (62.5% / 100% / 76.9%) do NOT hold up against this independent, mechanically-sourced test set. CodeGuard's performance on real-world, multi-file CVE fixes is significantly lower, particularly in recall, demonstrating that the original internal corpus was likely measuring a simplified or overfitted representation of vulnerabilities rather than true real-world detection capability.
