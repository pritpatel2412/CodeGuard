import { Router } from "express";
import { storage } from "../storage.js";
import { z } from "zod";

const router = Router();

const createOrderSchema = z.object({
  auditId: z.string().uuid(),
  tierId: z.string(),
  priceUsd: z.number().int().nonnegative()
});

// Create a new order
router.post("/", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
  
  try {
    const parsed = createOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.errors });
    }
    
    // Make sure audit exists and belongs to user
    const audit = await storage.getAudit(parsed.data.auditId);
    if (!audit) return res.status(404).json({ error: "Audit not found" });
    if (audit.userId !== req.user!.id) return res.status(403).json({ error: "Unauthorized" });

    // Ensure we don't have an order for this audit already
    const existingOrder = await storage.getAuditOrderByAuditId(audit.id);
    if (existingOrder) {
      return res.status(409).json({ error: "Order already exists for this audit" });
    }

    const order = await storage.createAuditOrder({
      auditId: parsed.data.auditId,
      userId: req.user!.id,
      tierId: parsed.data.tierId,
      priceUsd: parsed.data.priceUsd,
      status: "pending_payment"
    });
    
    res.status(201).json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get all orders
router.get("/admin", async (req, res) => {
  // In a real app, verify admin role here
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
  // if (req.user!.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  
  try {
    const orders = await storage.getAllAuditOrders();
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Update order status
router.post("/admin/:id/status", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
  
  try {
    const { status } = req.body;
    if (!["pending_payment", "marked_paid_manually", "comped"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    const updated = await storage.updateAuditOrder(req.params.id, { status });
    if (!updated) return res.status(404).json({ error: "Order not found" });
    
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get order for a specific audit
router.get("/audit/:auditId", async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
  
  try {
    const audit = await storage.getAudit(req.params.auditId);
    if (!audit) return res.status(404).json({ error: "Audit not found" });
    if (audit.userId !== req.user!.id) return res.status(403).json({ error: "Unauthorized" });

    const order = await storage.getAuditOrderByAuditId(audit.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
