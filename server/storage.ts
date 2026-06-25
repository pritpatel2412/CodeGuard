import {
  repositories,
  reviews,
  reviewComments,
  users,
  type Repository,
  type InsertRepository,
  type Review,
  type InsertReview,
  type InsertReviewComment,
  type ReviewComment,
  type User,
  type InsertUser,
  type Stats,
  visitors,
  semanticGraphs,
  taintPaths,
  audits,
  auditReports,
  type Audit,
  type InsertAudit,
  type AuditReport,
  type InsertAuditReport,
  auditOrders,
  type AuditOrder,
  type InsertAuditOrder,
  policyViolations,
  promoOffers,
  freeAuditRequests,
  type PromoOffer,
  type InsertPromoOffer,
  type FreeAuditRequest,
  type InsertFreeAuditRequest,
  auditFeedback,
  type AuditFeedback,
  type InsertAuditFeedback
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, sql, and, gte, lt } from "drizzle-orm";
import { randomUUID } from "crypto";
import { emitReviewUpdate } from "./socket.js";
import { decryptAccessToken, encryptAccessToken } from "./security/token-crypto.js";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByGitHubId(githubId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;

  // Repositories
  getRepositories(userId: string): Promise<Repository[]>;
  getRepository(id: string): Promise<Repository | undefined>;
  getRepositoryByFullName(fullName: string): Promise<Repository | undefined>;
  createRepository(repo: InsertRepository): Promise<Repository>;
  updateRepository(id: string, data: Partial<InsertRepository>): Promise<Repository | undefined>;
  deleteRepository(id: string): Promise<void>;

  // Reviews
  getReviews(userId: string): Promise<Review[]>;
  getReview(id: string): Promise<Review | undefined>;
  getReviewByPR(repositoryId: string, prNumber: number): Promise<Review | undefined>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: string, data: Partial<InsertReview> & { completedAt?: Date | null }): Promise<Review | undefined>;

  // Review Comments
  getReviewComments(reviewId: string): Promise<ReviewComment[]>;
  getReviewComment(id: string): Promise<ReviewComment | undefined>;
  createReviewComment(comment: InsertReviewComment): Promise<ReviewComment>;
  updateReviewComment(id: string, data: Partial<InsertReviewComment>): Promise<ReviewComment | undefined>;

  // Stats
  getStats(userId: string, startDate?: Date, endDate?: Date): Promise<Stats>;
  getDetailedStats(userId: string, startDate?: Date, endDate?: Date): Promise<any>;

  // Taint Analysis
  getSemanticGraphs(reviewId: string): Promise<any[]>;
  getTaintPaths(reviewId: string): Promise<any[]>;

  // Visitors
  recordVisitor(sessionId: string): Promise<number>;

  // Audits
  createAudit(audit: InsertAudit): Promise<Audit>;
  updateAudit(id: string, data: Partial<InsertAudit> & { completedAt?: Date | null, reportId?: string | null }): Promise<Audit | undefined>;
  getAudit(id: string): Promise<Audit | undefined>;
  createAuditReport(report: InsertAuditReport): Promise<AuditReport>;
  getAuditReport(id: string): Promise<AuditReport | undefined>;
  getAuditsByRepository(repositoryUrl: string, userId: string): Promise<Audit[]>;

  // Audit Orders
  createAuditOrder(order: InsertAuditOrder): Promise<AuditOrder>;
  getAuditOrder(id: string): Promise<AuditOrder | undefined>;
  getAuditOrderByAuditId(auditId: string): Promise<AuditOrder | undefined>;
  getAllAuditOrders(): Promise<any[]>;
  updateAuditOrder(id: string, data: Partial<InsertAuditOrder>): Promise<AuditOrder | undefined>;

  // Promo Offers & Free Audits
  getActivePromoOffer(): Promise<PromoOffer | undefined>;
  createFreeAuditRequest(request: InsertFreeAuditRequest): Promise<FreeAuditRequest>;
  getPendingFreeAuditRequests(): Promise<FreeAuditRequest[]>;
  getFreeAuditRequest(id: string): Promise<FreeAuditRequest | undefined>;
  updateFreeAuditRequestStatus(id: string, status: string, adminId?: string, auditId?: string): Promise<FreeAuditRequest | undefined>;

  // Audit Feedback
  createAuditFeedback(auditId: string): Promise<AuditFeedback>;
  getAuditFeedback(auditId: string): Promise<AuditFeedback | undefined>;
  updateAuditFeedback(id: string, data: { responses?: any, freeText?: string }): Promise<AuditFeedback | undefined>;
}

