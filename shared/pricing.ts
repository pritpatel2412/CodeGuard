export interface PricingTier {
  id: string;
  name: string;
  targetRepoSize: string;
  asvsLevelSupported: string;
  priceUsd: number;
  turnaroundEstimate: string;
  included: string[];
  notIncluded: string[];
}

export const AUDIT_PRICING_TIERS: PricingTier[] = [
  {
    id: "small",
    name: "Small",
    targetRepoSize: "<10k LOC",
    asvsLevelSupported: "L1 + L2",
    /*
     * PRICING RATIONALE:
     * A traditional third-party CPA audit engagement costs between $8,000 and $50,000.
     * CodeGuard is an automated readiness report, not a licensed CPA.
     * $1,500 sits meaningfully below the $8k floor, making it an easy "yes" for startups
     * preparing for an audit.
     * The GPT-4o / NIM token cost for a small repo audit is roughly $5-$15 (from eval harness),
     * so $1,500 offers excellent margins while remaining extremely competitive.
     */
    priceUsd: 1500,
    turnaroundEstimate: "24-48 hours",
    included: [
      "Automated ASVS Readiness Report",
      "Cryptographically Signed Artifact",
      "Actionable Remediation Guidance",
    ],
    notIncluded: [
      "Does NOT replace a licensed CPA SOC2/ASVS certification",
      "Manual Penetration Testing"
    ]
  },
  {
    id: "medium",
    name: "Medium",
    targetRepoSize: "10k-100k LOC",
    asvsLevelSupported: "L1 + L2",
    /*
     * PRICING RATIONALE:
     * Priced at $2,500 to account for higher token usage (approx $30-$100) and increased
     * complexity, but still a fraction of the traditional cost.
     */
    priceUsd: 2500,
    turnaroundEstimate: "24-48 hours",
    included: [
      "Automated ASVS Readiness Report",
      "Cryptographically Signed Artifact",
      "Actionable Remediation Guidance",
      "Priority Email Support"
    ],
    notIncluded: [
      "Does NOT replace a licensed CPA SOC2/ASVS certification",
      "Manual Penetration Testing"
    ]
  },
  {
    id: "large",
    name: "Large",
    targetRepoSize: "100k+ LOC",
    asvsLevelSupported: "L1 + L2",
    /*
     * PRICING RATIONALE:
     * Large repos require significant API limits and processing time. $5,000 reflects
     * enterprise value while remaining well below a full $50k engagement.
     */
    priceUsd: 5000,
    turnaroundEstimate: "48-72 hours",
    included: [
      "Automated ASVS Readiness Report",
      "Cryptographically Signed Artifact",
      "Actionable Remediation Guidance",
      "Dedicated Slack Channel"
    ],
    notIncluded: [
      "Does NOT replace a licensed CPA SOC2/ASVS certification",
      "Manual Penetration Testing"
    ]
  }
];
