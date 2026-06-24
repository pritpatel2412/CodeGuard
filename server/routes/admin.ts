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

    res.json({
      totalUsers: Number(totalUsers),
      totalAudits: Number(totalAudits),
      totalOrders: Number(totalOrders),
      totalApiCost: Number(totalCost || 0).toFixed(2),
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

export default router;
