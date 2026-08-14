# Independent Revalidation Report v2 (2026-06-25)

## 1. Corpus Corrections
Prior to running this evaluation, the corpus was strictly verified:
- **Removed 7 cases** (case-007, 008, 009, 010, 015, 016, 025) due to invalid `BIT-...` identifier formats.
- **Corrected 3 cases** (case-001, 002, 003) from `cross_file` to `other` after manual inspection confirmed they were single-file logic flaws touching test files.
*(See [CORPUS_CORRECTIONS.md](../eval/independent-corpus/CORPUS_CORRECTIONS.md) for full details).*

## 2. Methodology & Matching Rules
A finding is only counted as a True Positive if it satisfies both:
1. **Line Overlap**: The flagged file and line number must fall within +/- 5 lines of the diff hunks of the fix.
2. **Category Plausibility**: The finding must be tagged as `security` or `bug`. Tags like `performance` on a vulnerability do not count.
Blank or empty responses from the AI are explicitly recorded as "no finding returned".

## 3. Performance Math & Metrics
**Raw Counts:**
- Vulnerability Cases: 18
- True Positives (TP): 9
- False Negatives (FN): 9
- Unmatched False Positives in Vulnerable Cases (FP): 3

**Arithmetic:**
- **Precision**: 9 / (9 + 4) = 69.2%
- **Recall**: 9 / (9 + 9) = 50.0%
- **F1 Score**: 2 * (0.692 * 0.500) / (0.692 + 0.500) = 58.1%

## 4. Control False-Positive Rate
- **Control Cases**: 6
- **Cases with False Positives**: 1
- **Control FP Rate**: 1 / 6 = 16.7%

## 5. Cross-File Subset
- **Total Cross-File Logic Flaws**: 0
*(Note: 0 genuine cross-file cases remained after strict verification removed the falsely-tagged ones).*
- **Cross-File Recall**: N/A

## 6. Case-by-Case Details
A full human-readable breakdown of every case, including the exact quoted AI explanation and human verification, is available in:
[RESULTS_DETAIL.md](../eval/independent-corpus/RESULTS_DETAIL.md)

## 7. Verdict
With a verified sample size of 18 vulnerabilities and 6 controls, CodeGuard achieved **50.0% recall** and **69.2% precision**. This is a small sample and should be treated as directional, not definitive. However, it conclusively disproves the original internal evaluation's claim of 100% recall. By enforcing strict line-range matching and capturing verbatim evidence, this revalidation confirms that while CodeGuard correctly identifies many issues (like the React SSR and Django flaws), it misses several edge cases entirely or flags unrelated performance issues instead of the core security vulnerability. The prior report's confidence was unearned due to flawed data capture; these current metrics represent a rigorously audited baseline.
