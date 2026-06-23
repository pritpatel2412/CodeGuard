import crypto from "crypto";
import { storage } from "../storage.js";
import { ControlResult } from "./asvs-controls.js";

// In production, this should be a strong secret injected via environment variables
const AUDIT_SECRET = process.env.AUDIT_SECRET || "default_dev_audit_secret_key_12345";

export async function generateAndSignReport(auditId: string, results: ControlResult[]) {
  // Create JSON payload
  const reportPayload = {
    auditId,
    timestamp: new Date().toISOString(),
    framework: "ASVS 5.0",
    results
  };
  
  const reportJson = JSON.stringify(reportPayload);

  // Generate SHA-256 hash of the payload
  const hash = crypto.createHash('sha256').update(reportJson).digest('hex');

  // Sign the hash with HMAC to prove CodeGuard generated it
  const hmac = crypto.createHmac('sha256', AUDIT_SECRET);
  hmac.update(hash);
  const signature = hmac.digest('hex');

  // Store in database
  const report = await storage.createAuditReport({
    auditId,
    reportJson: reportPayload,
    reportHash: hash,
    signature,
    pdfPath: null
  });

  return report;
}
