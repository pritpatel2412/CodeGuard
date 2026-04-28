import type { TaintPath } from "./types.js";
import { callAI } from "../ai/provider.js";

/**
 * For each detected taint path, asks GPT-4o to:
 * 1. Explain the vulnerability in plain language
 * 2. Describe the exact attack vector
 * 3. Generate a concrete, minimal code fix
 */
export async function enrichTaintPathsWithAI(
  paths: TaintPath[],
  repoContext: string    // Brief repo description or README snippet
): Promise<Array<TaintPath & { aiExplanation: string; aiFixSuggestion: string }>> {

  // Process in batches of 3 to avoid rate limits
  const enriched = [];
  const batchSize = 3;

  for (let i = 0; i < paths.length; i += batchSize) {
    const batch = paths.slice(i, i + batchSize);

    const batchResults = await Promise.all(
      batch.map(async (path) => {
        const prompt = buildEnrichmentPrompt(path, repoContext);

        try {
          const result = await callAI({
            task: "enrich",
            messages: [
              {
                role: "system",
                content: `You are a Principal Application Security Engineer with 15 years of experience. 
You are given a cross-file taint analysis finding. Respond ONLY with valid JSON in this exact shape:
{
  "explanation": "2-3 sentence plain-English explanation of the vulnerability and its real-world impact",
  "attackVector": "Step-by-step description of how an attacker would exploit this",
  "fix": "Concrete code snippet (15-30 lines max) showing the minimal, targeted fix. Include the file path as a comment."
}`,
              },
              { role: "user", content: prompt },
            ],
            responseFormat: { type: "json_object" },
            maxTokens: 1000,
            temperature: 0.1,
          });

          const content = result.content || "{}";
          const parsed = JSON.parse(content);

          return {
            ...path,
            aiExplanation: `${parsed.explanation}\n\nAttack Vector: ${parsed.attackVector}`,
            aiFixSuggestion: parsed.fix ?? "No fix generated.",
          };
        } catch (error: any) {
          console.error(`[Taint AI] Enrichment failed for path: ${error.message}`);
          return {
            ...path,
            aiExplanation: "AI enrichment failed for this path.",
            aiFixSuggestion: "Manual review required.",
          };
        }
      })
    );

    enriched.push(...batchResults);

    // Small delay between batches
    if (i + batchSize < paths.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return enriched;
}

function buildEnrichmentPrompt(path: TaintPath, repoContext: string): string {
  const chainStr = path.chain
    .map((c, i) => `  ${i + 1}. ${c.nodeId} (line ${c.line})`)
    .join("\n");

  return `
Repository Context: ${repoContext}

TAINT PATH DETECTED:

Vulnerability Type: ${path.sink.sinkType}
Severity: ${path.severity}

SOURCE (where tainted input enters):
  File + Function: ${path.source.nodeId}
  Line: ${path.source.line}
  Expression: ${path.source.expression}

PROPAGATION CHAIN (${path.chain.length} hops across files):
${chainStr}

SINK (where tainted data is dangerously used):
  File + Function: ${path.sink.nodeId}
  Line: ${path.sink.line}
  Expression: ${path.sink.expression}

Sanitizer Bypassed: ${path.sanitizerBypassed ? `YES — ${path.sanitizerLocation}` : "No sanitizer found"}

Generate the JSON response as instructed.
`.trim();
}
