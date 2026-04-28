import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ChatCompletionCreateParamsNonStreaming,
} from "openai/resources/chat/completions";

// ── Client instances ──────────────────────────────────────────────────────────

/**
 * NVIDIA NIM client.
 * Uses the OpenAI SDK pointed at NVIDIA's OpenAI-compatible endpoint.
 * This requires zero changes to request/response handling.
 */
const nimClient = new OpenAI({
  baseURL: "https://integrate.api.nvidia.com/v1",
  apiKey: process.env.NVIDIA_NIM_API_KEY ?? "",
  timeout: parseInt(process.env.NVIDIA_NIM_TIMEOUT_MS ?? "30000"),
  maxRetries: 0,  // We handle retries manually for fallback control
});

/**
 * OpenAI client — existing, unchanged. Used as fallback.
 */
const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
  maxRetries: 2,
});

// ── Task types → Model mapping ────────────────────────────────────────────────

/**
 * Task types map to different NIM models.
 * "analysis" = fast 70B for classification/review
 * "fix"      = Nemotron 70B for deeper reasoning, code generation, root cause
 * "enrich"   = fast 70B for explanation/summarization
 */
export type AITask = "analysis" | "fix" | "enrich";

const NIM_MODEL_MAP: Record<AITask, string> = {
  analysis: process.env.NVIDIA_NIM_MODEL_ANALYSIS ?? "meta/llama-3.3-70b-instruct",
  fix:      process.env.NVIDIA_NIM_MODEL_FIX      ?? "meta/llama-3.1-405b-instruct",
  enrich:   process.env.NVIDIA_NIM_MODEL_ANALYSIS ?? "meta/llama-3.3-70b-instruct",
};

const OPENAI_FALLBACK_MODEL = process.env.OPENAI_FALLBACK_MODEL ?? "gpt-4o";

// ── Provider status tracking ──────────────────────────────────────────────────

/**
 * In-memory circuit breaker for NIM.
 * If NIM fails CIRCUIT_THRESHOLD times in a row, it's marked "open"
 * and we skip directly to OpenAI for CIRCUIT_RESET_MS milliseconds.
 * This prevents hammering a rate-limited NIM endpoint.
 */
const circuit = {
  failures: 0,
  isOpen: false,
  openedAt: 0,
  THRESHOLD: 3,
  RESET_MS: 60_000, // 1 minute cooldown
};

function isCircuitOpen(): boolean {
  if (!circuit.isOpen) return false;
  // Auto-reset after cooldown
  if (Date.now() - circuit.openedAt > circuit.RESET_MS) {
    circuit.isOpen = false;
    circuit.failures = 0;
    console.log("[AI Provider] NIM circuit reset. Retrying NIM.");
    return false;
  }
  return true;
}

function recordNIMSuccess(): void {
  circuit.failures = 0;
  circuit.isOpen = false;
}

function recordNIMFailure(): void {
  circuit.failures++;
  if (circuit.failures >= circuit.THRESHOLD) {
    circuit.isOpen = true;
    circuit.openedAt = Date.now();
    console.warn(`[AI Provider] NIM circuit OPEN after ${circuit.failures} failures. Falling back to OpenAI for ${circuit.RESET_MS / 1000}s.`);
  }
}

// ── Provider stats (exposed via /api/ai/status endpoint) ─────────────────────

export const providerStats = {
  nimCalls: 0,
  nimSuccesses: 0,
  nimFailures: 0,
  openaiCalls: 0,
  openaiSuccesses: 0,
  openaiFailures: 0,
  lastProvider: "none" as "nim" | "openai" | "none",
  lastFailureReason: "" as string,
};

// ── NIM Rate Limit Guard ──────────────────────────────────────────────────────

/**
 * Simple sliding window counter.
 * Tracks NIM calls in the last 60 seconds.
 * If we're at 35+/min (buffer before the 40/min hard limit),
 * we add a small delay to spread calls out.
 */
const nimRateWindow: number[] = [];
const NIM_RATE_LIMIT = 40;
const NIM_RATE_WINDOW_MS = 60_000;
const NIM_RATE_BUFFER = 5; // Stay 5 below the hard limit

