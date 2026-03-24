import OpenAI from "openai";
import { type AIReviewResponse, aiReviewResponseSchema } from "../shared/schema.js";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are an AI Pull Request Reviewer integrated into GitHub/GitLab via webhook.
Your job: analyze code diffs only, and produce sharp, actionable, low-noise review comments.

When analyzing a pull request diff:

1. Identify REAL issues, NOT stylistic noise.
2. Focus on:
   - Bug Detection: Logical mistakes, wrong conditions, off-by-one errors, incorrect async/await usage, missing error handling, wrong types, unused/unreachable code
   - Security Issues: SQL injection, dangerous string interpolation, JWT/session misuse, hardcoded secrets, unsafe cryptography, missing auth
   - Performance Issues: N+1 queries, heavy loops, repeated expensive operations, poor caching, inefficient state usage
   - Maintainability: Over-complex functions, missing types, weak error messages, bad naming, repeated code

3. NEVER comment about:
   - Prettier/ESLint style issues
   - Single quotes vs double quotes
   - Minor formatting
   - Nitpicky suggestions

4. Be concise, show exact reasoning, provide actionable fixes, mention risk if left unresolved.

5. Respond ONLY with valid JSON in this exact structure:
{
  "summary": "Short summary of the PR",
  "risk_level": "low | medium | high",
  "comments": [
    {
      "path": "file path",
      "line": 123,
      "type": "bug | performance | security | readability | maintainability",
      "comment": "Your specific review comment here"
    }
  ]
}

If there are no significant issues, return an empty comments array and low risk_level.`;

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
        model: "gpt-5",
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
        model: "gpt-5",
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
