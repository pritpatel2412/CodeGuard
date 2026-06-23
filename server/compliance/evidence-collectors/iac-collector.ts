import fs from "fs/promises";
import path from "path";
import { ASVSControl, ControlResult, EvidenceTrail } from "../asvs-controls.js";

export async function runIaCCollector(
  repoPath: string,
  controls: ASVSControl[]
): Promise<ControlResult[]> {
  const results: ControlResult[] = [];
  const targetControls = controls.filter(c => c.evidenceType === "iac");
  
  if (targetControls.length === 0) return results;

  let hasDockerfile = false;
  try {
    await fs.access(path.join(repoPath, "Dockerfile"));
    hasDockerfile = true;
  } catch {}

  for (const control of targetControls) {
    if (!hasDockerfile) {
      results.push({
        controlId: control.id,
        verdict: "not_applicable",
        evidence: [{
          collector: "iac",
          timestamp: new Date().toISOString(),
          raw_evidence_snippet: "No Infrastructure as Code (Dockerfile) found."
        }]
      });
      continue;
    }

    results.push({
      controlId: control.id,
      verdict: "requires_manual_attestation",
      evidence: [{
        collector: "iac",
        timestamp: new Date().toISOString(),
        raw_evidence_snippet: "IaC files found. Manual review required for MVP."
      }]
    });
  }

  return results;
}