async function applyNIMRateGuard(): Promise<void> {
  const now = Date.now();
  // Remove calls older than 60 seconds from the window
  while (nimRateWindow.length > 0 && nimRateWindow[0] < now - NIM_RATE_WINDOW_MS) {
    nimRateWindow.shift();
  }

  // If we're approaching the limit, wait proportionally
  if (nimRateWindow.length >= NIM_RATE_LIMIT - NIM_RATE_BUFFER) {
    const waitMs = NIM_RATE_WINDOW_MS - (now - (nimRateWindow[0] ?? now)) + 100;
    console.log(`[AI Provider] NIM rate guard: ${nimRateWindow.length} calls/min. Waiting ${waitMs}ms.`);
    await sleep(Math.max(0, waitMs));
  }

  nimRateWindow.push(now);
}

// ── Core call function ────────────────────────────────────────────────────────

export interface AICallOptions {
  task: AITask;
  messages: ChatCompletionMessageParam[];
  maxTokens?: number;
  temperature?: number;
  responseFormat?: { type: "json_object" } | { type: "text" };
}

export interface AICallResult {
  content: string;
  provider: "nim" | "openai";
  model: string;
  promptTokens: number;
  completionTokens: number;
}

/**
 * THE MAIN FUNCTION — call this everywhere instead of openai.chat.completions.create()
 *
 * Tries NVIDIA NIM first. On any failure (rate limit, timeout, error),
 * automatically retries up to NVIDIA_NIM_MAX_RETRIES times, then
 * falls back to OpenAI seamlessly.
 */
