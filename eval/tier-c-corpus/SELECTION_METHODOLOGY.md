
# Tier C: Adversarial & Near-Miss Corpus Selection Methodology

This corpus was manually curated specifically to stress-test CodeGuard against false positives and multi-hop reasoning failures.

## Rules Applied
1. **Source**: Synthetically generated adversarial examples.
2. **Suspicious-but-Safe (Controls)**: Includes commits that look like vulnerabilities (e.g. logging variables named `password`, using `eval` in a trusted script context) but are actually safe.
3. **Multi-Hop Vulnerabilities**: Includes logical vulnerabilities where the failure requires understanding control flow across lines (e.g. authorization check happening *after* the action).
4. **Volume**: 10 cases (mix of true positives and adversarial true negatives).
