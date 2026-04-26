import { Router } from "express";
import { storage } from "../storage.js";

const router = Router();

// Get the semantic graph for a specific review
router.get("/:reviewId/graph", async (req, res) => {
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

    const graphs = await storage.getSemanticGraphs(reviewId);
    res.json(graphs);
  } catch (error: any) {
    console.error(`[API] Error fetching semantic graph for review ${req.params.reviewId}:`, error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

// Get taint paths for a specific review
router.get("/:reviewId/paths", async (req, res) => {
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

    const paths = await storage.getTaintPaths(reviewId);
    res.json(paths);
  } catch (error: any) {
    console.error(`[API] Error fetching taint paths for review ${req.params.reviewId}:`, error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
});

export default router;
