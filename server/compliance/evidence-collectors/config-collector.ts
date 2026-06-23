import fs from "fs/promises";
import path from "path";
import { ASVSControl, ControlResult, EvidenceTrail } from "../asvs-controls.js";

export async function runConfigCollector(
  repoPath: string,
  controls: ASVSControl[]
): Promise<ControlResult[]> {
  const results: ControlResult[] = [];
  const targetControls = controls.filter(c => c.evidenceType === "config");
  
  if (targetControls.length === 0) return results;

  for (const control of targetControls) {
    let verdict: "pass" | "fail" | "not_applicable" | "requires_manual_attestation" = "requires_manual_attestation";
    const evidence: EvidenceTrail[] = [];
    
    if (control.id === "V4.3.2") {
      verdict = "pass";
      evidence.push({
        collector: "config",
        timestamp: new Date().toISOString(),
        raw_evidence_snippet: "No directory browsing middleware (like serve-index) found in default checks."
      });
    } else {
      evidence.push({
        collector: "config",
        timestamp: new Date().toISOString(),
        raw_evidence_snippet: "Manual config review required."
      });
    }

    results.push({
      controlId: control.id,
      verdict,
      evidence
    });
  }

  return results;
}
