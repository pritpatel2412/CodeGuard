import type { Octokit } from "@octokit/rest";
import { db } from "../db.js";
import { policyViolations } from "../../shared/schema.js";
import { enforceCustomPolicies } from "./policy-enforcer.js";
import { loadRepositoryPolicy } from "./yaml-loader.js";
import { getCachedPolicy, syncRepositoryPolicy } from "./policy-sync.js";

export interface PolicyOrchestrationInput {
  octokit: Octokit;
  owner: string;
  repo: string;
  ref: string;
  repositoryId: string;
  reviewId: string;
  codeDiff: string;
  changedFiles: Array<{ path: string; content: string }>;
}

export async function runPolicyEnforcement(input: PolicyOrchestrationInput): Promise<number> {
  const { octokit, owner, repo, ref, repositoryId, reviewId, codeDiff, changedFiles } = input;
  const cachedPolicy = await getCachedPolicy(repositoryId);
  if (cachedPolicy && cachedPolicy.isActive === false) {
    return 0;
  }

  const { policy, fileSha, rawYaml, error } = await loadRepositoryPolicy(octokit, owner, repo, ref);

  if (error) {
    console.warn(`[Policy] Failed to load .codeguard.yml: ${error}`);
  }

  if (!policy) {
    return 0;
  }

  if (fileSha && rawYaml) {
    await syncRepositoryPolicy(repositoryId, policy, fileSha, rawYaml);
  }

  const violations = await enforceCustomPolicies(codeDiff, changedFiles, policy.rules);
  if (violations.length === 0) {
    return 0;
  }

  await db.insert(policyViolations).values(
    violations.map((violation) => ({
      reviewId,
      repositoryId,
      ruleId: violation.ruleId,
      ruleName: violation.ruleName,
      severity: violation.severity,
      filePath: violation.filePath,
      lineNumber: violation.lineNumber,
      violatingCode: violation.violatingCode,
      explanation: violation.explanation,
      suggestedFix: violation.suggestedFix,
    })),
  );

  return violations.length;
}
