# Benchmark Replication Results
Date: 2026-07-03T14:51:43.578Z

## Methodology
- **Benchmark Replicated**: Entelligence 2026 AI Code Review Benchmark
- **Dataset**: Methodology-equivalent (40-50 real production bugs from the same 5 repos)
- **Judge Model**: Gemini 2.5 Pro (via OpenAI compatibility layer)

## Raw Metrics
- Total Cases: 48
- Total Golden Comments: 130
- Total CodeGuard Comments Generated: 105

### Judgments
- Matches (True Positives): 48
- No Match (False Negatives - caught wrong issue): 76
- No Finding (False Negatives - no comments): 6

## Final Score
- **Precision**: 45.7%
- **Recall**: 36.9%
- **F1 Score**: 40.9%

## Comparison
| Tool | F1 Score | Source |
|:---|:---|:---|
| CodeGuard | **40.9%** | This replication (methodology-equivalent) |
| CodeRabbit | 33.0% | Entelligence 2026 Benchmark (published) |
| Copilot | 22.6% | Entelligence 2026 Benchmark (published) |


## Detailed Case Breakdown
| Case | Total Golden Comments | Matches | No Match | No Finding |
|:---|:---:|:---:|:---:|:---:|
| 001: Async import of the appStore packages | 2 | 1 | 1 | 0 |
| 002: feat: 2fa backup codes | 4 | 1 | 3 | 0 |
| 003: fix: handle collective multiple host on destinationCalendar | 5 | 2 | 3 | 0 |
| 004: feat: convert InsightsBookingService to use Prisma.sql raw queries | 2 | 0 | 2 | 0 |
| 005: Comprehensive workflow reminder management for booking lifecycle events | 2 | 2 | 0 | 0 |
| 006: Advanced date override handling and timezone compatibility improvements | 2 | 2 | 0 | 0 |
| 007: OAuth credential sync and app integration enhancements | 5 | 2 | 3 | 0 |
| 008: SMS workflow reminder retry count tracking | 2 | 1 | 1 | 0 |
| 009: Add guest management functionality to existing bookings | 5 | 2 | 3 | 0 |
| 010: feat: add calendar cache status and actions (#22532) | 2 | 0 | 2 | 0 |
| 011: FEATURE: automatically downsize large images | 3 | 2 | 1 | 0 |
| 012: FEATURE: per-topic unsubscribe option in emails | 2 | 2 | 0 | 0 |
| 013: Add comprehensive email validation for blocked users | 2 | 1 | 1 | 0 |
| 014: Enhance embed URL handling and validation system | 6 | 4 | 2 | 0 |
| 015: Optimize header layout performance with flexbox mixins | 2 | 1 | 1 | 0 |
| 016: UX: show complete URL path if website domain is same as instance domain | 1 | 0 | 1 | 0 |
| 017: scale-color $lightness must use $secondary for dark themes | 3 | 2 | 1 | 0 |
| 018: FIX: proper handling of group memberships | 3 | 1 | 2 | 0 |
| 019: FEATURE: Localization fallbacks (server-side) | 2 | 1 | 1 | 0 |
| 020: FEATURE: Can edit category/host relationships for embedding | 4 | 2 | 2 | 0 |
| 021: Anonymous: Add configurable device limit | 5 | 2 | 3 | 0 |
| 022: AuthZService: improve authz caching | 2 | 0 | 2 | 0 |
| 023: Plugins: Chore: Renamed instrumentation middleware to metrics middleware | 2 | 0 | 0 | 2 |
| 024: Advanced Query Processing Architecture | 1 | 0 | 1 | 0 |
| 025: Notification Rule Processing Engine | 2 | 0 | 0 | 2 |
| 026: Dual Storage Architecture | 3 | 3 | 0 | 0 |
| 027: Database Performance Optimizations | 1 | 1 | 0 | 0 |
| 028: Frontend Asset Optimization | 2 | 1 | 1 | 0 |
| 029: Advanced SQL Analytics Framework | 2 | 1 | 1 | 0 |
| 030: Unified Storage Performance Optimizations | 2 | 1 | 1 | 0 |
| 031: Fixing Re-authentication with passkeys | 2 | 0 | 0 | 2 |
| 032: Add caching support for IdentityProviderStorageProvider.getForLogin operations | 2 | 1 | 1 | 0 |
| 033: Add AuthzClientCryptoProvider for authorization client cryptographic operations | 2 | 1 | 1 | 0 |
| 034: Add rolling-updates feature flag and compatibility framework | 1 | 0 | 1 | 0 |
| 035: Add Client resource type and scopes to authorization schema | 3 | 0 | 3 | 0 |
| 036: Add Groups resource type and scopes to authorization schema | 2 | 1 | 1 | 0 |
| 037: Add HTML sanitizer for translated message resources | 4 | 1 | 3 | 0 |
| 038: Implement access token context encoding framework | 4 | 2 | 2 | 0 |
| 039: Implement recovery key support for user storage providers | 2 | 0 | 2 | 0 |
| 040: Fix concurrent group access to prevent NullPointerException | 2 | 1 | 1 | 0 |
| 041: Optimize spans buffer insertion with eviction during insert | 3 | 0 | 3 | 0 |
| 042: feat(upsampling) - Support upsampled error count with performance optimizations | 3 | 0 | 3 | 0 |
| 043: GitHub OAuth Security Enhancement | 3 | 0 | 3 | 0 |
| 044: Span Buffer Multiprocess Enhancement with Health Monitoring | 5 | 1 | 4 | 0 |
| 045: feat(ecosystem): Implement cross-system issue synchronization | 4 | 0 | 4 | 0 |
| 046: ref(crons): Reorganize incident creation / issue occurrence logic | 2 | 1 | 1 | 0 |
| 047: feat(uptime): Add ability to use queues to manage parallelism | 3 | 1 | 2 | 0 |
| 048: feat(workflow_engine): Add in hook for producing occurrences from the stateful detector | 2 | 0 | 2 | 0 |
