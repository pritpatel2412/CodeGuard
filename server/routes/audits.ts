import { Router } from "express";
import { storage } from "../storage.js";
import { runComplianceAudit } from "../compliance/orchestrator.js";
import { generateAndSignReport } from "../compliance/report-generator.js";
import simpleGit from "simple-git";
import path from "path";
import fs from "fs/promises";
import { z } from "zod";

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
    
    runAuditAsync(audit.id, repositoryUrl, branch).catch(console.error);
    
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

async function runAuditAsync(auditId: string, repoUrl: string, branch: string) {
  const cloneDir = path.join(process.cwd(), ".local", "audits", auditId);
  
  try {
    await storage.updateAudit(auditId, { status: "running" });
    
    await fs.mkdir(cloneDir, { recursive: true });
    
    const git = simpleGit();
    console.log(`[Audit] Cloning ${repoUrl}#${branch} to ${cloneDir}`);
    await git.clone(repoUrl, cloneDir, ["--branch", branch, "--depth", "1", "--single-branch"]);
    
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
