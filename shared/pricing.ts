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
    id: "developer",
    name: "Developer",
    targetRepoSize: "<10k LOC",
    asvsLevelSupported: "Basic Scanning (No Audit)",
    priceUsd: 29,
    turnaroundEstimate: "Instant / PR Scan",
    included: [
      "Automated Code Quality Reviews",
      "Basic Static Security Scanning",
      "Standard Webhook Integration",
      "Standard Email Support",
    ],
    notIncluded: [
      "Automated ASVS/SOC2 Readiness Reports",
      "Cryptographically Signed Audit Artifacts",
      "Custom Policy (.codeguard.yml) Enforcement",
      "Priority SLA Support",
    ]
  },
  {
    id: "pro",
    name: "Pro Compliance",
    targetRepoSize: "10k-100k LOC",
    asvsLevelSupported: "ASVS Level 1 & 2",
    priceUsd: 199,
    turnaroundEstimate: "24-48 hours",
    included: [
      "Automated ASVS/SOC2 Readiness Reports",
      "Deep Taint-Path Dataflow Analysis",
      "Cryptographically Signed Audit Artifacts",
      "Custom Policy (.codeguard.yml) Enforcement",
      "Priority 24hr Email Support",
    ],
    notIncluded: [
      "ASVS Level 3 Certification Verification",
      "Dedicated Slack Support Channel",
      "Manual Penetration Testing",
    ]
  },
  {
    id: "enterprise",
    name: "Enterprise Audit",
    targetRepoSize: "100k+ LOC",
    asvsLevelSupported: "ASVS Levels 1, 2, & 3",
    priceUsd: 499,
    turnaroundEstimate: "12-24 hours (Priority)",
    included: [
      "ASVS Levels 1, 2, & 3 Audit Readiness",
      "Cryptographically Signed Audit Artifacts",
      "Dedicated Slack Channel Support",
      "Custom Compliance Standard Mapping",
      "High-Priority SLA (1hr Response)",
      "Multi-repository compliance reports",
    ],
    notIncluded: [
      "Does NOT replace a licensed CPA SOC2/ASVS certification",
      "Manual Penetration Testing (Add-on)"
    ]
  }
];

