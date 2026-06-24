import { glob } from "glob";
import fs from "fs/promises";
import path from "path";
import { ASVSControl, ControlResult, EvidenceTrail } from "../asvs-controls.js";
import { callAI } from "../../ai/provider.js";

const MAX_FILES_TO_PROCESS = 50;
const MAX_CONTENT_LENGTH = 100000;

export async function runStaticAnalysis(
  repoPath: string,
  controls: ASVSControl[],
  onProgress?: (msg: string, pct: number) => void,
  abortSignal?: AbortSignal
): Promise<ControlResult[]> {
  const results: ControlResult[] = [];
  const targetControls = controls.filter(c => c.evidenceType === "static_analysis");
  
  if (targetControls.length === 0) return results;

  // Gather source files
  onProgress?.("Discovering source files...", 0);
  const files = await glob("**/*.{ts,js,tsx,jsx,py,go,java}", {
    cwd: repoPath,
    ignore: ["**/node_modules/**", "**/dist/**", "**/build/**", "**/*.test.*"],
    absolute: true,
  });

  let combinedContent = "";
  let processedCount = 0;
  const totalFiles = Math.min(files.length, MAX_FILES_TO_PROCESS);

  for (const file of files) {
    if (abortSignal?.aborted) throw new Error("Audit was manually cancelled by the user");
    if (processedCount >= MAX_FILES_TO_PROCESS) break;
    
    const relativePath = path.relative(repoPath, file);
    onProgress?.(`Parsing ${relativePath}...`, Math.floor((processedCount / totalFiles) * 50));
    
    const content = await fs.readFile(file, "utf-8");
    const fileHeader = `\n--- FILE: ${relativePath} ---\n`;
    
    if (combinedContent.length + fileHeader.length + content.length > MAX_CONTENT_LENGTH) {
      break;
    }
    
    combinedContent += fileHeader + content;
    processedCount++;
  }

  onProgress?.(`Found ${processedCount} relevant files. Evaluating against ASVS controls...`, 50);

  const prompt = `You are an expert Security Auditor evaluating an application against the OWASP ASVS 5.0 framework.
  
Evaluate the provided codebase snippet against the following controls:
${targetControls.map(c => `- [${c.id}] ${c.description}`).join('\n')}

For each control, return a verdict ("pass", "fail", or "requires_manual_attestation") and a short evidence snippet if applicable.
Return JSON strictly in this format:
{
  "evaluations": [
    {
      "controlId": "V...",
      "verdict": "pass|fail|requires_manual_attestation",
      "source_file": "path/to/file.ts or empty",
      "raw_evidence_snippet": "Relevant code snippet or reasoning"
    }
  ]
}

Codebase snippet:
${combinedContent}
`;

  try {
    if (abortSignal?.aborted) throw new Error("Audit was manually cancelled by the user");
    
    onProgress?.("Running AI static analysis engine...", 60);
    
    // Wrap callAI in a Promise.race to prevent infinite hangs
    const aiResponse = await Promise.race([
      callAI({
        task: "analysis",
        messages: [{ role: "user", content: prompt }],
        responseFormat: { type: "json_object" },
        signal: abortSignal
      }),
      new Promise<any>((_, reject) => setTimeout(() => reject(new Error("AI analysis timed out after 3 minutes")), 180000))
    ]);

    onProgress?.("Processing evaluation results...", 90);

    const parsed = JSON.parse(aiResponse.content);
    const evals = parsed.evaluations || [];

    for (const control of targetControls) {
      const evaluation = evals.find((e: any) => e.controlId === control.id);
      
      if (evaluation) {
        const evidence: EvidenceTrail[] = [];
        if (evaluation.raw_evidence_snippet) {
          evidence.push({
            source_file: evaluation.source_file,
            collector: "static_analysis",
            timestamp: new Date().toISOString(),
            raw_evidence_snippet: evaluation.raw_evidence_snippet
          });
        }
        
        results.push({
          controlId: control.id,
          verdict: evaluation.verdict,
          evidence
        });
      } else {
        results.push({
          controlId: control.id,
          verdict: "requires_manual_attestation",
          evidence: []
        });
      }
    }
  } catch (error) {
    console.error("Static analysis AI call failed", error);
    for (const control of targetControls) {
      results.push({
        controlId: control.id,
        verdict: "requires_manual_attestation",
        evidence: [{
          collector: "static_analysis",
          timestamp: new Date().toISOString(),
          raw_evidence_snippet: "Failed to run static analysis automatically."
        }]
      });
    }
  }

  return results;
}
