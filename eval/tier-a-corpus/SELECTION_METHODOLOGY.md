
# Tier A: Expanded Real-World Corpus Selection Methodology

This corpus was constructed adhering to strict mechanical selection rules to prevent bias and increase diversity beyond the initial test sets.

## Rules Applied
1. **Source**: Fetched directly from the public OSV Vulnerability Database using the API.
2. **Timeline**: Only vulnerabilities published from 2021 onwards.
3. **Diversity**: Includes repositories across JS/TS, Python, Ruby, PHP, Go, Java, and Rust.
4. **Validation**: Ignored any "BIT-..." formatted IDs.
5. **Controls**: Fetched the parent commits of the vulnerability fixes to serve as clean, unrelated "control" commits.

## Summary of Corpus
Total Vulnerability Cases: 50
Total Control Cases: 15

Categories:
- injection: 11
- access_control: 4
- ssrf: 2
- deserialization: 2
- secrets: 0
- other: 31
