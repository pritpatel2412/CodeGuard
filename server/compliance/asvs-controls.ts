export type EvidenceType =
  | "config"
  | "code_review"
  | "static_analysis"
  | "dynamic_test"
  | "iac"
  | "external_audit";

export type Verdict = "pass" | "fail" | "not_applicable" | "requires_manual_attestation";

export interface EvidenceTrail {
  source_file?: string;
  line_range?: string;
  finding_id?: string;
  collector: string;
  timestamp: string;
  raw_evidence_snippet: string;
}

export interface ControlResult {
  controlId: string;
  verdict: Verdict;
  evidence: EvidenceTrail[];
}

export interface ASVSControl {
  id: string;
  chapter: string;
  level: 1 | 2 | 3;
  description: string;
  evidenceType: EvidenceType;
}

export const ASVS_CONTROLS: ASVSControl[] = [
  // V2: Authentication
  {
    id: "V2.1.1",
    chapter: "V2",
    level: 1,
    description: "Verify that user set passwords are at least 12 characters in length (or 8 if using MFA).",
    evidenceType: "static_analysis",
  },
  {
    id: "V2.4.1",
    chapter: "V2",
    level: 1,
    description: "Verify that passwords are not stored in plaintext and are hashed using an approved algorithm.",
    evidenceType: "code_review",
  },
  {
    id: "V2.7.1",
    chapter: "V2",
    level: 1,
    description: "Verify that out-of-band authenticators use a secure channel.",
    evidenceType: "dynamic_test",
  },
  
  // V4: Access Control
  {
    id: "V4.1.1",
    chapter: "V4",
    level: 1,
    description: "Verify that the application enforces access control rules on a trusted service layer.",
    evidenceType: "code_review",
  },
  {
    id: "V4.3.1",
    chapter: "V4",
    level: 1,
    description: "Verify administrative interfaces use appropriate role-based access control.",
    evidenceType: "static_analysis",
  },
  {
    id: "V4.3.2",
    chapter: "V4",
    level: 1,
    description: "Verify that directory browsing is disabled unless deliberately desired.",
    evidenceType: "config",
  },

  // V5: Validation, Sanitization and Encoding
  {
    id: "V5.1.1",
    chapter: "V5",
    level: 1,
    description: "Verify that all input is validated against a strict allowlist of expected characters, type, length, and format.",
    evidenceType: "static_analysis",
  },
  {
    id: "V5.3.1",
    chapter: "V5",
    level: 1,
    description: "Verify that output encoding is applied to mitigate Cross-Site Scripting (XSS).",
    evidenceType: "code_review",
  },
  {
    id: "V5.5.1",
    chapter: "V5",
    level: 1,
    description: "Verify that the application protects against Server-Side Request Forgery (SSRF).",
    evidenceType: "code_review",
  }
];
