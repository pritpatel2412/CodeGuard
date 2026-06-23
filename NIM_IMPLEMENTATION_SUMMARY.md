# NVIDIA NIM + OpenAI Fallback Implementation Summary

CodeGuard has been upgraded to a dual-provider AI system. This refactor ensures high availability, rate-limit resilience, and cost optimization by using NVIDIA NIM as the primary provider with a seamless OpenAI fallback.

## 🏗️ Core Architecture: `server/ai/provider.ts`
The new `callAI` function abstracts all AI interactions.
- **Primary:** NVIDIA NIM (`https://integrate.api.nvidia.com/v1`)
- **Fallback:** OpenAI GPT-4o
- **Circuit Breaker:** Automatically opens after 3 failures, cooling down for 60 seconds to prevent hitting rate limits during outages.
- **Rate Guard:** Implements a sliding window (40 req/min) with proactive buffering to avoid 429s.
- **Task Mapping:** 
  - `analysis`: `meta/llama-3.3-70b-instruct`
  - `fix`: `meta/llama-3.1-405b-instruct`
  - `enrich`: `meta/llama-3.3-70b-instruct`

## 📊 Observability: `AI Provider Health` Widget
A new dashboard widget provides real-time visibility into the AI stack:
- **NVIDIA NIM:** Reachability, Latency (ms), Success Rate, and active model.
- **OpenAI:** Call count, Successes, and Failures.
- **Status Endpoint:** `/api/ai/status` (authenticated).
- **Test Endpoint:** `/api/ai/test` allows manual verification of the full provider stack.

## 🚀 Migration Details
The following files have been systematically migrated from direct `openai` calls to the `callAI` abstraction:
1. **`server/openai.ts`**: Handles PR diff analysis and fix generation.
2. **`server/taint/ai-enricher.ts`**: Enriches security findings with explanations and attack vectors.
3. **`server/policy/policy-enforcer.ts`**: Validates code against custom security policies.

## 🔐 Environment Variables
To enable NVIDIA NIM, ensure the following are set:
- `NVIDIA_NIM_API_KEY`: Your `nvapi-` key.
- `NVIDIA_NIM_MODEL_ANALYSIS` (Optional): Override default analysis model.
- `NVIDIA_NIM_MODEL_FIX` (Optional): Override default fix model.
- `FORCE_OPENAI_FALLBACK` (Optional): Set to `true` to bypass NIM.

---
*No existing code was deleted during this migration. The system remains fully backward compatible with the legacy OpenAI setup if NIM is not configured.*
