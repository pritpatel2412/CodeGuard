import { Router } from "express";
import { storage } from "../storage.js";
import { runComplianceAudit } from "../compliance/orchestrator.js";
import { generateAndSignReport } from "../compliance/report-generator.js";
import { generateAuditPdf } from "../compliance/pdf-generator.js";
import git from "isomorphic-git";
// @ts-ignore
import http from "isomorphic-git/http/node";
import fsSync from "graceful-fs";
import fs from "fs/promises";
import os from "os";
import path from "path";
import { z } from "zod";
import crypto from "crypto";
import { promisify } from "util";
import { db } from "../db.js";
import { audits as auditsTable } from "../../shared/schema.js";
import { eq, desc } from "drizzle-orm";
import dns from "dns/promises";
import { auditIngestionLimiter } from "../middleware/rate-limit.js";

const MIN_AUDIT_SECRET_LEN = 32;
function resolveAuditSecret(): string {
  const secret = process.env.AUDIT_SECRET;
  if (process.env.NODE_ENV === "production") {
    if (!secret || secret.length < MIN_AUDIT_SECRET_LEN) {
      console.error("[FATAL] AUDIT_SECRET must be set in production and be at least 32 characters.");
      process.exit(1);
    }
    return secret;
  }
  if (!secret || secret.length < MIN_AUDIT_SECRET_LEN) {
    console.warn("[SECURITY] Using development AUDIT_SECRET fallback. Set AUDIT_SECRET in .env.");
    return "default_dev_audit_secret_key_12345";
  }
  return secret;
}
const AUDIT_SECRET = resolveAuditSecret();

const router = Router();

// Track active SSE connections per audit ID
const auditStreams = new Map<string, Set<any>>();

// Track active AbortControllers for cancellation
const activeAuditAbortControllers = new Map<string, AbortController>();

export function broadcastAuditProgress(auditId: string, status: string, progress: number, log?: string) {
  const clients = auditStreams.get(auditId);
  if (!clients) return;
  
  const payload = JSON.stringify({ status, progress, log, timestamp: new Date().toISOString() });
  for (const client of clients) {
    client.write(`data: ${payload}\n\n`);
  }
}

const createAuditSchema = z.object({
  repositoryUrl: z.string().url(),
  branch: z.string().min(1).default("main"),
  framework: z.literal("asvs-5.0").default("asvs-5.0"),
});

async function isSafeUrl(urlString: string): Promise<boolean> {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    const ips = await dns.resolve(parsed.hostname);
    for (const ip of ips) {
      if (
        ip.startsWith("10.") ||
        ip.startsWith("192.168.") ||
        ip.startsWith("127.") ||
        ip.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./) ||
        ip === "::1" || ip.toLowerCase().startsWith("fc00:") || ip.toLowerCase().startsWith("fd00:")
      ) {
        return false;
      }
    }
    return true;
  } catch (e) {
    return false;
  }
}

