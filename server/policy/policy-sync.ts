import { eq } from "drizzle-orm";
import { db } from "../db.js";
import { repositoryPolicies } from "../../shared/schema.js";
import type { RepositoryPolicy } from "./types.js";

export async function syncRepositoryPolicy(
  repositoryId: string,
  policy: RepositoryPolicy,
  fileSha: string,
  rawYaml: string,
): Promise<void> {
  await db
    .insert(repositoryPolicies)
    .values({
      repositoryId,
      policyName: policy.policyName,
      policyVersion: policy.policyVersion,
      complianceFrameworks: policy.complianceFrameworks,
      rules: policy.rules,
      disabledBuiltinRules: policy.disabledBuiltinRules,
      fileSha,
      rawYaml,
      isActive: true,
      lastSyncedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: repositoryPolicies.repositoryId,
      set: {
        policyName: policy.policyName,
        policyVersion: policy.policyVersion,
        complianceFrameworks: policy.complianceFrameworks,
        rules: policy.rules,
        disabledBuiltinRules: policy.disabledBuiltinRules,
        fileSha,
        rawYaml,
        lastSyncedAt: new Date(),
      },
    });
}

export async function getCachedPolicy(repositoryId: string) {
  const [record] = await db
    .select()
    .from(repositoryPolicies)
    .where(eq(repositoryPolicies.repositoryId, repositoryId))
    .limit(1);

  return record ?? null;
}
