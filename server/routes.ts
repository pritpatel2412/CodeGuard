import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRepositorySchema, insertReviewSchema, insertReviewCommentSchema } from "@shared/schema";
import { getPullRequestDiff, getPullRequestDetails, postReviewComment, postReview } from "./github";
import { analyzeCodeDiff } from "./openai";
import { z } from "zod";
import crypto from "crypto";

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
  
  // Get all repositories
  app.get("/api/repositories", async (req, res) => {
    try {
      const repos = await storage.getRepositories();
      res.json(repos);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single repository
  app.get("/api/repositories/:id", async (req, res) => {
    try {
      const repo = await storage.getRepository(req.params.id);
      if (!repo) {
        return res.status(404).json({ error: "Repository not found" });
      }
      res.json(repo);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create repository
  app.post("/api/repositories", async (req, res) => {
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
        return res.status(400).json({ error: "Repository already connected" });
      }

      const repo = await storage.createRepository({
        name,
        fullName,
        owner,
        platform,
        isActive: true,
      });
      
      res.status(201).json(repo);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update repository
  app.patch("/api/repositories/:id", async (req, res) => {
    try {
      // Validate request body
      const parsed = updateRepositorySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Validation failed", 
          details: parsed.error.errors 
        });
      }
      
      const repo = await storage.updateRepository(req.params.id, parsed.data);
      if (!repo) {
        return res.status(404).json({ error: "Repository not found" });
      }
      res.json(repo);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete repository
  app.delete("/api/repositories/:id", async (req, res) => {
    try {
      const repo = await storage.getRepository(req.params.id);
      if (!repo) {
        return res.status(404).json({ error: "Repository not found" });
      }
      await storage.deleteRepository(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============= REVIEWS =============

  // Get all reviews
  app.get("/api/reviews", async (req, res) => {
    try {
      const reviews = await storage.getReviews();
      res.json(reviews);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single review with comments
  app.get("/api/reviews/:id", async (req, res) => {
    try {
      const review = await storage.getReview(req.params.id);
      if (!review) {
        return res.status(404).json({ error: "Review not found" });
      }
      
      const comments = await storage.getReviewComments(review.id);
      const repository = await storage.getRepository(review.repositoryId);
      
      res.json({ review, comments, repository });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============= STATS =============

  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
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

      // Verify webhook signature if secret is configured
      if (repo.webhookSecret) {
        const rawBody = JSON.stringify(payload);
        const isValid = verifyWebhookSignature(rawBody, signature, repo.webhookSecret);
        if (!isValid) {
          console.error("Invalid webhook signature for repository:", repositoryId);
          return res.status(401).json({ error: "Invalid webhook signature" });
        }
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

      // Save comments and post them to GitHub
      for (const comment of analysis.comments) {
        const savedComment = await storage.createReviewComment({
          reviewId: review.id,
          path: comment.path,
          line: comment.line,
          type: comment.type,
          comment: comment.comment,
          severity: analysis.risk_level === "high" ? "high" : analysis.risk_level === "medium" ? "medium" : "low",
          isPosted: false,
        });

        // Try to post the comment to GitHub
        try {
          const typeEmoji: Record<string, string> = {
            bug: "Bug",
            security: "Security",
            performance: "Performance",
            readability: "Readability",
            maintainability: "Maintainability",
          };
          
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
          console.error("Failed to post comment:", error.message);
        }
      }

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

        const summaryBody = `## AI Code Review Summary

**Risk Level:** ${riskEmoji[analysis.risk_level] || analysis.risk_level}

${analysis.summary}

**Issues Found:** ${analysis.comments.length}
${Object.entries(commentsByType).map(([type, count]) => `- ${type}: ${count}`).join('\n')}

---
*Powered by AI PR Reviewer*`;

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

  return httpServer;
}