router.post("/", auditIngestionLimiter, async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
  
  try {
    const parsed = createAuditSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.errors });
    }
    
    const { repositoryUrl, branch, framework } = parsed.data;

    if (!(await isSafeUrl(repositoryUrl))) {
      return res.status(400).json({ error: "Invalid or unsafe repository URL" });
    }
    
    const audit = await storage.createAudit({
      repositoryUrl,
      branch,
      framework,
      status: "pending",
      userId: req.user!.id
    });
    
    res.status(201).json(audit);
    
    runAuditAsync(audit.id, repositoryUrl, branch, req.user!.id).catch(console.error);
    
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/history", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
  
  try {
    const { repositoryUrl } = req.query;
    
    let audits;
    if (repositoryUrl && typeof repositoryUrl === "string") {
      audits = await storage.getAuditsByRepository(repositoryUrl, req.user!.id);
    } else {
      // Return all audits for the user if no repo is specified
      // We might need to add a method to storage, but for now we can filter them all
      // Or we can just use a storage method
      const allUserAudits = await db.select().from(auditsTable).where(eq(auditsTable.userId, req.user!.id)).orderBy(desc(auditsTable.startedAt));
      audits = allUserAudits;
    }
    res.json(audits);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
  
  try {
    const audit = await storage.getAudit(req.params.id);
    if (!audit) return res.status(404).json({ error: "Audit not found" });
    if (audit.userId !== req.user!.id) return res.status(403).json({ error: "Unauthorized" });
    
    res.json(audit);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/report", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
  
  try {
    const audit = await storage.getAudit(req.params.id);
    if (!audit || !audit.reportId) return res.status(404).json({ error: "Report not found" });
    if (audit.userId !== req.user!.id) return res.status(403).json({ error: "Unauthorized" });
    
    const report = await storage.getAuditReport(audit.reportId);
    if (!report) return res.status(404).json({ error: "Report data missing" });
    
    res.json((report.reportJson as any).results);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/download", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
  
  try {
    const audit = await storage.getAudit(req.params.id);
    if (!audit || !audit.reportId) return res.status(404).json({ error: "Report not found" });
    if (audit.userId !== req.user!.id) return res.status(403).json({ error: "Unauthorized" });
    
    const report = await storage.getAuditReport(audit.reportId);
    if (!report) return res.status(404).json({ error: "Report data missing" });
    
    res.setHeader('Content-disposition', `attachment; filename=CodeGuard-Audit-${audit.id}.json`);
    res.setHeader('Content-type', 'application/json');
    res.send(JSON.stringify({
      report: report.reportJson,
      hash: report.reportHash,
      signature: report.signature
    }, null, 2));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/pdf", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
  
  try {
    const audit = await storage.getAudit(req.params.id);
    if (!audit || !audit.reportId) return res.status(404).json({ error: "Report not found" });
    if (audit.userId !== req.user!.id) return res.status(403).json({ error: "Unauthorized" });
    
    const report = await storage.getAuditReport(audit.reportId);
    if (!report) return res.status(404).json({ error: "Report data missing" });
    
    const pdfBuffer = await generateAuditPdf(audit, report);
    
    res.setHeader('Content-disposition', `attachment; filename=CodeGuard-Audit-${audit.id}.pdf`);
    res.setHeader('Content-type', 'application/pdf');
    res.send(pdfBuffer);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/verify", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
  
  try {
    const audit = await storage.getAudit(req.params.id);
    if (!audit || !audit.reportId) return res.status(404).json({ error: "Report not found" });
    // Allow if userId is null (legacy audits) or matches the current user
    if (audit.userId && audit.userId !== req.user!.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    
    const report = await storage.getAuditReport(audit.reportId);
    if (!report) return res.status(404).json({ error: "Report data missing" });
    
    const hmac = crypto.createHmac('sha256', AUDIT_SECRET);
    hmac.update(report.reportHash || "");
    const expectedSignature = hmac.digest('hex');
    
    // Check if report.signature exists to avoid matching empty hashes erroneously
    const isValid = !!report.signature && expectedSignature === report.signature;
    
    res.json({ isValid, hash: report.reportHash, signature: expectedSignature, storedHash: report.reportHash });
  } catch (error: any) {
    console.error("Verify signature error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id/stream", (req, res) => {
  // We use URL query param or rely on cookie session for auth, 
  // but SSE with cookies usually works automatically if same-origin
  if (!req.isAuthenticated()) {
    return res.status(401).end();
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const auditId = req.params.id;
  if (!auditStreams.has(auditId)) {
    auditStreams.set(auditId, new Set());
  }
  
  auditStreams.get(auditId)!.add(res);

  // Send initial connected event
  res.write(`data: ${JSON.stringify({ status: "connected", progress: 0, log: "Connected to audit log stream..." })}\n\n`);

  req.on("close", () => {
    const clients = auditStreams.get(auditId);
    if (clients) {
      clients.delete(res);
      if (clients.size === 0) {
        auditStreams.delete(auditId);
      }
    }
  });
});

router.post("/:id/cancel", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
  
  const auditId = req.params.id;
  const audit = await storage.getAudit(auditId);
  
  if (!audit) return res.status(404).json({ error: "Audit not found" });
  if (audit.status !== "pending" && audit.status !== "running") {
    return res.status(400).json({ error: "Audit is not running" });
  }

  const abortController = activeAuditAbortControllers.get(auditId);
  if (abortController) {
    abortController.abort();
    activeAuditAbortControllers.delete(auditId);
  }

  await storage.updateAudit(auditId, { status: "failed", completedAt: new Date() });
  broadcastAuditProgress(auditId, "failed", 100, "Audit was manually cancelled by the user.");
  
  res.json({ success: true, message: "Audit cancelled successfully" });
});

// isomorphic-git uses fs.promises if available, which graceful-fs does NOT patch for EMFILE handling.
// We must manually provide a promisified fs object using graceful-fs's callback methods.
const gitFs = {
  ...fsSync,
  promises: {
    readFile: promisify(fsSync.readFile),
    writeFile: promisify(fsSync.writeFile),
    mkdir: promisify(fsSync.mkdir),
    rmdir: promisify(fsSync.rmdir),
    unlink: promisify(fsSync.unlink),
    stat: promisify(fsSync.stat),
    lstat: promisify(fsSync.lstat),
    readdir: promisify(fsSync.readdir),
    readlink: promisify(fsSync.readlink),
    symlink: promisify(fsSync.symlink),
    chmod: promisify(fsSync.chmod),
  }
};

export async function runAuditAsync(auditId: string, repoUrl: string, branch: string, userId: string) {
  const cloneDir = path.join(os.tmpdir(), "codeguard-audits", auditId);
  const abortController = new AbortController();
  activeAuditAbortControllers.set(auditId, abortController);
  
  try {
    await storage.updateAudit(auditId, { status: "running" });
    
    await fs.mkdir(cloneDir, { recursive: true });
    
    // Fetch user for access token
    const user = await storage.getUser(userId);
    let authAttempts = 0;
    const onAuth = user?.accessToken ? () => {
      if (authAttempts++ > 0) return { cancel: true };
      return { username: 'x-access-token', password: user.accessToken ?? undefined };
    } : undefined;
    
    console.log(`[Audit] Cloning ${repoUrl}#${branch} to ${cloneDir}`);
    broadcastAuditProgress(auditId, "running", 5, `Cloning repository ${repoUrl}...`);
    
    // Add a race condition timeout to git.clone to prevent infinite hangs
    await Promise.race([
      git.clone({
        fs: gitFs,
        http,
        dir: cloneDir,
        url: repoUrl,
        ref: branch,
        singleBranch: true,
        depth: 1,
        onAuth
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Git clone timed out after 2 minutes")), 120000))
    ]);
    
    broadcastAuditProgress(auditId, "running", 15, `Repository cloned successfully. Starting analysis...`);
    
    if (abortController.signal.aborted) throw new Error("Audit was manually cancelled by the user");
    
    const results = await runComplianceAudit(cloneDir, (logMsg, pct) => {
      // Map inner percentages (0-100) to the analysis phase (15% to 85%)
      const overallProgress = 15 + Math.floor(pct * 0.70);
      broadcastAuditProgress(auditId, "running", overallProgress, logMsg);
    }, abortController.signal);
    
    if (abortController.signal.aborted) throw new Error("Audit was manually cancelled by the user");
    
    broadcastAuditProgress(auditId, "running", 90, `Generating cryptographic signature and PDF report...`);
    const report = await generateAndSignReport(auditId, results);
    
    await storage.updateAudit(auditId, { status: "complete", completedAt: new Date(), reportId: report.id });
    console.log(`[Audit] Completed ${auditId}`);
    broadcastAuditProgress(auditId, "complete", 100, `Audit completed successfully.`);
    
    await fs.rm(cloneDir, { recursive: true, force: true });
  } catch (error: any) {
    if (error.name === 'AbortError' || error.message.includes('cancelled')) {
      console.log(`[Audit] Cancelled ${auditId}`);
      // Status update is already handled by the cancel route
    } else {
      console.error(`[Audit] Failed ${auditId}:`, error);
      await storage.updateAudit(auditId, { status: "failed", completedAt: new Date() });
      broadcastAuditProgress(auditId, "failed", 100, `Audit failed: ${error.message || "Unknown error"}`);
    }
    
    // Cleanup on failure
    try {
      await fs.rm(cloneDir, { recursive: true, force: true });
    } catch(e) {}
  } finally {
    activeAuditAbortControllers.delete(auditId);
  }
}

router.get("/:id/feedback", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
  try {
    const audit = await storage.getAudit(req.params.id);
    if (!audit || audit.userId !== req.user!.id) return res.status(403).json({ error: "Unauthorized" });
    
    const feedback = await storage.getAuditFeedback(audit.id);
    res.json(feedback || null);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/feedback/show", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
  try {
    const audit = await storage.getAudit(req.params.id);
    if (!audit || audit.userId !== req.user!.id) return res.status(403).json({ error: "Unauthorized" });
    
    let feedback = await storage.getAuditFeedback(audit.id);
    if (!feedback) {
      feedback = await storage.createAuditFeedback(audit.id);
    }
    res.json(feedback);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/:id/feedback/submit", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
  try {
    const audit = await storage.getAudit(req.params.id);
    if (!audit || audit.userId !== req.user!.id) return res.status(403).json({ error: "Unauthorized" });
    
    let feedback = await storage.getAuditFeedback(audit.id);
    if (!feedback) {
       return res.status(400).json({ error: "Feedback not initialized" });
    }
    
    const { responses, freeText } = req.body;
    feedback = await storage.updateAuditFeedback(feedback.id, { responses, freeText }) as any;
    
    res.json(feedback);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
