export type PolicySeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface PolicyRule {
  id: string;
  name: string;
  severity: PolicySeverity;
  description: string;
  examples?: {
    violation?: string;
    compliant?: string;
  };
}

export interface RepositoryPolicy {
  policyName: string;
  policyVersion: string;
  complianceFrameworks: string[];
  rules: PolicyRule[];
  disabledBuiltinRules: string[];
}

export interface PolicyViolation {
  ruleId: string;
  ruleName: string;
  severity: PolicySeverity;
  filePath: string;
  lineNumber: number | null;
  violatingCode: string;
  explanation: string;
  suggestedFix: string;
}
