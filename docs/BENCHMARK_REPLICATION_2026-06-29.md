# Benchmark Replication Results
Date: 2026-06-29T12:51:32.908Z

## Methodology
- **Benchmark Replicated**: Entelligence 2026 AI Code Review Benchmark
- **Dataset**: Methodology-equivalent (40-50 real production bugs from the same 5 repos)
- **Judge Model**: Gemini 2.5 Pro (via OpenAI compatibility layer)

## Raw Metrics
- Total Cases: 48
- Total Golden Comments: 130
- Total CodeGuard Comments Generated: 88

### Judgments
- Matches (True Positives): 7
- No Match (False Negatives - caught wrong issue): 50
- No Finding (False Negatives - no comments): 73

## Final Score
- **Precision**: 8.0%
- **Recall**: 5.4%
- **F1 Score**: 6.4%

## Comparison
| Tool | F1 Score | Source |
|:---|:---|:---|
| CodeGuard | **6.4%** | This replication (methodology-equivalent) |
| CodeRabbit | 33.0% | Entelligence 2026 Benchmark (published) |
| Copilot | 22.6% | Entelligence 2026 Benchmark (published) |

