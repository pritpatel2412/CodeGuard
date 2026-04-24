import OpenAI from "openai";
import { type AIReviewResponse, aiReviewResponseSchema } from "../shared/schema.js";

// the newest OpenAI model is "gpt-4o" for high-speed/high-quality. gpt-5 is currently a placeholder or future-spec.
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are a Senior App Sec Engineer. Analyze code diffs and provide a sharp, actionable JSON review.

Guidelines:
1. Focus on Bugs, Security (OWASP), Performance (N+1, heavy loops), and Maintainability.
2. Ignore stylistic/formatting noise.
3. Be concise. Provide specific reasoning and fixes.

JSON Structure:
{
  "summary": "PR summary",
  "risk_level": "low|medium|high",
  "comments": [{"path": "file", "line": 10, "type": "bug|security|...", "comment": "fix this"}]
}

If no issues, return empty comments and low risk.`;

// Retry with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on authentication or validation errors
      if (error.status === 401 || error.status === 400) {
        throw error;
      }

      // Wait with exponential backoff before retrying
      if (attempt < maxRetries - 1) {
        const delay = baseDelayMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
      }
    }
  }

  throw lastError;
}

export async function analyzeCodeDiff(diff: string, prTitle: string, platform: "github" | "gitlab" = "github"): Promise<AIReviewResponse> {
  // Truncate diff if too long (roughly 100k characters)
  const maxDiffLength = 100000;
  const truncatedDiff = diff.length > maxDiffLength
    ? diff.substring(0, maxDiffLength) + "\n\n[Diff truncated due to size]"
    : diff;

  const requestType = platform === "gitlab" ? "Merge Request" : "Pull Request";
  const userPrompt = `Please review this ${requestType} titled "${prTitle}".

Here is the diff:

\`\`\`diff
${truncatedDiff}
\`\`\`

Analyze the changes and provide your review in JSON format.`;

  try {
    const response = await withRetry(async () => {
      return openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
        max_completion_tokens: 4096,
      });
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error("OpenAI returned empty content");
      return createFallbackResponse("AI returned empty response");
    }

    // Parse and validate the JSON response
    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse OpenAI JSON response:", content);
      return createFallbackResponse("AI returned invalid JSON");
    }

    // Validate against schema
    const validationResult = aiReviewResponseSchema.safeParse(parsed);
    if (!validationResult.success) {
      console.error("OpenAI response validation failed:", validationResult.error.errors);

      // Try to extract what we can from the response
      const partialData = parsed as Record<string, unknown>;
      return {
        summary: typeof partialData.summary === 'string'
          ? partialData.summary
          : "Unable to parse AI response",
        risk_level: "low",
        comments: [],
      };
    }

    return validationResult.data;
  } catch (error: any) {
    console.error("OpenAI analysis failed after retries:", error.message);
    return createFallbackResponse(`AI analysis failed: ${error.message}`);
  }
}

function createFallbackResponse(reason: string): AIReviewResponse {
  return {
    summary: `Unable to complete automated code review. ${reason}`,
    risk_level: "low",
    comments: [],
  };
}

export async function generateFix(fileContent: string, issueDescription: string, issueLine: number): Promise<string> {
  const SYSTEM_PROMPT = `You are a senior application security engineer.

Your task:
- Fix the security issues in the code below
- Remove hardcoded secrets
- Replace secrets with environment variables
- Follow industry best practices
- Do NOT change business logic
- Do NOT add new dependencies
- Do NOT remove functionality

Return:
- ONLY the updated full file content
- NO markdown
- NO explanation`;

  const userPrompt = `
Full file content:
${fileContent}

Detected risk summary: ${issueDescription} (Line ${issueLine})

Please provide the fixed full file content.`;

  try {
    const response = await withRetry(async () => {
      return openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        max_completion_tokens: 8192, // Large limit for full file return
      });
    });

    let content = response.choices[0]?.message?.content || "";

    // Strip markdown code blocks if present (in case the model disobeys)
    content = content.replace(/^```[\w]*\n/, '').replace(/\n```$/, '');

    return content;
  } catch (error: any) {
    throw new Error(`Failed to generate fix: ${error.message}`);
  }
}
