import { Router } from "express";
import { db } from "../db.js";
import { users, audits, requestLogs, apiUsageLog, adminActionLog, auditOrders } from "../../shared/schema.js";
import { desc, sql, eq } from "drizzle-orm";

const router = Router();

// Middleware to protect all admin routes
router.use((req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  if (req.user!.role !== "admin") {
    return res.status(403).json({ error: "Forbidden: Admin access required" });
  }
  next();
});

// Helper to log admin actions
async function logAdminAction(adminUserId: string, actionType: string, targetId: string | null = null, beforeState: any = null, afterState: any = null) {
  await db.insert(adminActionLog).values({
    adminUserId,
    actionType,
    targetId,
    beforeState,
    afterState,
  });
}

router.get("/overview", async (req, res) => {
  try {
    const [{ count: totalUsers }] = await db.select({ count: sql<number>`count(*)` }).from(users);
    const [{ count: totalAudits }] = await db.select({ count: sql<number>`count(*)` }).from(audits);
    const [{ count: totalOrders }] = await db.select({ count: sql<number>`count(*)` }).from(auditOrders);
    
    // Calculate total API cost
    const [{ totalCost }] = await db.select({ totalCost: sql<number>`sum(CAST(cost_usd AS float))` }).from(apiUsageLog);

    const rangeParam = req.query.range as string || "7d";
    const startDate = new Date();
    let daysToInit = 7;
    if (rangeParam === "all") {
      startDate.setFullYear(2020); // effectively all time
      daysToInit = 30; // limit chart to 30 days or dynamic
    } else if (rangeParam === "30d") {
      startDate.setDate(startDate.getDate() - 30);
      daysToInit = 30;
    } else if (rangeParam === "15d") {
      startDate.setDate(startDate.getDate() - 15);
      daysToInit = 15;
    } else { // 7d
      startDate.setDate(startDate.getDate() - 7);
      daysToInit = 7;
    }

    const recentOrders = await db.select({ createdAt: auditOrders.createdAt }).from(auditOrders).where(sql`${auditOrders.createdAt} >= ${startDate}`);
    const recentUsers = await db.select({ createdAt: users.createdAt }).from(users).where(sql`${users.createdAt} >= ${startDate}`);

    const growthMap: Record<string, { date: string; users: number; orders: number }> = {};
    
    // Initialize days
    if (rangeParam !== "all") {
      for (let i = daysToInit - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        growthMap[dateStr] = { date: dateStr, users: 0, orders: 0 };
      }
    }

    recentOrders.forEach(o => {
      if (!o.createdAt) return;
      const dateStr = o.createdAt.toISOString().split('T')[0];
      if (!growthMap[dateStr]) growthMap[dateStr] = { date: dateStr, users: 0, orders: 0 };
      growthMap[dateStr].orders++;
    });

    recentUsers.forEach(u => {
      if (!u.createdAt) return;
      const dateStr = u.createdAt.toISOString().split('T')[0];
      if (!growthMap[dateStr]) growthMap[dateStr] = { date: dateStr, users: 0, orders: 0 };
      growthMap[dateStr].users++;
    });

    const growthMetrics = Object.values(growthMap).sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      totalUsers: Number(totalUsers),
      totalAudits: Number(totalAudits),
      totalOrders: Number(totalOrders),
      totalApiCost: Number(totalCost || 0).toFixed(2),
      growthMetrics,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      username: users.username,
      githubId: users.githubId,
      role: users.role,
    }).from(users).limit(100);
    
    res.json(allUsers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/orders", async (req, res) => {
  try {
    const orders = await db
      .select({
        id: auditOrders.id,
        auditId: auditOrders.auditId,
        tierId: auditOrders.tierId,
        priceUsd: auditOrders.priceUsd,
        status: auditOrders.status,
        createdAt: auditOrders.createdAt,
        updatedAt: auditOrders.updatedAt,
        username: users.username,
        repositoryUrl: audits.repositoryUrl,
      })
      .from(auditOrders)
      .leftJoin(users, eq(auditOrders.userId, users.id))
      .leftJoin(audits, eq(auditOrders.auditId, audits.id))
      .orderBy(desc(auditOrders.createdAt))
      .limit(100);
      
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/orders/:id/status", async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    
    if (status !== "pending_payment" && status !== "marked_paid_manually" && status !== "comped") {
      return res.status(400).json({ error: "Invalid status" });
    }

    const [targetOrder] = await db.select().from(auditOrders).where(eq(auditOrders.id, orderId));
    if (!targetOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    await db.update(auditOrders).set({ status, updatedAt: new Date() }).where(eq(auditOrders.id, orderId));

    await logAdminAction(
      req.user!.id,
      "CHANGE_ORDER_STATUS",
      orderId,
      { status: targetOrder.status },
      { status }
    );

    res.json({ success: true, status });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/users/:id/role", async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const { role } = req.body;
    
    if (role !== "admin" && role !== "user") {
      return res.status(400).json({ error: "Invalid role" });
    }

    const [targetUser] = await db.select().from(users).where(eq(users.id, targetUserId));
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    await db.update(users).set({ role }).where(eq(users.id, targetUserId));

    await logAdminAction(
      req.user!.id,
      "CHANGE_USER_ROLE",
      targetUserId,
      { role: targetUser.role },
      { role }
    );

    res.json({ success: true, role });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/requests", async (req, res) => {
  try {
    const logs = await db.select().from(requestLogs).orderBy(desc(requestLogs.timestamp)).limit(100);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/system", async (req, res) => {
  try {
    const usageLogs = await db.select().from(apiUsageLog).orderBy(desc(apiUsageLog.createdAt)).limit(50);
    res.json(usageLogs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/audit-log", async (req, res) => {
  try {
    const logs = await db
      .select({
        id: adminActionLog.id,
        actionType: adminActionLog.actionType,
        targetId: adminActionLog.targetId,
        beforeState: adminActionLog.beforeState,
        afterState: adminActionLog.afterState,
        timestamp: adminActionLog.timestamp,
        adminUsername: users.username,
      })
      .from(adminActionLog)
      .leftJoin(users, eq(adminActionLog.adminUserId, users.id))
      .orderBy(desc(adminActionLog.timestamp))
      .limit(100);
      
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ... existing request logs route

// Data Export Center
import PDFDocument from "pdfkit";
import { reviews } from "../../shared/schema.js";

router.get("/export/:entity", async (req, res) => {
  const { entity } = req.params;
  const rangeParam = req.query.range as string || "7d";
  
  const startDate = new Date();
  if (rangeParam === "all") startDate.setFullYear(2020);
  else if (rangeParam === "30d") startDate.setDate(startDate.getDate() - 30);
  else if (rangeParam === "15d") startDate.setDate(startDate.getDate() - 15);
  else startDate.setDate(startDate.getDate() - 7);

  try {
    let data: any[] = [];
    if (entity === "users") {
      data = await db.select().from(users).where(sql`${users.createdAt} >= ${startDate}`);
    } else if (entity === "logs") {
      data = await db.select().from(requestLogs).where(sql`${requestLogs.timestamp} >= ${startDate}`);
    } else if (entity === "orders") {
      data = await db.select().from(auditOrders).where(sql`${auditOrders.createdAt} >= ${startDate}`);
    } else if (entity === "reviews") {
      data = await db.select().from(reviews).where(sql`${reviews.createdAt} >= ${startDate}`);
    } else {
      return res.status(400).json({ error: "Invalid entity" });
    }
    
    // If PDF requested
    if (req.query.format === "pdf") {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      doc.on("data", (c) => chunks.push(c));
      doc.on("end", () => {
        const pdfData = Buffer.concat(chunks);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename=export_${entity}_${rangeParam}.pdf`);
        res.send(pdfData);
      });
      
      doc.fontSize(20).text(`Export Data: ${entity.toUpperCase()}`, { align: "center" }).moveDown(1.5);
      doc.fontSize(12).text(`Date Range: ${rangeParam}`).moveDown(1);
      
      data.forEach((item, index) => {
        doc.fontSize(10).text(`${index + 1}. ${JSON.stringify(item)}`).moveDown(0.5);
      });
      
      doc.end();
      return;
    }

    // Default to JSON
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