export class DatabaseStorage implements IStorage {
  private hydrateUser(user: User | undefined): User | undefined {
    if (!user) return undefined;
    let decryptedAccessToken: string | null = null;
    try {
      decryptedAccessToken = decryptAccessToken(user.accessToken) ?? null;
    } catch (error: any) {
      console.error(`[SECURITY] Failed to decrypt access token for user ${user.id}:`, error?.message || error);
      decryptedAccessToken = null;
    }
    return {
      ...user,
      accessToken: decryptedAccessToken,
    };
  }

  private normalizeUserInsert(data: InsertUser): InsertUser {
    if (typeof data.accessToken === "string" && data.accessToken.trim()) {
      return {
        ...data,
        accessToken: encryptAccessToken(data.accessToken),
      };
    }
    return data;
  }

  private normalizeUserPatch(data: Partial<InsertUser>): Partial<InsertUser> {
    if (typeof data.accessToken === "string" && data.accessToken.trim()) {
      return {
        ...data,
        accessToken: encryptAccessToken(data.accessToken),
      };
    }
    return data;
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return this.hydrateUser(user || undefined);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return this.hydrateUser(user || undefined);
  }

  async getUserByGitHubId(githubId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.githubId, githubId));
    return this.hydrateUser(user || undefined);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(this.normalizeUserInsert(insertUser)).returning();
    return this.hydrateUser(user)!;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(this.normalizeUserPatch(data)).where(eq(users.id, id)).returning();
    if (!user) throw new Error("User not found");
    return this.hydrateUser(user)!;
  }

  // Repositories
  private hydrateRepository(repo: Repository | undefined): Repository | undefined {
    if (!repo) return undefined;
    let decryptedWebhookSecret = repo.webhookSecret;
    if (decryptedWebhookSecret) {
      try {
        decryptedWebhookSecret = decryptAccessToken(decryptedWebhookSecret) ?? null;
      } catch (err) {
        console.warn(`[Security] Failed to decrypt webhookSecret for repo ${repo.id}`);
      }
    }
    return { ...repo, webhookSecret: decryptedWebhookSecret };
  }

  async getRepositories(userId: string): Promise<Repository[]> {
    const repos = await db.select().from(repositories).where(eq(repositories.userId, userId)).orderBy(desc(repositories.createdAt));
    return repos.map(r => this.hydrateRepository(r)!);
  }

  async getRepository(id: string): Promise<Repository | undefined> {
    const [repo] = await db.select().from(repositories).where(eq(repositories.id, id));
    return this.hydrateRepository(repo);
  }

  async getRepositoryByFullName(fullName: string): Promise<Repository | undefined> {
    const [repo] = await db.select().from(repositories).where(eq(repositories.fullName, fullName));
    return this.hydrateRepository(repo);
  }

  async createRepository(repo: InsertRepository): Promise<Repository> {
    const webhookSecret = encryptAccessToken(randomUUID());
    const [created] = await db.insert(repositories).values({ ...repo, webhookSecret }).returning();
    emitReviewUpdate();
    return this.hydrateRepository(created)!;
  }

  async updateRepository(id: string, data: Partial<InsertRepository>): Promise<Repository | undefined> {
    const updateData = { ...data };
    if (updateData.webhookSecret) {
      updateData.webhookSecret = encryptAccessToken(updateData.webhookSecret);
    }
    const [updated] = await db.update(repositories).set(updateData).where(eq(repositories.id, id)).returning();
    return this.hydrateRepository(updated);
  }

  async deleteRepository(id: string): Promise<void> {
    await db.delete(repositories).where(eq(repositories.id, id));
  }

  // Reviews
  async getReviews(userId: string): Promise<Review[]> {
    return db
      .select()
      .from(reviews)
      .innerJoin(repositories, eq(reviews.repositoryId, repositories.id))
      .where(eq(repositories.userId, userId))
      .orderBy(desc(reviews.createdAt))
      .then(results => results.map(r => r.reviews));
  }

  async getReview(id: string): Promise<Review | undefined> {
    const [review] = await db.select().from(reviews).where(eq(reviews.id, id));
    return review || undefined;
  }

  async getReviewByPR(repositoryId: string, prNumber: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.repositoryId, repositoryId), eq(reviews.prNumber, prNumber)));
    return review || undefined;
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [created] = await db.insert(reviews).values(review).returning();
    emitReviewUpdate();
    return created;
  }

  async updateReview(id: string, data: Partial<InsertReview> & { completedAt?: Date | null }): Promise<Review | undefined> {
    const [updated] = await db.update(reviews).set(data).where(eq(reviews.id, id)).returning();
    if (updated) emitReviewUpdate();
    return updated || undefined;
  }

  // Review Comments
  async getReviewComments(reviewId: string): Promise<ReviewComment[]> {
    return db.select().from(reviewComments).where(eq(reviewComments.reviewId, reviewId)).orderBy(reviewComments.line);
  }

  async getReviewComment(id: string): Promise<ReviewComment | undefined> {
    const [comment] = await db
      .select()
      .from(reviewComments)
      .where(eq(reviewComments.id, id));
    return comment;
  }

  async createReviewComment(comment: InsertReviewComment): Promise<ReviewComment> {
    const [created] = await db.insert(reviewComments).values(comment).returning();
    emitReviewUpdate();
    return created;
  }

  async updateReviewComment(id: string, data: Partial<InsertReviewComment>): Promise<ReviewComment | undefined> {
    const [updated] = await db.update(reviewComments).set(data).where(eq(reviewComments.id, id)).returning();
    return updated || undefined;
  }

  async getStats(userId: string, startDate?: Date, endDate?: Date): Promise<Stats> {
    const start = startDate || new Date(0);
    const end = endDate || new Date();

    // 1. Get filtered reviews
    const filteredReviews = await db
      .select()
      .from(reviews)
      .innerJoin(repositories, eq(reviews.repositoryId, repositories.id))
      .where(
        and(
          eq(repositories.userId, userId),
          gte(reviews.createdAt, start),
          lt(reviews.createdAt, end)
        )
      )
      .orderBy(desc(reviews.createdAt));

    // 2. Get comment counts and distribution in one query
    const commentsData = await db
      .select({
        type: reviewComments.type,
        count: sql<number>`count(*)`
      })
      .from(reviewComments)
      .innerJoin(reviews, eq(reviewComments.reviewId, reviews.id))
      .innerJoin(repositories, eq(reviews.repositoryId, repositories.id))
      .where(
        and(
          eq(repositories.userId, userId),
          gte(reviews.createdAt, start),
          lt(reviews.createdAt, end)
        )
      )
      .groupBy(reviewComments.type);

    const totalReviews = filteredReviews.length;
    const totalComments = commentsData.reduce((sum, item) => sum + Number(item.count), 0);
    const avgCommentsPerReview = totalReviews > 0 ? totalComments / totalReviews : 0;

    const riskDistribution = {
      low: filteredReviews.filter(r => r.reviews.riskLevel === "low").length,
      medium: filteredReviews.filter(r => r.reviews.riskLevel === "medium").length,
      high: filteredReviews.filter(r => r.reviews.riskLevel === "high").length,
    };

    const commentTypeDistribution: Record<string, number> = {};
    commentsData.forEach(item => {
      commentTypeDistribution[item.type] = Number(item.count);
    });

    // 3. Activity for last 7 days (optimized)
    const recentActivity: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const count = filteredReviews.filter(r => {
        const reviewDate = new Date(r.reviews.createdAt);
        return reviewDate.toDateString() === date.toDateString();
      }).length;
      recentActivity.push({ date: dateStr, count });
    }

    // Operational Metrics
    const completedReviews = filteredReviews
      .map((r) => r.reviews)
      .filter((r) => r.completedAt && r.status === "completed");

    const mttrHours = completedReviews.length > 0
      ? completedReviews.reduce((sum, r) => {
          const createdAtMs = new Date(r.createdAt).getTime();
          const completedAtMs = new Date(r.completedAt as Date).getTime();
          const durationHours = Math.max(0, (completedAtMs - createdAtMs) / (1000 * 60 * 60));
          return sum + durationHours;
        }, 0) / completedReviews.length
      : 0;

    // Reopen rate (best-effort): duplicate review keys indicate re-open/recreated review records.
    const reviewKeyCounts = new Map<string, number>();
    for (const item of filteredReviews) {
      const key = `${item.reviews.repositoryId}:${item.reviews.prNumber}`;
      reviewKeyCounts.set(key, (reviewKeyCounts.get(key) ?? 0) + 1);
    }
    const reopenedCount = Array.from(reviewKeyCounts.values()).filter((count) => count > 1).length;
    const reopenRate = totalReviews > 0 ? (reopenedCount / totalReviews) * 100 : 0;

    // Auto-fix adoption (best-effort): security-fix PRs linked to high-risk original PR numbers.
    const allReviewRows = filteredReviews.map((r) => r.reviews);
    const securityFixRows = allReviewRows.filter((r) => /security fix/i.test(r.prTitle));
    const highRiskRows = allReviewRows.filter((r) => r.riskLevel === "high" && !/security fix/i.test(r.prTitle));

    const adoptedFixes = highRiskRows.filter((r) => {
      const prRefPattern = new RegExp(`\\((?:PR|MR)\\s*#${r.prNumber}\\)`, "i");
      return securityFixRows.some((fix) => prRefPattern.test(fix.prTitle));
    }).length;
    const fixAdoptionRate = highRiskRows.length > 0 ? (adoptedFixes / highRiskRows.length) * 100 : 0;

    // Risk burn-down: compare high-risk reviews in current window to previous equal window.
    const windowMs = end.getTime() - start.getTime();
    let riskBurndownPercent = 0;
    if (windowMs > 0) {
      const prevStart = new Date(start.getTime() - windowMs);
      const prevEnd = new Date(start.getTime());
      const previousRows = await db
        .select({ riskLevel: reviews.riskLevel })
        .from(reviews)
        .innerJoin(repositories, eq(reviews.repositoryId, repositories.id))
        .where(
          and(
            eq(repositories.userId, userId),
            gte(reviews.createdAt, prevStart),
            lt(reviews.createdAt, prevEnd)
          )
        );

      const currentHighRisk = allReviewRows.filter((r) => r.riskLevel === "high").length;
      const previousHighRisk = previousRows.filter((r) => r.riskLevel === "high").length;
      if (previousHighRisk > 0) {
        riskBurndownPercent = ((previousHighRisk - currentHighRisk) / previousHighRisk) * 100;
      } else if (currentHighRisk === 0) {
        riskBurndownPercent = 100;
      } else {
        riskBurndownPercent = 0;
      }
    }

    // Advanced Security Metrics (CodeGuard extended functionality)
    const auditsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(audits)
      .where(and(eq(audits.userId, userId), gte(audits.startedAt, start), lt(audits.startedAt, end)));

    const policyResult = await db
      .select({ 
        severity: policyViolations.severity,
        ruleName: policyViolations.ruleName,
        count: sql<number>`count(*)`
      })
      .from(policyViolations)
      .innerJoin(repositories, eq(policyViolations.repositoryId, repositories.id))
      .where(and(eq(repositories.userId, userId), gte(policyViolations.createdAt, start), lt(policyViolations.createdAt, end)))
      .groupBy(policyViolations.severity, policyViolations.ruleName);

    const taintResult = await db
      .select({ severity: taintPaths.severity, count: sql<number>`count(*)` })
      .from(taintPaths)
      .innerJoin(reviews, eq(taintPaths.reviewId, reviews.id))
      .innerJoin(repositories, eq(reviews.repositoryId, repositories.id))
      .where(and(eq(repositories.userId, userId), gte(taintPaths.createdAt, start), lt(taintPaths.createdAt, end)))
      .groupBy(taintPaths.severity);

    const totalAudits = auditsResult[0]?.count ? Number(auditsResult[0].count) : 0;
    
    let totalPolicyViolations = 0;
    const policyViolationDistribution: Record<string, number> = {};
    policyResult.forEach((row) => {
      const count = Number(row.count);
      totalPolicyViolations += count;
      policyViolationDistribution[row.ruleName] = (policyViolationDistribution[row.ruleName] || 0) + count;
    });

    let totalTaintPaths = 0;
    const taintVulnerabilities = { critical: 0, high: 0, medium: 0, low: 0 };
    taintResult.forEach((row) => {
      const count = Number(row.count);
      totalTaintPaths += count;
      if (row.severity === "CRITICAL") taintVulnerabilities.critical += count;
      else if (row.severity === "HIGH") taintVulnerabilities.high += count;
      else if (row.severity === "MEDIUM") taintVulnerabilities.medium += count;
      else if (row.severity === "LOW") taintVulnerabilities.low += count;
    });

    return {
      totalReviews,
      totalComments,
      avgCommentsPerReview,
      totalAudits,
      totalPolicyViolations,
      totalTaintPaths,
      taintVulnerabilities,
      policyViolationDistribution,
      riskDistribution,
      commentTypeDistribution,
      recentActivity,
      operationalMetrics: {
        mttrHours,
        reopenRate,
        fixAdoptionRate,
        riskBurndownPercent,
      },
    };
  }

  async getDetailedStats(userId: string, startDate?: Date, endDate?: Date): Promise<any> {
    const start = startDate || new Date(0);
    const end = endDate || new Date();

    // 1. Get enriched reviews in one query
    const reviewsResult = await db
      .select({
        review: reviews,
        repository: repositories
      })
      .from(reviews)
      .innerJoin(repositories, eq(reviews.repositoryId, repositories.id))
      .where(
        and(
          eq(repositories.userId, userId),
          gte(reviews.createdAt, start),
          lt(reviews.createdAt, end)
        )
      )
      .orderBy(desc(reviews.createdAt));

    const reviewsWithRepo = reviewsResult.map(({ review, repository }) => ({
      id: review.id,
      prNumber: review.prNumber,
      prTitle: review.prTitle,
      prUrl: review.prUrl,
      author: review.author,
      repository: repository.fullName,
      riskLevel: review.riskLevel,
      status: review.status,
      commentCount: review.commentCount,
      filesChanged: review.filesChanged,
      additions: review.additions,
      deletions: review.deletions,
      createdAt: review.createdAt,
      completedAt: review.completedAt,
    }));

    // 2. Get enriched comments in one query
    const commentsResult = await db
      .select({
        comment: reviewComments,
        review: reviews,
        repository: repositories
      })
      .from(reviewComments)
      .innerJoin(reviews, eq(reviewComments.reviewId, reviews.id))
      .innerJoin(repositories, eq(reviews.repositoryId, repositories.id))
      .where(
        and(
          eq(repositories.userId, userId),
          gte(reviews.createdAt, start),
          lt(reviews.createdAt, end)
        )
      )
      .orderBy(desc(reviewComments.createdAt));

    const detailedComments = commentsResult.map(({ comment, review, repository }) => ({
      ...comment,
      prNumber: review.prNumber,
      repository: repository.fullName,
    }));

    const summary = await this.getStats(userId, startDate, endDate);

    return {
      summary,
      reviews: reviewsWithRepo,
      comments: detailedComments,
      timeRange: startDate && endDate
        ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
        : 'All Time',
    };
  }

  // Taint Analysis
  async getSemanticGraphs(reviewId: string): Promise<any[]> {
    return db.select().from(semanticGraphs).where(eq(semanticGraphs.reviewId, reviewId)).orderBy(desc(semanticGraphs.createdAt));
  }

  async getTaintPaths(reviewId: string): Promise<any[]> {
    return db.select().from(taintPaths).where(eq(taintPaths.reviewId, reviewId)).orderBy(desc(taintPaths.severity), desc(taintPaths.createdAt));
  }

  // Audits
  async createAudit(audit: InsertAudit): Promise<Audit> {
    const [created] = await db.insert(audits).values(audit).returning();
    return created;
  }

  async updateAudit(id: string, data: Partial<InsertAudit> & { completedAt?: Date | null, reportId?: string | null }): Promise<Audit | undefined> {
    const [updated] = await db.update(audits).set(data).where(eq(audits.id, id)).returning();
    return updated || undefined;
  }

  async getAudit(id: string): Promise<Audit | undefined> {
    const [audit] = await db.select().from(audits).where(eq(audits.id, id));
    return audit || undefined;
  }

  async createAuditReport(report: InsertAuditReport): Promise<AuditReport> {
    const [created] = await db.insert(auditReports).values(report).returning();
    return created;
  }

  async getAuditReport(id: string): Promise<AuditReport | undefined> {
    const [report] = await db.select().from(auditReports).where(eq(auditReports.id, id));
    return report || undefined;
  }

  async getAuditsByRepository(repositoryUrl: string, userId: string): Promise<Audit[]> {
    return db
      .select()
      .from(audits)
      .where(and(eq(audits.repositoryUrl, repositoryUrl), eq(audits.userId, userId)))
      .orderBy(desc(audits.startedAt));
  }

  // Audit Orders
  async createAuditOrder(order: InsertAuditOrder): Promise<AuditOrder> {
    const [created] = await db.insert(auditOrders).values(order).returning();
    return created;
  }

  async getAuditOrder(id: string): Promise<AuditOrder | undefined> {
    const [order] = await db.select().from(auditOrders).where(eq(auditOrders.id, id));
    return order || undefined;
  }

  async getAuditOrderByAuditId(auditId: string): Promise<AuditOrder | undefined> {
    const [order] = await db.select().from(auditOrders).where(eq(auditOrders.auditId, auditId));
    return order || undefined;
  }

  async getAllAuditOrders(): Promise<any[]> {
    const result = await db
      .select({
        order: auditOrders,
        audit: audits,
        user: users
      })
      .from(auditOrders)
      .innerJoin(audits, eq(auditOrders.auditId, audits.id))
      .innerJoin(users, eq(auditOrders.userId, users.id))
      .orderBy(desc(auditOrders.createdAt));
      
    return result.map(r => ({
      ...r.order,
      auditData: r.audit,
      userData: {
        username: r.user.username,
        email: r.user.githubId, // Using githubId as email approximation since we don't store email
      }
    }));
  }

  async updateAuditOrder(id: string, data: Partial<InsertAuditOrder>): Promise<AuditOrder | undefined> {
    const [updated] = await db.update(auditOrders).set({ ...data, updatedAt: new Date() }).where(eq(auditOrders.id, id)).returning();
    return updated || undefined;
  }

  // Visitors
  async recordVisitor(sessionId: string): Promise<number> {
    const now = new Date();
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    // 1. Update or insert current visitor
    await db
      .insert(visitors)
      .values({
        sessionId,
        lastSeen: now,
      })
      .onConflictDoUpdate({
        target: visitors.sessionId,
        set: { lastSeen: now },
      });

    // 2. Delete old visitors (inactive for > 1 minute)
    // PROPER FIX: Only cleanup occasionally (5% chance) to reduce IO pressure
    if (Math.random() < 0.05) {
      await db.delete(visitors).where(lt(visitors.lastSeen, oneMinuteAgo));
    }

    // 3. Count active visitors (seen within last 1 minute)
    // Using the index we added to lastSeen for fast retrieval
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(visitors)
      .where(gte(visitors.lastSeen, oneMinuteAgo));
      
    return Number(result[0]?.count) || 0;
  }

  // Promo Offers
  async getActivePromoOffer(): Promise<PromoOffer | undefined> {
    const now = new Date();
    
    // First, automatically expire any active offers that have passed their endsAt date
    await db.update(promoOffers)
      .set({ status: "ended" })
      .where(and(eq(promoOffers.status, "active"), lt(promoOffers.endsAt, now)));

    const [offer] = await db.select().from(promoOffers).where(eq(promoOffers.status, "active")).limit(1);
    return offer || undefined;
  }

  async updatePromoOffer(id: string, data: Partial<PromoOffer>): Promise<PromoOffer | undefined> {
    const [updated] = await db.update(promoOffers)
      .set(data)
      .where(eq(promoOffers.id, id))
      .returning();
    return updated || undefined;
  }

  async createPromoOffer(data: Partial<PromoOffer>): Promise<PromoOffer> {
    const [created] = await db.insert(promoOffers).values({
      name: data.name || "admin-created-offer",
      description: data.description || "Admin created promo offer",
      startsAt: data.startsAt || new Date(),
      endsAt: data.endsAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // default 7 days
      status: "active",
      grantsUsed: 0
    }).returning();
    return created;
  }

  async createFreeAuditRequest(request: InsertFreeAuditRequest): Promise<FreeAuditRequest> {
    const [created] = await db.insert(freeAuditRequests).values(request).returning();
    return created;
  }

  async getPendingFreeAuditRequests(): Promise<FreeAuditRequest[]> {
    return await db.select()
      .from(freeAuditRequests)
      .where(eq(freeAuditRequests.status, "pending"))
      .orderBy(desc(freeAuditRequests.submittedAt));
  }

  async getFreeAuditRequest(id: string): Promise<FreeAuditRequest | undefined> {
    const [request] = await db.select().from(freeAuditRequests).where(eq(freeAuditRequests.id, id));
    return request || undefined;
  }

  async updateFreeAuditRequestStatus(id: string, status: string, adminId?: string, auditId?: string): Promise<FreeAuditRequest | undefined> {
    const updateData: any = { status };
    if (adminId) {
      updateData.reviewedByAdminId = adminId;
      updateData.reviewedAt = new Date();
    }
    if (auditId) {
      updateData.auditId = auditId;
    }

    const [updated] = await db.update(freeAuditRequests)
      .set(updateData)
      .where(eq(freeAuditRequests.id, id))
      .returning();
      
    return updated || undefined;
  }

  // Audit Feedback
  async createAuditFeedback(auditId: string): Promise<AuditFeedback> {
    const [feedback] = await db.insert(auditFeedback).values({ auditId }).returning();
    return feedback;
  }

  async getAuditFeedback(auditId: string): Promise<AuditFeedback | undefined> {
    const [feedback] = await db.select().from(auditFeedback).where(eq(auditFeedback.auditId, auditId));
    return feedback || undefined;
  }

  async updateAuditFeedback(id: string, data: { responses?: any, freeText?: string }): Promise<AuditFeedback | undefined> {
    const [updated] = await db.update(auditFeedback)
      .set({ ...data, respondedAt: new Date() })
      .where(eq(auditFeedback.id, id))
      .returning();
    return updated || undefined;
  }
}

export const storage = new DatabaseStorage();
