import type { Octokit } from "@octokit/rest";
import yaml from "js-yaml";
import { z } from "zod";
import type { RepositoryPolicy } from "./types.js";

const PolicyRuleSchema = z.object({
  id: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  severity: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
  description: z.string().min(10),
  examples: z.object({
    violation: z.string().optional(),
    compliant: z.string().optional(),
  }).optional(),
});

const RepositoryPolicySchema = z.object({
  version: z.string().default("1"),
  policy_name: z.string().default("Custom Policy"),
  compliance: z.array(z.string()).default([]),
  rules: z.array(PolicyRuleSchema).max(50),
  disabled_builtin_rules: z.array(z.string()).default([]),
});

export interface LoadPolicyResult {
  policy: RepositoryPolicy | null;
  fileSha: string | null;
  rawYaml: string | null;
  error: string | null;
}

export async function loadRepositoryPolicy(
  octokit: Octokit,
  owner: string,
  repo: string,
  ref: string,
): Promise<LoadPolicyResult> {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: ".codeguard.yml",
      ref,
    });

    if (!("content" in data)) {
      return { policy: null, fileSha: null, rawYaml: null, error: "Not a file" };
    }

    const rawYaml = Buffer.from(data.content, "base64").toString("utf-8");
    const parsed = yaml.load(rawYaml);
    const validated = RepositoryPolicySchema.safeParse(parsed);

    if (!validated.success) {
      const issues = validated.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
      return { policy: null, fileSha: data.sha, rawYaml, error: `Invalid .codeguard.yml: ${issues}` };
    }

    const value = validated.data;
    const policy: RepositoryPolicy = {
      policyName: value.policy_name,
      policyVersion: value.version,
      complianceFrameworks: value.compliance,
      rules: value.rules.map((rule) => ({
        id: rule.id,
        name: rule.name,
        severity: rule.severity,
        description: rule.description,
        examples: rule.examples,
      })),
      disabledBuiltinRules: value.disabled_builtin_rules,
    };

    return { policy, fileSha: data.sha, rawYaml, error: null };
  } catch (err: unknown) {
    if ((err as { status?: number }).status === 404) {
      return { policy: null, fileSha: null, rawYaml: null, error: null };
    }
    return { policy: null, fileSha: null, rawYaml: null, error: String(err) };
  }
}
