import { ASVS_CONTROLS, ControlResult } from "./asvs-controls.js";
import { runStaticAnalysis } from "./evidence-collectors/static-analysis.js";
import { runCodeReview } from "./evidence-collectors/code-review.js";
import { runConfigCollector } from "./evidence-collectors/config-collector.js";
import { runIaCCollector } from "./evidence-collectors/iac-collector.js";

export async function runComplianceAudit(
  repoPath: string,
  onProgress?: (msg: string, percentage: number) => void
): Promise<ControlResult[]> {
  console.log(`[Audit] Starting ASVS 5.0 Audit on ${repoPath}`);
  
  const results: ControlResult[] = [];
  
  const staticResults = await runStaticAnalysis(repoPath, ASVS_CONTROLS, onProgress);
  const codeReviewResults = await runCodeReview(repoPath, ASVS_CONTROLS);
  const configResults = await runConfigCollector(repoPath, ASVS_CONTROLS);
  const iacResults = await runIaCCollector(repoPath, ASVS_CONTROLS);
  
  // Combine dynamic and external audit controls with manual attestation
  const manualControls = ASVS_CONTROLS.filter(c => 
    c.evidenceType === "dynamic_test" || c.evidenceType === "external_audit"
  );
  
  const manualResults: ControlResult[] = manualControls.map(c => ({
    controlId: c.id,
    verdict: "requires_manual_attestation",
    evidence: [{
      collector: "orchestrator",
      timestamp: new Date().toISOString(),
      raw_evidence_snippet: `Evidence type '${c.evidenceType}' requires manual attestation.`
    }]
  }));

  results.push(...staticResults, ...codeReviewResults, ...configResults, ...iacResults, ...manualResults);
  
  return results;
}
