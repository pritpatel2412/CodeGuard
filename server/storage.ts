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
  visitors
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, sql, and, gte, lt } from "drizzle-orm";
import { randomUUID } from "crypto";

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

  // Visitors
  recordVisitor(sessionId: string): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByGitHubId(githubId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.githubId, githubId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    if (!user) throw new Error("User not found");
    return user;
  }

  // Repositories
  async getRepositories(userId: string): Promise<Repository[]> {
    return db.select().from(repositories).where(eq(repositories.userId, userId)).orderBy(desc(repositories.createdAt));
  }

  async getRepository(id: string): Promise<Repository | undefined> {
    const [repo] = await db.select().from(repositories).where(eq(repositories.id, id));
    return repo || undefined;
  }

  async getRepositoryByFullName(fullName: string): Promise<Repository | undefined> {
    const [repo] = await db.select().from(repositories).where(eq(repositories.fullName, fullName));
    return repo || undefined;
  }

  async createRepository(repo: InsertRepository): Promise<Repository> {
    const webhookSecret = randomUUID();
    const [created] = await db.insert(repositories).values({ ...repo, webhookSecret }).returning();
    return created;
  }

  async updateRepository(id: string, data: Partial<InsertRepository>): Promise<Repository | undefined> {
    const [updated] = await db.update(repositories).set(data).where(eq(repositories.id, id)).returning();
    return updated || undefined;
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
    return created;
  }

  async updateReview(id: string, data: Partial<InsertReview> & { completedAt?: Date | null }): Promise<Review | undefined> {
    const [updated] = await db.update(reviews).set(data).where(eq(reviews.id, id)).returning();
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
    return created;
  }

  async updateReviewComment(id: string, data: Partial<InsertReviewComment>): Promise<ReviewComment | undefined> {
    const [updated] = await db.update(reviewComments).set(data).where(eq(reviewComments.id, id)).returning();
    return updated || undefined;
  }

  // Stats
  async getStats(userId: string, startDate?: Date, endDate?: Date): Promise<Stats> {
    const userReviews = await this.getReviews(userId);

    // Filter by date range if provided
    const filteredReviews = startDate && endDate
      ? userReviews.filter(r => {
        const reviewDate = new Date(r.createdAt);
        return reviewDate >= startDate && reviewDate <= endDate;
      })
      : userReviews;

    // Get all comments for these reviews
    const reviewIds = filteredReviews.map(r => r.id);
    let allComments: ReviewComment[] = [];

    if (reviewIds.length > 0) {
      const commentsResult = await db
        .select({
          id: reviewComments.id,
          reviewId: reviewComments.reviewId,
          path: reviewComments.path,
          line: reviewComments.line,
          type: reviewComments.type,
          comment: reviewComments.comment,
          severity: reviewComments.severity,
          isPosted: reviewComments.isPosted,
          createdAt: reviewComments.createdAt,
        })
        .from(reviewComments)
        .innerJoin(reviews, eq(reviewComments.reviewId, reviews.id))
        .innerJoin(repositories, eq(reviews.repositoryId, repositories.id))
        .where(eq(repositories.userId, userId));

      // Filter comments by date range if provided
      allComments = startDate && endDate
        ? commentsResult.filter(c => {
          const commentDate = new Date(c.createdAt);
          return commentDate >= startDate && commentDate <= endDate;
        })
        : commentsResult;
    }

    const totalReviews = filteredReviews.length;
    const totalComments = allComments.length;
    const avgCommentsPerReview = totalReviews > 0 ? totalComments / totalReviews : 0;

    const riskDistribution = {
      low: filteredReviews.filter(r => r.riskLevel === "low").length,
      medium: filteredReviews.filter(r => r.riskLevel === "medium").length,
      high: filteredReviews.filter(r => r.riskLevel === "high").length,
    };

    const commentTypeDistribution: Record<string, number> = {};
    for (const comment of allComments) {
      commentTypeDistribution[comment.type] = (commentTypeDistribution[comment.type] || 0) + 1;
    }

    // Get activity for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentActivity: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      const count = filteredReviews.filter(r => {
        const reviewDate = new Date(r.createdAt);
        return reviewDate.toDateString() === date.toDateString();
      }).length;
      recentActivity.push({ date: dateStr, count });
    }

    return {
      totalReviews,
      totalComments,
      avgCommentsPerReview,
      riskDistribution,
      commentTypeDistribution,
      recentActivity,
    };
  }

  async getDetailedStats(userId: string, startDate?: Date, endDate?: Date): Promise<any> {
    const userReviews = await this.getReviews(userId);

    // Filter by date range if provided
    const filteredReviews = startDate && endDate
      ? userReviews.filter(r => {
        const reviewDate = new Date(r.createdAt);
        return reviewDate >= startDate && reviewDate <= endDate;
      })
      : userReviews;

    // Get repositories for review details
    const reviewsWithRepo = await Promise.all(
      filteredReviews.map(async (review) => {
        const repo = await this.getRepository(review.repositoryId);
        return {
          id: review.id,
          prNumber: review.prNumber,
          prTitle: review.prTitle,
          prUrl: review.prUrl,
          author: review.author,
          repository: repo?.fullName || 'Unknown',
          riskLevel: review.riskLevel,
          status: review.status,
          commentCount: review.commentCount,
          filesChanged: review.filesChanged,
          additions: review.additions,
          deletions: review.deletions,
          createdAt: review.createdAt,
          completedAt: review.completedAt,
        };
      })
    );

    // Get all comments with repository info
    const reviewIds = filteredReviews.map(r => r.id);
    let detailedComments: any[] = [];

    if (reviewIds.length > 0) {
      const commentsResult = await db
        .select({
          id: reviewComments.id,
          reviewId: reviewComments.reviewId,
          path: reviewComments.path,
          line: reviewComments.line,
          type: reviewComments.type,
          comment: reviewComments.comment,
          severity: reviewComments.severity,
          createdAt: reviewComments.createdAt,
        })
        .from(reviewComments)
        .innerJoin(reviews, eq(reviewComments.reviewId, reviews.id))
        .innerJoin(repositories, eq(reviews.repositoryId, repositories.id))
        .where(eq(repositories.userId, userId));

      // Filter and enrich comments
      const filteredComments = startDate && endDate
        ? commentsResult.filter(c => {
          const commentDate = new Date(c.createdAt);
          return commentDate >= startDate && commentDate <= endDate;
        })
        : commentsResult;

      detailedComments = await Promise.all(
        filteredComments.map(async (comment) => {
          const review = filteredReviews.find(r => r.id === comment.reviewId);
          const repo = review ? await this.getRepository(review.repositoryId) : null;
          return {
            ...comment,
            prNumber: review?.prNumber || 0,
            repository: repo?.fullName || 'Unknown',
          };
        })
      );
    }

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

  // Visitors
  async recordVisitor(sessionId: string): Promise<number> {
    // 1. Update or insert current visitor
    await db
      .insert(visitors)
      .values({
        sessionId,
        lastSeen: new Date(),
      })
      .onConflictDoUpdate({
        target: visitors.sessionId,
        set: { lastSeen: new Date() },
      });

    // 2. Delete old visitors (inactive for > 1 minute)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    await db.delete(visitors).where(lt(visitors.lastSeen, oneMinuteAgo));

    // 3. Count active visitors (seen within last 1 minute)
    // We count rows that are "fresh". Since we just deleted old ones, count all.
    const result = await db.select({ count: sql<number>`count(*)` }).from(visitors);
    return Number(result[0]?.count) || 0;
  }
}

export const storage = new DatabaseStorage();
