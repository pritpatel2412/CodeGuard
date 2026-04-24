import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertRepositorySchema, insertReviewSchema, insertReviewCommentSchema } from "../shared/schema.js";
import { getUncachableGitHubClient, getPullRequestDiff, getPullRequestDetails, postReviewComment, postReview, createBranch, updateFile, createPullRequest, getFileContent } from "./github.js";
import { getMergeRequestDetails, getGitLabFileContent, createGitLabBranch, updateGitLabFile, createMergeRequest, postMergeRequestComment } from "./gitlab.js";
import { analyzeCodeDiff, generateFix } from "./openai.js";

import { z } from "zod";
import crypto from "crypto";
import PDFDocument from "pdfkit";

// Validation schemas for API requests
const createRepositorySchema = z.object({
  owner: z.string().min(1, "Owner is required"),
  name: z.string().min(1, "Repository name is required"),
  platform: z.enum(["github", "gitlab"]).default("github"),
});

const updateRepositorySchema = z.object({
  isActive: z.boolean().optional(),
  webhookSecret: z.string().optional(),
});

// Verify GitHub webhook signature
function verifyWebhookSignature(payload: string, signature: string | undefined, secret: string): boolean {
  if (!signature) {
    return false;
  }

  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ============= REPOSITORIES =============

  // Update user preferences
  app.patch("/api/user", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });

    try {
      // Allow updating preference fields
      const {
        bugDetection,
        securityAnalysis,
        performanceIssues,
        maintainability,
        skipStyleIssues,
        postComments,
        highRiskAlerts,
        autoFixStrictMode,
        autoFixSafetyGuards
      } = req.body;

      const updatedUser = await storage.updateUser(req.user!.id, {
        bugDetection,
        securityAnalysis,
        performanceIssues,
        maintainability,
        skipStyleIssues,
        postComments,
        highRiskAlerts,
        autoFixStrictMode,
        autoFixSafetyGuards
      });

      res.json(updatedUser);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all repositories
  app.get("/api/repositories", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
    try {
      const repos = await storage.getRepositories(req.user!.id);
      res.json(repos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single repository
  app.get("/api/repositories/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
    try {
      const repo = await storage.getRepository(req.params.id);
      if (!repo) {
        return res.status(404).json({ error: "Repository not found" });
      }
      
      // Ownership check
      if (repo.userId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized access to repository" });
      }
      
      res.json(repo);
    } catch (error: any) {
      console.error(`[API] Error fetching repository ${req.params.id}:`, error);
      res.status(500).json({ error: "An internal server error occurred" });
    }
  });

  // Create repository
  app.post("/api/repositories", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
    try {
      // Validate request body
      const parsed = createRepositorySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: parsed.error.errors
        });
      }

      const { owner, name, platform } = parsed.data;
      const fullName = `${owner}/${name}`;

      // Check if already exists
      const existing = await storage.getRepositoryByFullName(fullName);
      if (existing) {
        // If the repository exists but has no user assigned (orphaned), claim it for the current user
        if (!existing.userId) {
          const updated = await storage.updateRepository(existing.id, { userId: req.user!.id });
          return res.status(200).json(updated);
        }

        // If it belongs to the current user, return it (idempotent)
        if (existing.userId === req.user!.id) {
          return res.status(200).json(existing);
        }

        return res.status(400).json({ error: "Repository already connected by another user" });
      }

      const repo = await storage.createRepository({
        name,
        fullName,
        owner,
        platform,
        isActive: true,
        userId: req.user!.id,
      });

      res.status(201).json(repo);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update repository
  app.patch("/api/repositories/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
    try {
      // Validate request body
      const parsed = updateRepositorySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: parsed.error.errors
        });
      }

      const existing = await storage.getRepository(req.params.id);
      if (!existing) {
        return res.status(404).json({ error: "Repository not found" });
      }

      // Ownership check
      if (existing.userId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized access to repository" });
      }

      const repo = await storage.updateRepository(req.params.id, parsed.data);
      res.json(repo);
    } catch (error: any) {
      console.error(`[API] Error updating repository ${req.params.id}:`, error);
      res.status(500).json({ error: "An internal server error occurred" });
    }
  });

  // Delete repository
  app.delete("/api/repositories/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
    try {
      const repo = await storage.getRepository(req.params.id);
      if (!repo) {
        return res.status(404).json({ error: "Repository not found" });
      }

      // Ownership check
      if (repo.userId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized access to repository" });
      }

      await storage.deleteRepository(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      console.error(`[API] Error deleting repository ${req.params.id}:`, error);
      res.status(500).json({ error: "An internal server error occurred" });
    }
  });

  // ============= REVIEWS =============

  // Get all reviews
  app.get("/api/reviews", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
    try {
      const reviews = await storage.getReviews(req.user!.id);
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single review with comments
  app.get("/api/reviews/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
    try {
      const review = await storage.getReview(req.params.id);
      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }

      const repository = await storage.getRepository(review.repositoryId);
      if (!repository || repository.userId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized access to review" });
      }

      const comments = await storage.getReviewComments(review.id);
      res.json({ review, comments, repository });
    } catch (error: any) {
      console.error(`[API] Error fetching review ${req.params.id}:`, error);
      res.status(500).json({ error: "An internal server error occurred" });
    }
  });

  // ============= STATS =============

  app.get("/api/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
    try {
      console.log(`[API] /api/stats hit for user ${req.user!.id} (${(req.user as any).username})`);
      const stats = await storage.getStats(req.user!.id);
      console.log(`[API] returning stats: ${stats.totalReviews} reviews, ${stats.totalComments} comments`);
      res.json(stats);
    } catch (error: any) {
      console.error("[API] /api/stats error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // ============= STATS DOWNLOAD =============
  app.get("/api/stats/download", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });

    try {
      const range = (req.query.range as string) || "24h";

      // Calculate Date Range
      const endDate = new Date();
      const startDate = new Date();

      switch (range) {
        case "24h":
          startDate.setHours(startDate.getHours() - 24);
          break;
        case "7d":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "15d":
          startDate.setDate(startDate.getDate() - 15);
          break;
        case "30d":
        case "1m":
          startDate.setDate(startDate.getDate() - 30);
          break;
        default:
          // Default to 24h if invalid
          startDate.setHours(startDate.getHours() - 24);
      }

      const stats = await storage.getStats(req.user!.id, startDate, endDate);

      const safeStats = {
        totalReviews: stats.totalReviews || 0,
        totalComments: stats.totalComments || 0,
        avgCommentsPerReview: stats.avgCommentsPerReview || 0,
        riskDistribution: {
          low: stats.riskDistribution?.low || 0,
          medium: stats.riskDistribution?.medium || 0,
          high: stats.riskDistribution?.high || 0,
        },
        recentActivity: Array.isArray(stats.recentActivity) ? stats.recentActivity : [],
      };

      // ── Security Health Score (premium touch) ──
      const totalRisks = Object.values(safeStats.riskDistribution).reduce((a, b) => a + b, 0);
      let securityScore = 95;
      if (totalRisks > 0) {
        const highWeight = safeStats.riskDistribution.high * 0.6;
        const medWeight = safeStats.riskDistribution.medium * 0.25;
        securityScore = Math.round(100 * (1 - (highWeight + medWeight) / totalRisks));
        securityScore = Math.max(55, securityScore);
      }

      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => {
        const result = Buffer.concat(chunks);
        res.status(200)
          .setHeader("Content-Type", "application/pdf")
          .setHeader("Content-Disposition", `attachment; filename=CodeGuard_Report_${range}.pdf`)
          .setHeader("Content-Length", result.length)
          .send(result);
      });

      doc.on("error", (err) => {
        console.error("PDF error:", err);
        if (!res.headersSent) res.status(500).json({ error: "Failed to generate PDF" });
      });

      // ── Premium Color Palette ──
      const colors = {
        primary: "#6366f1",
        primaryDark: "#4338ca",
        success: "#22c55e",
        warning: "#eab308",
        danger: "#ef4444",
        text: "#1e293b",
        textLight: "#64748b",
        bgLight: "#f8fafc",
        border: "#e2e8f0",
      };

      // Header gradient
      const headerGrad = doc.linearGradient(0, 0, doc.page.width, 140);
      headerGrad.stop(0, colors.primary);
      headerGrad.stop(1, colors.primaryDark);
      doc.rect(0, 0, doc.page.width, 140).fill(headerGrad);

      // Logo + Title
      doc.fillColor("#ffffff")
        .fontSize(32)
        .font("Helvetica-Bold")
        .text("CodeGuard", 50, 48);

      doc.fontSize(14)
        .font("Helvetica")
        .text("AI-Powered Code Security & Quality Report", 50, 82);

      // Date badge
      const reportDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const badgeW = 168;
      doc.roundedRect(doc.page.width - 50 - badgeW, 46, badgeW, 34, 17)
        .fill("rgba(255,255,255,0.18)");
      doc.fillColor("#ffffff")
        .fontSize(11)
        .text(reportDate, doc.page.width - 50 - badgeW, 55, { width: badgeW, align: "center" });

      doc.y = 170;

      // ── Performance Overview ──
      doc.fillColor(colors.text)
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("Performance Overview", 50, doc.y);

      doc.moveDown(0.6);
      doc.fillColor(colors.textLight)
        .fontSize(10.5)
        .font("Helvetica")
        .text(
          `Summary of code quality and security insights from the past ${range === "24h" ? "24 hours" : range}.`,
          50,
          doc.y
        );

      doc.moveDown(3.5);
      const cardY = doc.y;
      const cardWidth = 170;
      const cardGap = 35;
      const cardHeight = 92;

      // Enhanced card with shadow + accent bar
      const drawCard = (
        x: number,
        y: number,
        title: string,
        value: string | number,
        accent: string
      ) => {
        // Shadow
        doc.roundedRect(x + 4, y + 4, cardWidth, cardHeight, 10)
          .fill("#cbd5e1")
          .opacity(0.5);
        doc.opacity(1);

        // Card
        doc.roundedRect(x, y, cardWidth, cardHeight, 10)
          .fill(colors.bgLight)
          .stroke(colors.border);

        // Accent bar
        doc.rect(x + 6, y + 10, 7, cardHeight - 22).fill(accent);

        // Title
        doc.fillColor(colors.textLight)
          .fontSize(9.8)
          .text(title.toUpperCase(), x + 24, y + 18);

        // Value
        doc.fillColor(colors.text)
          .fontSize(27)
          .font("Helvetica-Bold")
          .text(String(value), x + 24, y + 42);
      };

      // Row 1
      drawCard(50, cardY, "Total Reviews", safeStats.totalReviews, colors.primary);
      drawCard(50 + cardWidth + cardGap, cardY, "Issues Detected", safeStats.totalComments, colors.danger);

      // Row 2
      const row2Y = cardY + cardHeight + 22;
      drawCard(50, row2Y, "Avg Issues / Review", safeStats.avgCommentsPerReview.toFixed(1), colors.success);
      drawCard(
        50 + cardWidth + cardGap,
        row2Y,
        "Security Score",
        `${securityScore}%`,
        securityScore >= 85 ? colors.success : securityScore >= 70 ? colors.warning : colors.danger
      );

      doc.y = row2Y + cardHeight + 30;

      // ── Risk Distribution ──
      doc.fillColor(colors.text)
        .fontSize(19)
        .font("Helvetica-Bold")
        .text("Risk Distribution", 50, doc.y);

      doc.moveDown(1.2);

      if (totalRisks === 0) {
        doc.fillColor(colors.success)
          .fontSize(13)
          .text("✅ No security risks detected in this period. Excellent work!", 50, doc.y);
        doc.moveDown(3);
      } else {
        const barX = 50;
        const barYStart = doc.y;
        const barW = 430;
        const barH = 26;
        let currentY = barYStart;

        const riskItems = [
          { label: "High Risk", color: colors.danger, count: safeStats.riskDistribution.high },
          { label: "Medium Risk", color: colors.warning, count: safeStats.riskDistribution.medium },
          { label: "Low Risk", color: colors.success, count: safeStats.riskDistribution.low },
        ];

        riskItems.forEach((item) => {
          const pct = Math.round((item.count / totalRisks) * 100) || 0;

          // Label
          doc.fillColor(colors.text)
            .fontSize(11.5)
            .text(item.label, barX, currentY + 7);

          // Background bar
          doc.roundedRect(barX + 115, currentY + 4, barW, barH, 6)
            .fill(colors.bgLight)
            .stroke(colors.border);

          // Filled bar
          if (item.count > 0) {
            const fillWidth = Math.max(8, barW * (item.count / totalRisks));
            doc.roundedRect(barX + 115, currentY + 4, fillWidth, barH, 6).fill(item.color);
          }

          // Percentage + count
          doc.fillColor(colors.text)
            .fontSize(11.5)
            .text(`${pct}%`, barX + 115 + barW + 18, currentY + 7);

          doc.fillColor(colors.textLight)
            .fontSize(10)
            .text(`${item.count} issues`, barX + 115 + barW + 72, currentY + 7);

          currentY += barH + 18;
        });

        doc.y = currentY + 12;
      }

      // Legend (always shown)
      const legendY = doc.y;
      const drawLegend = (x: number, color: string, label: string, count: number) => {
        const pct = totalRisks > 0 ? Math.round((count / totalRisks) * 100) : 0;
        doc.circle(x, legendY + 6, 5.5).fill(color);
        doc.fillColor(colors.text)
          .fontSize(10.5)
          .text(label, x + 18, legendY + 3);
        doc.fillColor(colors.textLight)
          .fontSize(9.8)
          .text(`${count} issues • ${pct}%`, x + 18, legendY + 16);
      };

      drawLegend(50, colors.danger, "High Risk", safeStats.riskDistribution.high);
      drawLegend(225, colors.warning, "Medium Risk", safeStats.riskDistribution.medium);
      drawLegend(400, colors.success, "Low Risk", safeStats.riskDistribution.low);

      doc.y = legendY + 55;

      // ── Recent Activity Table ──
      doc.fillColor(colors.text)
        .fontSize(19)
        .font("Helvetica-Bold")
        .text("Recent Activity", 50, doc.y);

      doc.moveDown(1.2);

      const tableTop = doc.y;
      const rowHeight = 36;
      const tableWidth = 510;

      // Table header
      doc.rect(50, tableTop, tableWidth, 32)
        .fill(colors.bgLight)
        .stroke(colors.border);

      doc.fillColor(colors.textLight)
        .fontSize(9.5)
        .text("DATE", 68, tableTop + 11)
        .text("ACTIVITY", 245, tableTop + 11)
        .text("STATUS", 450, tableTop + 11);

      let currentRowY = tableTop + 32;
      const activityData = safeStats.recentActivity.slice(0, 10);

      activityData.forEach((activity, i) => {
        const isEven = i % 2 === 0;

        if (!isEven) {
          doc.rect(50, currentRowY, tableWidth, rowHeight).fill("#f8fafc");
        }

        const isZero = activity.count === 0;

        doc.fillColor(colors.text)
          .fontSize(10.2)
          .text(activity.date, 68, currentRowY + 12)
          .text(`${activity.count} Reviews performed`, 245, currentRowY + 12);

        // Status badge
        const badgeColor = isZero ? "#f1f5f9" : "#dcfce7";
        const textColor = isZero ? "#64748b" : "#166534";
        const badgeText = isZero ? "Quiet" : "Active";

        doc.roundedRect(445, currentRowY + 8.5, 72, 19, 9.5)
          .fill(badgeColor);

        doc.fillColor(textColor)
          .fontSize(8.2)
          .text(badgeText, 445, currentRowY + 12.5, { width: 72, align: "center" });

        // Row divider
        doc.moveTo(50, currentRowY + rowHeight)
          .lineTo(560, currentRowY + rowHeight)
          .lineWidth(0.8)
          .stroke(colors.border);

        currentRowY += rowHeight;
      });

      if (activityData.length === 0) {
        doc.fillColor(colors.textLight)
          .fontSize(10.5)
          .text("No recent activity recorded yet.", 68, currentRowY + 12);
      }

      // Vertical column lines
      doc.moveTo(240, tableTop).lineTo(240, currentRowY).stroke(colors.border);
      doc.moveTo(440, tableTop).lineTo(440, currentRowY).stroke(colors.border);

      // Footer
      const footerY = doc.page.height - 52;
      doc.moveTo(50, footerY - 18)
        .lineTo(560, footerY - 18)
        .lineWidth(1)
        .stroke(colors.border);

      doc.fillColor(colors.textLight)
        .fontSize(8.2)
        .text("© 2026 CodeGuard • Confidential AI Security Report", 50, footerY);

      doc.text("Generated with ❤️ by CodeGuard AI", 380, footerY, { align: "right" });

      doc.end();
    } catch (error: any) {
      console.error("PDF Generation error:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // ============= WEBHOOKS =============

  // GitHub webhook endpoint
  app.post("/api/webhooks/github/:repositoryId", async (req, res) => {
    try {
      const { repositoryId } = req.params;
      const event = req.headers["x-github-event"] as string;
      const signature = req.headers["x-hub-signature-256"] as string | undefined;
      const payload = req.body;

      // Get the repository from our database
      const repo = await storage.getRepository(repositoryId);
      if (!repo) {
        return res.status(404).json({ error: "Repository not found" });
      }

      // Get raw body for signature verification
      // req.rawBody is set by express.json() middleware verify function
      // Type assertion needed because rawBody is added via module augmentation in server/index.ts
      const rawBodyBuffer = (req as any).rawBody as Buffer | undefined;
      const rawBody = rawBodyBuffer
        ? rawBodyBuffer.toString('utf8')
        : JSON.stringify(payload);

      // Verify webhook signature if secret is configured
      if (repo.webhookSecret) {
        const isValid = verifyWebhookSignature(rawBody, signature, repo.webhookSecret);
        if (!isValid) {
          console.error("Invalid webhook signature for repository:", repositoryId);
          console.error("Expected signature format: sha256=...");
          console.error("Received signature:", signature);
          return res.status(401).json({ error: "Invalid webhook signature" });
        }
      }

      // Handle ping event (GitHub sends this when webhook is first created)
      if (event === "ping") {
        return res.status(200).json({
          message: "Webhook configured successfully",
          repository: repo.fullName
        });
      }

      // Only handle pull request events
      if (event !== "pull_request") {
        return res.status(200).json({ message: "Event ignored" });
      }

      // Validate payload structure
      if (!payload.action || !payload.pull_request || !payload.repository) {
        return res.status(400).json({ error: "Invalid payload structure" });
      }

      // Only handle opened, synchronize, reopened actions
      const { action, pull_request, repository } = payload;
      if (!["opened", "synchronize", "reopened"].includes(action)) {
        return res.status(200).json({ message: "Action ignored" });
      }

      if (!repo.isActive) {
        return res.status(200).json({ message: "Repository is inactive" });
      }

      // Validate required fields from payload
      if (!pull_request.number || !pull_request.title || !pull_request.html_url) {
        return res.status(400).json({ error: "Missing required PR fields" });
      }

      const prNumber = pull_request.number;
      const prTitle = pull_request.title;
      const prUrl = pull_request.html_url;
      const author = pull_request.user?.login || "unknown";
      const authorAvatar = pull_request.user?.avatar_url || null;
      const additions = pull_request.additions || 0;
      const deletions = pull_request.deletions || 0;
      const changedFiles = pull_request.changed_files || 0;
      const headSha = pull_request.head?.sha;
      const owner = repository.owner?.login;
      const repoName = repository.name;

      if (!owner || !repoName || !headSha) {
        return res.status(400).json({ error: "Missing repository or commit info" });
      }

      // Check if we already have a review for this PR
      let review = await storage.getReviewByPR(repositoryId, prNumber);

      if (review && action === "synchronize") {
        // Update existing review status to pending for re-analysis
        await storage.updateReview(review.id, { status: "pending" });
      } else if (!review) {
        // Create a new review
        review = await storage.createReview({
          repositoryId,
          prNumber,
          prTitle,
          prUrl,
          author,
          authorAvatar,
          riskLevel: "low",
          status: "pending",
          commentCount: 0,
          filesChanged: changedFiles,
          additions,
          deletions,
        });
      }

      // Get the PR diff
      let diff: string;
      try {
        diff = await getPullRequestDiff(owner, repoName, prNumber);
      } catch (error: any) {
        console.error("Failed to get PR diff:", error.message);
        await storage.updateReview(review.id, {
          status: "failed",
          summary: "Failed to fetch PR diff: " + error.message
        });
        return res.status(200).json({ message: "Failed to fetch diff" });
      }

      // Analyze the diff with OpenAI
      let analysis;
      try {
        analysis = await analyzeCodeDiff(diff, prTitle);
      } catch (error: any) {
        console.error("OpenAI analysis failed:", error.message);
        await storage.updateReview(review.id, {
          status: "failed",
          summary: "AI analysis failed: " + error.message
        });
        return res.status(200).json({ message: "AI analysis failed" });
      }

      // Update the review with analysis results
      await storage.updateReview(review.id, {
        summary: analysis.summary,
        riskLevel: analysis.risk_level,
        status: "completed",
        commentCount: analysis.comments.length,
        completedAt: new Date(),
      });

      // Save comments and post them to GitHub in parallel
      const typeEmoji: Record<string, string> = {
        bug: "Bug",
        security: "Security",
        performance: "Performance",
        readability: "Readability",
        maintainability: "Maintainability",
      };

      await Promise.all(analysis.comments.map(async (comment) => {
        const savedComment = await storage.createReviewComment({
          reviewId: review!.id,
          path: comment.path,
          line: comment.line,
          type: comment.type,
          comment: comment.comment,
          severity: analysis.risk_level === "high" ? "high" : analysis.risk_level === "medium" ? "medium" : "low",
          isPosted: false,
        });

        // Try to post the comment to GitHub
        try {
          const commentBody = `**[${typeEmoji[comment.type] || comment.type}]** ${comment.comment}`;

          await postReviewComment(
            owner,
            repoName,
            prNumber,
            headSha,
            comment.path,
            comment.line,
            commentBody
          );

          await storage.updateReviewComment(savedComment.id, { isPosted: true });
        } catch (error: any) {
          console.error(`Failed to post comment on ${comment.path}:${comment.line}:`, error.message);
        }
      }));

      // Post a summary review
      if (analysis.comments.length > 0) {
        const riskEmoji: Record<string, string> = {
          low: "Low Risk",
          medium: "Medium Risk",
          high: "High Risk",
        };

        const commentsByType = analysis.comments.reduce((acc, c) => {
          acc[c.type] = (acc[c.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const summaryBody = `# 🤖 CodeGuard AI Agent — Code Review Summary

**Overall Risk Level:** ${riskEmoji[analysis.risk_level] || analysis.risk_level}

---

### 📌 Executive Summary
${analysis.summary}

---

### 🧩 Findings Overview
**Total Issues Detected:** ${analysis.comments.length}

${Object.entries(commentsByType)
            .map(([type, count]) => `- **${type}**: ${count}`)
            .join('\n')}

---

### 🛡️ About CodeGuard AI Agent
This review was automatically generated by **CodeGuard AI Agent**, your intelligent code quality and security assistant.  
It analyzes your changes for potential bugs, security risks, performance issues, and maintainability concerns—helping you ship safer, cleaner, and more reliable code with confidence.

---

*Generated by CodeGuard AI Agent • Intelligent Code Review System*
`;


        try {
          await postReview(owner, repoName, prNumber, summaryBody, "COMMENT");
        } catch (error: any) {
          console.error("Failed to post review summary:", error.message);
        }
      }

      res.status(200).json({
        message: "Review completed",
        reviewId: review.id,
        riskLevel: analysis.risk_level,
        commentsCount: analysis.comments.length,
      });

    } catch (error: any) {
      console.error("Webhook error:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // GitLab webhook endpoint (placeholder for future implementation)
  app.post("/api/webhooks/gitlab/:repositoryId", async (req, res) => {
    res.status(501).json({
      error: "GitLab webhook support coming soon",
      message: "This endpoint is reserved for GitLab merge request webhooks"
    });
  });

  // Apply AI Fix
  app.post("/api/reviews/:reviewId/comments/:commentId/fix", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });

    try {
      const { reviewId, commentId } = req.params;

      const comment = await storage.getReviewComment(commentId);
      if (!comment || comment.reviewId !== reviewId) {
        return res.status(404).json({ error: "Comment not found" });
      }

      const review = await storage.getReview(reviewId);
      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }

      const repo = await storage.getRepository(review.repositoryId);
      if (!repo) {
        return res.status(404).json({ error: "Repository not found" });
      }

      // Check current user owns the repo connection
      if (repo.userId !== req.user!.id) {
        return res.status(403).json({ error: "Unauthorized access to repository" });
      }

      // 1. Safety Guards (User Spec)
      const restrictedTerms = ['auth', 'login', 'payment', 'billing', '.env', 'config'];
      if (restrictedTerms.some(term => comment.path.toLowerCase().includes(term))) {
        return res.status(400).json({
          error: "Safety Block: Cannot automatically fix sensitive files (Auth/Payment/Config). Manual review required."
        });
      }

      // 2. Determine Platform and Get Context
      let headSha: string;
      let baseBranch: string;
      let fileContent: string;
      let targetPlatform = repo.platform;
      const accessToken = (req.user as any).accessToken;

      // Smart Fallback Logic:
      // If configured for specific platform, try it.
      // If it fails with 404 (Not Found), try the other platform.
      // If the other platform succeeds, update the DB to reflect the correct platform.

      try {
        if (targetPlatform === "gitlab") {
          const mrDetails = await getMergeRequestDetails(repo.owner, repo.name, review.prNumber);
          headSha = mrDetails.sha;
          baseBranch = mrDetails.source_branch;
          fileContent = await getGitLabFileContent(repo.owner, repo.name, comment.path, headSha);
        } else {
          // GitHub Enforced
          const prDetails = await getPullRequestDetails(repo.owner, repo.name, review.prNumber);
          headSha = prDetails.head.sha;
          baseBranch = prDetails.head.ref;
          fileContent = await getFileContent(repo.owner, repo.name, comment.path, headSha, accessToken);
        }
      } catch (initialError: any) {
        console.log(`Failed to fetch details from ${targetPlatform}: ${initialError.message}`);

        // Only try fallback if it was a 404 Not Found
        if (initialError.message.includes("Not Found") || initialError.status === 404) {
          const fallbackPlatform = targetPlatform === "github" ? "gitlab" : "github"; // Actually unlikely to fallback to GitHub if user selected GitLab, but good for robustness
          console.log(`Attempting fallback to ${fallbackPlatform}...`);

          try {
            if (fallbackPlatform === "gitlab") {
              const mrDetails = await getMergeRequestDetails(repo.owner, repo.name, review.prNumber);
              headSha = mrDetails.sha;
              baseBranch = mrDetails.source_branch;
              fileContent = await getGitLabFileContent(repo.owner, repo.name, comment.path, headSha);

              // Success! Update DB
              targetPlatform = "gitlab";
              await storage.updateRepository(repo.id, { platform: "gitlab" });
              console.log(`Successfully auto-corrected repository platform to GitLab for ${repo.fullName}`);
            } else {
              const prDetails = await getPullRequestDetails(repo.owner, repo.name, review.prNumber);
              headSha = prDetails.head.sha;
              baseBranch = prDetails.head.ref;
              fileContent = await getFileContent(repo.owner, repo.name, comment.path, headSha, accessToken);

              // Success! Update DB
              targetPlatform = "github";
              await storage.updateRepository(repo.id, { platform: "github" });
              console.log(`Successfully auto-corrected repository platform to GitHub for ${repo.fullName}`);
            }
          } catch (fallbackError) {
            // Both failed, throw the original error or a combined one
            throw new Error(`Failed to access repository on both GitHub and GitLab. Please check your repository settings. Original error: ${initialError.message}`);
          }
        } else {
          throw initialError;
        }
      }

      // 4. Generate Fix (OpenAI - "Senior App Sec Engineer" persona)
      const fixedContent = await generateFix(fileContent, comment.comment, comment.line);

      // 5. Validation (User Spec)
      if (!fixedContent || fixedContent.trim().length === 0) {
        throw new Error("AI returned empty content");
      }
      if (fixedContent.includes("rm -rf") || fixedContent.includes("sudo ")) {
        throw new Error("Safety Block: AI generated potentially dangerous command");
      }

      // 6. Create new branch with specific naming convention
      // Convention: refs/heads/security-fix-pr-{prNumber}-{random} to avoid collisions
      const fixBranchName = `security-fix-${review.prNumber}-${crypto.randomBytes(3).toString('hex')}`;

      let prUrl: string;
      let prNumber: number;

      if (targetPlatform === "gitlab") {
        await createGitLabBranch(repo.owner, repo.name, fixBranchName, headSha);

        // 7. Commit fixed file
        await updateGitLabFile(
          repo.owner,
          repo.name,
          comment.path,
          fixedContent,
          `Security fix: resolve issue at ${comment.path}`,
          fixBranchName
        );

        // 8. Create MR
        const newMr = await createMergeRequest(
          repo.owner,
          repo.name,
          `🔒 Security Fix for High-Risk Issues (MR #${review.prNumber})`,
          `
This MR was generated by **CodeGuard AI** to fix high-risk security issues found in the original merge request.

Fixes:
- Removed hardcoded secrets
- Refactored insecure logic
- Followed security best practices

Original MR: #${review.prNumber}
`,
          fixBranchName,
          baseBranch
        );

        prUrl = newMr.web_url;
        prNumber = newMr.iid;

        // 9. Comment on Original MR
        try {
          await postMergeRequestComment(
            repo.owner,
            repo.name,
            review.prNumber,
            headSha,
            comment.path,
            comment.line,
            `🚨 **High-risk security issue detected.**\n\nA security-fix MR has been created:\n➡️ ${prUrl}\n\nPlease review and merge the fix.`
          );
        } catch (commentError: any) {
          console.error("Failed to post link on original MR:", commentError.message);
        }

      } else {
        // GitHub Flow
        await createBranch(repo.owner, repo.name, fixBranchName, headSha, accessToken);

        // 7. Commit fixed file
        await updateFile(
          repo.owner,
          repo.name,
          comment.path,
          fixedContent,
          `Security fix: resolve issue at ${comment.path}`,
          fixBranchName,
          undefined, // Let functionality fetch the correct file (blob) SHA
          accessToken
        );

        // 8. Create PR targeting the original PR's branch
        const newPr = await createPullRequest(
          repo.owner,
          repo.name,
          `🔒 Security Fix for High-Risk Issues (PR #${review.prNumber})`,
          `
This PR was generated by **CodeGuard AI** to fix high-risk security issues found in the original pull request.

Fixes:
- Removed hardcoded secrets
- Refactored insecure logic
- Followed security best practices

Original PR: #${review.prNumber}
`,
          fixBranchName,
          baseBranch,
          accessToken
        );

        prUrl = newPr.html_url;
        prNumber = newPr.number;

        // 9. Comment on Original PR
        try {
          await postReviewComment(
            repo.owner,
            repo.name,
            review.prNumber,
            headSha,
            comment.path,
            comment.line,
            `🚨 **High-risk security issue detected.**\n\nA security-fix PR has been created:\n➡️ #${newPr.number}\n\nPlease review and merge the fix.`
          );
        } catch (commentError: any) {
          console.error("Failed to post link on original PR:", commentError.message);
        }
      }

      res.status(200).json({
        message: "Fix PR created successfully",
        prUrl: prUrl,
        prNumber: prNumber
      });

    } catch (error: any) {
      console.error("Failed to apply fix:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Test GitHub Auth
  app.get("/api/test-github-auth", async (req, res) => {
    try {
      const octokit = await getUncachableGitHubClient();
      const { data } = await octokit.users.getAuthenticated();
      res.json(data);
    } catch (error: any) {
      console.error("Test auth failed:", error);
      res.status(401).json({ error: error.message });
    }
  });

  // Visitor Counter Heartbeat
  app.post("/api/visitors/heartbeat", async (req, res) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId || typeof sessionId !== "string") {
        return res.status(400).json({ message: "Session ID required" });
      }

      const count = await storage.recordVisitor(sessionId);
      res.json({ count });
    } catch (error) {
      console.error("Visitor heartbeat error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}