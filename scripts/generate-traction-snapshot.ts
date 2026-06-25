import "dotenv/config";
import { db } from "../server/db";
import { users, repositories, reviews, audits, auditOrders, apiUsageLog, requestLogs, auditFeedback } from "../shared/schema";
import { sql, gte, isNotNull } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";

async function generateSnapshot() {
  console.log("Generating traction snapshot...");

  // 1. Users
  const totalUsersResult = await db.select({ count: sql<number>`count(*)` }).from(users);
  const totalUsers = Number(totalUsersResult[0].count);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.getDate() - 7; // Wait, let's just use 7 days ago

  const activeUsers30dResult = await db.select({ count: sql<number>`count(distinct ${requestLogs.userId})` })
    .from(requestLogs)
    .where(gte(requestLogs.timestamp, thirtyDaysAgo));
  const activeUsers30d = Number(activeUsers30dResult[0].count);

  const activeUsers7dResult = await db.select({ count: sql<number>`count(distinct ${requestLogs.userId})` })
    .from(requestLogs)
    .where(gte(requestLogs.timestamp, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)));
  const activeUsers7d = Number(activeUsers7dResult[0].count);

  // 2. Repositories
  const totalReposResult = await db.select({ count: sql<number>`count(*)` }).from(repositories);
  const totalRepos = Number(totalReposResult[0].count);

  // 3. PR Reviews & Audit Mode runs
  const totalReviewsResult = await db.select({ count: sql<number>`count(*)` }).from(reviews);
  const totalReviews = Number(totalReviewsResult[0].count);

  const totalAuditsResult = await db.select({ count: sql<number>`count(*)` }).from(audits);
  const totalAudits = Number(totalAuditsResult[0].count);

  // 4. Audit Orders & Revenue
  const auditOrdersResult = await db.select({
    status: auditOrders.status,
    count: sql<number>`count(*)`,
    revenue: sql<number>`sum(${auditOrders.priceUsd})`
  }).from(auditOrders).groupBy(auditOrders.status);

  let totalRevenue = 0;
  let ordersSummary = "";
  let payingCustomers = 0;
  if (auditOrdersResult.length === 0) {
    ordersSummary = "0 audit orders";
  } else {
    ordersSummary = auditOrdersResult.map(row => {
      if (row.status === 'marked_paid_manually' || row.status === 'paid') {
         totalRevenue += Number(row.revenue || 0);
         payingCustomers += Number(row.count);
      }
      return `${row.count} ${row.status} ($${row.revenue || 0})`;
    }).join(", ");
  }

  // 5. Eval harness
  let evalNumbers = "Eval results file not found";
  try {
    const evalPath = path.join(process.cwd(), "eval/results/latest.md");
    if (fs.existsSync(evalPath)) {
      const evalContent = fs.readFileSync(evalPath, "utf-8");
      // Extract Precision, Recall, F1
      const precisionMatch = evalContent.match(/Precision\*\*:\s*([\d.]+%)/);
      const recallMatch = evalContent.match(/Recall\*\*:\s*([\d.]+%)/);
      const f1Match = evalContent.match(/F1 Score\*\*:\s*([\d.]+%)/);
      const bypassMatch = evalContent.match(/Bypass Rate\*\*:\s*(.*)/);
      
      evalNumbers = `Precision: ${precisionMatch?.[1] || 'N/A'}, Recall: ${recallMatch?.[1] || 'N/A'}, F1: ${f1Match?.[1] || 'N/A'}\nSafety Bypass Rate: ${bypassMatch?.[1] || 'N/A'}`;
    }
  } catch(e) {
    console.error("Failed to read eval results", e);
  }

  // 6. Cost observability
  const costResult = await db.select({
    totalCost: sql<number>`sum(CAST(${apiUsageLog.costUsd} AS numeric))`
  }).from(apiUsageLog);
  const totalCost = Number(costResult[0]?.totalCost || 0);
  
  const avgCostPerReview = totalReviews > 0 ? (totalCost / totalReviews).toFixed(4) : "0";

  const today = new Date().toISOString().split('T')[0];
  const snapshotPath = path.join(process.cwd(), `docs/TRACTION_SNAPSHOT_${today}.md`);

  // 7. Post-Audit Feedback
  const feedbackRows = await db.select().from(auditFeedback).where(isNotNull(auditFeedback.respondedAt));
  let totalAccuracy = 0;
  let totalValue = 0;
  let validAccuracy = 0;
  let validValue = 0;
  
  feedbackRows.forEach(f => {
    const responses = f.responses as any;
    if (responses?.accuracy) {
      totalAccuracy += Number(responses.accuracy);
      validAccuracy++;
    }
    if (responses?.willingnessToPay) {
      totalValue += Number(responses.willingnessToPay);
      validValue++;
    }
  });
  
  const avgAccuracy = validAccuracy > 0 ? (totalAccuracy / validAccuracy).toFixed(1) : "0.0";
  const avgValue = validValue > 0 ? (totalValue / validValue).toFixed(1) : "0.0";

  const snapshotContent = `# Traction Snapshot - ${today}

## Users & Activity
- Total registered users: ${totalUsers}
- Active users (last 7 days): ${activeUsers7d}
- Active users (last 30 days): ${activeUsers30d}
${activeUsers7d === 0 ? '> Fastest path to non-zero: Convert one of the eval corpus source repos maintainers into a free pilot this week.' : ''}

## Repositories
- Total repositories connected: ${totalRepos}
${totalRepos === 0 ? '> Fastest path to non-zero: Connect the CodeGuard repo itself and 2 open-source projects owned by the founders.' : ''}

## Product Usage
- Total PR reviews run: ${totalReviews}
- Total Audit Mode runs completed: ${totalAudits}

## Revenue & Orders
- Audit Orders: ${ordersSummary}
- Total Revenue: $${totalRevenue}
- Paying Customers: ${payingCustomers}
${payingCustomers === 0 ? '> Fastest path to non-zero: Convert one pilot user via the manual-comp flow already built in the pricing mission, or manually invoice a design partner.' : ''}

## Evaluation Metrics (latest.md)
${evalNumbers}

## Post-Audit Feedback
- Total responses: ${feedbackRows.length}
- Average Accuracy Rating: ${avgAccuracy} / 5
- Average Willingness to Pay Rating: ${avgValue} / 5

## Unit Economics
- Average cost per review/audit: $${avgCostPerReview} (Total cost: $${totalCost.toFixed(4)})

*Note: This snapshot is generated directly from live database metrics.*
`;

  fs.mkdirSync(path.join(process.cwd(), "docs"), { recursive: true });
  fs.writeFileSync(snapshotPath, snapshotContent);
  console.log(`Snapshot written to docs/TRACTION_SNAPSHOT_${today}.md`);
  process.exit(0);
}

generateSnapshot().catch(console.error);
