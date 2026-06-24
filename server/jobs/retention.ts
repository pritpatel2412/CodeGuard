import { db } from "../db";
import { requestLogs } from "@shared/schema";
import { sql } from "drizzle-orm";

export function startRetentionJob() {
  const retentionDays = parseInt(process.env.REQUEST_LOG_RETENTION_DAYS || "90", 10);
  console.log(`[Retention Job] Started. Log retention policy is set to ${retentionDays} days.`);

  // Run the cleanup every 24 hours
  const intervalMs = 24 * 60 * 60 * 1000;

  setInterval(async () => {
    try {
      console.log(`[Retention Job] Running cleanup for logs older than ${retentionDays} days...`);
      
      const result = await db.delete(requestLogs)
        .where(sql`timestamp < NOW() - INTERVAL '${sql.raw(retentionDays.toString())} days'`)
        .returning({ id: requestLogs.id });
        
      console.log(`[Retention Job] Cleanup complete. Removed ${result.length} outdated logs.`);
    } catch (error) {
      console.error("[Retention Job] Cleanup failed:", error);
    }
  }, intervalMs);
  
  // Optionally, we could run it once on startup if needed:
  // setTimeout(async () => { ... }, 5000);
}