export async function callAI(options: AICallOptions): Promise<AICallResult> {
  const {
    task,
    messages,
    maxTokens = 1500,
    temperature = 0,
    responseFormat,
  } = options;

  const forceFallback = process.env.FORCE_OPENAI_FALLBACK === "true";
  const nimKey = process.env.NVIDIA_NIM_API_KEY ?? "";
  const nimAvailable = nimKey.length > 0 && nimKey.startsWith("nvapi-");
  const maxNIMRetries = parseInt(process.env.NVIDIA_NIM_MAX_RETRIES ?? "2");

  // ── Try NVIDIA NIM ─────────────────────────────────────────────────────────
  if (nimAvailable && !forceFallback && !isCircuitOpen()) {
    const nimModel = NIM_MODEL_MAP[task];

    for (let attempt = 1; attempt <= maxNIMRetries; attempt++) {
      try {
        console.log(`[AI Provider] NIM attempt ${attempt}/${maxNIMRetries} — model: ${nimModel}`);
        
        // Rate limit guard
        await applyNIMRateGuard();
        
        providerStats.nimCalls++;

        const params: ChatCompletionCreateParamsNonStreaming = {
          model: nimModel,
          messages,
          max_tokens: maxTokens,
          temperature,
        };

        // NIM supports response_format for supported models
        if (responseFormat?.type === "json_object") {
          params.response_format = { type: "json_object" };
        }

        const response = await nimClient.chat.completions.create(params);
        const content = response.choices[0]?.message?.content ?? "";

        recordNIMSuccess();
        providerStats.nimSuccesses++;
        providerStats.lastProvider = "nim";

        return {
          content,
          provider: "nim",
          model: nimModel,
          promptTokens: response.usage?.prompt_tokens ?? 0,
          completionTokens: response.usage?.completion_tokens ?? 0,
        };

      } catch (err: unknown) {
        const error = err as { status?: number; message?: string; code?: string };
        const isRateLimit = error.status === 429;
        const isServerError = error.status !== undefined && error.status >= 500;
        const isTimeout = error.code === "ETIMEDOUT" || error.message?.includes("timeout");
        const isModelError = error.status === 400; // Model doesn't support feature

        providerStats.lastFailureReason = error.message ?? "unknown";

        console.warn(
          `[AI Provider] NIM attempt ${attempt} failed: [${error.status ?? error.code}] ${error.message?.slice(0, 100)}`
        );

        // On rate limit: wait before retry
        if (isRateLimit && attempt < maxNIMRetries) {
          const waitMs = 1500 * attempt; // Progressive backoff
          console.log(`[AI Provider] NIM rate limited. Waiting ${waitMs}ms before retry...`);
          await sleep(waitMs);
          continue;
        }

        // On server error or timeout: retry immediately
        if ((isServerError || isTimeout) && attempt < maxNIMRetries) {
          continue;
        }

        // On model error (unsupported feature): retry without response_format
        if (isModelError && responseFormat?.type === "json_object" && attempt < maxNIMRetries) {
          console.log("[AI Provider] Model doesn't support response_format. Retrying with JSON-in-prompt.");
          // Inject JSON instruction into the system message instead
          const messagesCopy = [...messages];
          if (messagesCopy[0]?.role === "system") {
            messagesCopy[0] = {
              ...messagesCopy[0],
              content: messagesCopy[0].content + "\n\nIMPORTANT: Respond ONLY with valid JSON. No prose, no markdown, no code fences."
            };
          }
          
          // Retry with adjusted params
          try {
            providerStats.nimCalls++;
            const response = await nimClient.chat.completions.create({
              model: nimModel,
              messages: messagesCopy,
              max_tokens: maxTokens,
              temperature,
            });
            const content = response.choices[0]?.message?.content ?? "";
            recordNIMSuccess();
            providerStats.nimSuccesses++;
            providerStats.lastProvider = "nim";
            return {
              content,
              provider: "nim",
              model: nimModel,
              promptTokens: response.usage?.prompt_tokens ?? 0,
              completionTokens: response.usage?.completion_tokens ?? 0,
            };
          } catch (retryErr) {
            // If the retry also fails, fall through to fallback logic
            console.warn("[AI Provider] NIM JSON-in-prompt retry also failed.");
          }
        }

        // All retries exhausted — record and fall through to OpenAI
        recordNIMFailure();
        providerStats.nimFailures++;
        break;
      }
    }

    console.warn("[AI Provider] NIM exhausted. Falling back to OpenAI.");
  } else if (!nimAvailable) {
    console.log("[AI Provider] NVIDIA_NIM_API_KEY not set or invalid. Using OpenAI directly.");
  } else if (isCircuitOpen()) {
    console.log("[AI Provider] NIM circuit is OPEN. Using OpenAI directly.");
  }

  // ── Fallback: OpenAI ───────────────────────────────────────────────────────
  try {
    console.log(`[AI Provider] OpenAI fallback — model: ${OPENAI_FALLBACK_MODEL}`);
    providerStats.openaiCalls++;

    const params: ChatCompletionCreateParamsNonStreaming = {
      model: OPENAI_FALLBACK_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature,
    };

    if (responseFormat) {
      params.response_format = responseFormat;
    }

    const response = await openaiClient.chat.completions.create(params);
    const content = response.choices[0]?.message?.content ?? "";

    providerStats.openaiSuccesses++;
    providerStats.lastProvider = "openai";

    return {
      content,
      provider: "openai",
      model: OPENAI_FALLBACK_MODEL,
      promptTokens: response.usage?.prompt_tokens ?? 0,
      completionTokens: response.usage?.completion_tokens ?? 0,
    };

  } catch (err: unknown) {
    const error = err as { message?: string };
    providerStats.openaiFailures++;
    providerStats.lastFailureReason = error.message ?? "unknown";
    console.error("[AI Provider] OpenAI fallback also failed:", error.message);
    throw new Error(`Both AI providers failed. Last error: ${error.message}`);
  }
}

// ── Utility ───────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if NVIDIA NIM is reachable with a lightweight ping.
 * Used by the /api/ai/status health endpoint.
 */
export async function pingNIM(): Promise<{ reachable: boolean; latencyMs: number; error?: string }> {
  const start = Date.now();
  try {
    const nimKey = process.env.NVIDIA_NIM_API_KEY ?? "";
    if (!nimKey.startsWith("nvapi-")) {
      return { reachable: false, latencyMs: 0, error: "Invalid NIM key" };
    }

    await nimClient.chat.completions.create({
      model: NIM_MODEL_MAP.enrich,
      messages: [{ role: "user", content: "Reply with: OK" }],
      max_tokens: 5,
      temperature: 0,
    });
    return { reachable: true, latencyMs: Date.now() - start };
  } catch (err: unknown) {
    return { reachable: false, latencyMs: Date.now() - start, error: (err as { message?: string }).message };
  }
}
