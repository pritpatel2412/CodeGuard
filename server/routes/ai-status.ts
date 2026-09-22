import { Router, Request, Response, NextFunction } from "express";
import { providerStats, pingNIM, pingGroq } from "../ai/provider.js";

const router = Router();

/**
 * Middleware to require authentication
 */
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Not authenticated" });
}

/**
 * GET /api/ai/status
 * Returns the current state of AI providers.
 * Used by the dashboard's Provider Health widget.
 */
router.get("/status", requireAuth, async (_req, res) => {
  const [nimPing, groqPing] = await Promise.all([pingNIM(), pingGroq()]);

  res.json({
    groq: {
      configured: !!(process.env.GROQ_API_KEY || process.env.GROQ_API_KEY_AUDIT || process.env.GROQ_API_KEY_FIX),
      reachable: groqPing.reachable,
      latencyMs: groqPing.latencyMs,
      pingError: groqPing.error ?? null,
      model: process.env.GROQ_MODEL ?? "openai/gpt-oss-120b",
      calls: providerStats.groqCalls,
      successes: providerStats.groqSuccesses,
      failures: providerStats.groqFailures,
      successRate: providerStats.groqCalls > 0
        ? Math.round((providerStats.groqSuccesses / providerStats.groqCalls) * 100)
        : 0,
    },
    nim: {
      configured: !!(process.env.NVIDIA_NIM_API_KEY?.startsWith("nvapi-")),
      reachable: nimPing.reachable,
      latencyMs: nimPing.latencyMs,
      pingError: nimPing.error ?? null,
      model: process.env.NVIDIA_NIM_MODEL_ANALYSIS ?? "meta/llama-3.3-70b-instruct",
      calls: providerStats.nimCalls,
      successes: providerStats.nimSuccesses,
      failures: providerStats.nimFailures,
      successRate: providerStats.nimCalls > 0
        ? Math.round((providerStats.nimSuccesses / providerStats.nimCalls) * 100)
        : 0,
    },
    openai: {
      configured: !!(process.env.OPENAI_API_KEY),
      model: process.env.OPENAI_FALLBACK_MODEL ?? "gpt-4o",
      calls: providerStats.openaiCalls,
      successes: providerStats.openaiSuccesses,
      failures: providerStats.openaiFailures,
    },
    activeProvider: providerStats.lastProvider,
    lastFailureReason: providerStats.lastFailureReason || null,
    forceFallback: process.env.FORCE_OPENAI_FALLBACK === "true",
  });
});

/**
 * POST /api/ai/test
 * Sends a quick test prompt through the full callAI stack.
 * Useful for verifying the integration works end-to-end.
 */
router.post("/test", requireAuth, async (_req, res) => {
  try {
    const { callAI } = await import("../ai/provider.js");
    const result = await callAI({
      task: "enrich",
      maxTokens: 50,
      temperature: 0,
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Reply with exactly: CodeGuard AI provider test successful." },
      ],
    });
    res.json({ success: true, provider: result.provider, model: result.model, response: result.content });
  } catch (err: unknown) {
    res.status(500).json({ success: false, error: (err as { message?: string }).message });
  }
});

export default router;
