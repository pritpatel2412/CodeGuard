import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { db } from "../db.js";
import { policyViolations, repositoryPolicies } from "../../shared/schema.js";
import { storage } from "../storage.js";

const router = Router();

router.get("/violations/:reviewId", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const { reviewId } = req.params;
    const review = await storage.getReview(reviewId);
    if (!review) {
      return res.status(404).json({ error: "Review not found" });
    }

    const repository = await storage.getRepository(review.repositoryId);
    if (!repository || repository.userId !== req.user!.id) {
      return res.status(403).json({ error: "Unauthorized access to review" });
    }

    const violations = await db
      .select()
      .from(policyViolations)
      .where(eq(policyViolations.reviewId, reviewId))
      .orderBy(desc(policyViolations.createdAt));

    return res.json(violations);
  } catch (error) {
    console.error("[Policy API] Failed to fetch policy violations:", error);
    return res.status(500).json({ error: "An internal server error occurred" });
  }
});

router.get("/:repositoryId", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const { repositoryId } = req.params;
    const repository = await storage.getRepository(repositoryId);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }
    if (repository.userId !== req.user!.id) {
      return res.status(403).json({ error: "Unauthorized access to repository" });
    }

    const [policy] = await db
      .select()
      .from(repositoryPolicies)
      .where(eq(repositoryPolicies.repositoryId, repositoryId))
      .limit(1);

    return res.json(policy ?? null);
  } catch (error) {
    console.error("[Policy API] Failed to fetch repository policy:", error);
    return res.status(500).json({ error: "An internal server error occurred" });
  }
});

router.put("/:repositoryId/toggle", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    const { repositoryId } = req.params;
    const { isActive } = req.body as { isActive?: boolean };

    if (typeof isActive !== "boolean") {
      return res.status(400).json({ error: "isActive must be a boolean" });
    }

    const repository = await storage.getRepository(repositoryId);
    if (!repository) {
      return res.status(404).json({ error: "Repository not found" });
    }
    if (repository.userId !== req.user!.id) {
      return res.status(403).json({ error: "Unauthorized access to repository" });
    }

    const [updated] = await db
      .update(repositoryPolicies)
      .set({ isActive, lastSyncedAt: new Date() })
      .where(eq(repositoryPolicies.repositoryId, repositoryId))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Policy not found for repository" });
    }

    return res.json({ success: true, policy: updated });
  } catch (error) {
    console.error("[Policy API] Failed to toggle policy:", error);
    return res.status(500).json({ error: "An internal server error occurred" });
  }
});

export default router;
