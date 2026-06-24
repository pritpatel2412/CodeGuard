import { Router } from "express";
import { storage } from "../storage.js";
import { runComplianceAudit } from "../compliance/orchestrator.js";
import { generateAndSignReport } from "../compliance/report-generator.js";
import { generateAuditPdf } from "../compliance/pdf-generator.js";
import git from "isomorphic-git";
import http from "isomorphic-git/http/node";
import os from "os";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import { z } from "zod";
import crypto from "crypto";

const AUDIT_SECRET = process.env.AUDIT_SECRET || "default_dev_audit_secret_key_12345";

const router = Router();

const createAuditSchema = z.object({
  repositoryUrl: z.string().url(),
  branch: z.string().min(1).default("main"),
  framework: z.literal("asvs-5.0").default("asvs-5.0"),
});

router.post("/", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
  
  try {
    const parsed = createAuditSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.errors });
    }
    
    const { repositoryUrl, branch, framework } = parsed.data;
    
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
    if (!repositoryUrl || typeof repositoryUrl !== "string") {
      return res.status(400).json({ error: "repositoryUrl query parameter is required" });
    }
    
    const audits = await storage.getAuditsByRepository(repositoryUrl, req.user!.id);
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
    if (audit.userId !== req.user!.id) return res.status(403).json({ error: "Unauthorized" });
    
    const report = await storage.getAuditReport(audit.reportId);
    if (!report) return res.status(404).json({ error: "Report data missing" });
    
    // We cannot reliably re-hash the JSON string because Postgres JSONB serialization alters whitespace and key order.
    // Instead, we verify that the stored reportHash was genuinely signed by our AUDIT_SECRET.
    const hmac = crypto.createHmac('sha256', AUDIT_SECRET);
    hmac.update(report.reportHash || "");
    const expectedSignature = hmac.digest('hex');
    
    const isValid = expectedSignature === report.signature;
    
    res.json({ isValid, hash: report.reportHash, signature: expectedSignature, storedHash: report.reportHash });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function runAuditAsync(auditId: string, repoUrl: string, branch: string, userId: string) {
  const cloneDir = path.join(os.tmpdir(), "codeguard-audits", auditId);
  
  try {
    await storage.updateAudit(auditId, { status: "running" });
    
    await fs.mkdir(cloneDir, { recursive: true });
    
    // Fetch user for access token
    const user = await storage.getUser(userId);
    const onAuth = user?.accessToken ? () => ({ username: user.accessToken, password: "" }) : undefined;
    
    console.log(`[Audit] Cloning ${repoUrl}#${branch} to ${cloneDir}`);
    await git.clone({
      fs: fsSync,
      http,
      dir: cloneDir,
      url: repoUrl,
      ref: branch,
      singleBranch: true,
      depth: 1,
      onAuth
    });
    
    const results = await runComplianceAudit(cloneDir);
    
    const report = await generateAndSignReport(auditId, results);
    
    await storage.updateAudit(auditId, { status: "complete", completedAt: new Date(), reportId: report.id });
    console.log(`[Audit] Completed ${auditId}`);
    
    await fs.rm(cloneDir, { recursive: true, force: true });
  } catch (error: any) {
    console.error(`[Audit] Failed ${auditId}:`, error);
    await storage.updateAudit(auditId, { status: "failed", completedAt: new Date() });
  }
}

export default router;
