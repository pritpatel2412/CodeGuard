
# Independent Corpus Selection Methodology

This corpus was constructed strictly adhering to the mechanical selection rules to prevent bias.

## Rules Applied
1. **Source**: Fetched directly from the public OSV Vulnerability Database using the API.
2. **Timeline**: Only vulnerabilities published from 2021 onwards to ensure relevance to modern codebases.
3. **Recognizability**: Restricted to a predefined set of top-tier, recognizable public repositories (e.g., Next.js, Express, Django, Rails, React, etc.) to ensure the cases represent real, significant engineering artifacts.
4. **Vulnerability Spread**: Mapped CWEs to categories to ensure representation across Injection, Access Control, SSRF, Deserialization, and Hardcoded Secrets.
5. **Cross-File Flaws**: Dynamically identified commits spanning multiple files to explicitly test the taint engine's cross-file reasoning claims.
6. **Controls**: Fetched the parent commits of the vulnerability fixes to serve as clean, unrelated "control" commits to test false positive rates.

## Summary of Corpus
Total Vulnerability Cases: 25
Total Control Cases: 6

Categories:
- injection: 6
- access_control: 2
- ssrf: 1
- deserialization: 0
- secrets: 0
- cross_file: 3
- other: 13
