import {
  repositories,
  reviews,
  reviewComments,
  users,
  type Repository,
  type InsertRepository,
  type Review,
  type InsertReview,
  type ReviewComment,
  type InsertReviewComment,
  type User,
  type InsertUser,
  type Stats
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, desc, sql, and, gte } from "drizzle-orm";
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
  createReviewComment(comment: InsertReviewComment): Promise<ReviewComment>;
  updateReviewComment(id: string, data: Partial<InsertReviewComment>): Promise<ReviewComment | undefined>;

  // Stats
  getStats(userId: string): Promise<Stats>;
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
      .select({
        id: reviews.id,
        repositoryId: reviews.repositoryId,
        prNumber: reviews.prNumber,
        prTitle: reviews.prTitle,
        prUrl: reviews.prUrl,
        author: reviews.author,
        authorAvatar: reviews.authorAvatar,
        summary: reviews.summary,
        riskLevel: reviews.riskLevel,
        status: reviews.status,
        commentCount: reviews.commentCount,
        filesChanged: reviews.filesChanged,
        additions: reviews.additions,
        deletions: reviews.deletions,
        createdAt: reviews.createdAt,
        completedAt: reviews.completedAt,
      })
      .from(reviews)
      .innerJoin(repositories, eq(reviews.repositoryId, repositories.id))
      .where(eq(repositories.userId, userId))
      .orderBy(desc(reviews.createdAt));
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

  async createReviewComment(comment: InsertReviewComment): Promise<ReviewComment> {
    const [created] = await db.insert(reviewComments).values(comment).returning();
    return created;
  }

  async updateReviewComment(id: string, data: Partial<InsertReviewComment>): Promise<ReviewComment | undefined> {
    const [updated] = await db.update(reviewComments).set(data).where(eq(reviewComments.id, id)).returning();
    return updated || undefined;
  }

  // Stats
  async getStats(userId: string): Promise<Stats> {
    const userReviews = await this.getReviews(userId);

    // Get all comments for these reviews
    const reviewIds = userReviews.map(r => r.id);
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

      allComments = commentsResult;
    }

    const totalReviews = userReviews.length;
    const totalComments = allComments.length;
    const avgCommentsPerReview = totalReviews > 0 ? totalComments / totalReviews : 0;

    const riskDistribution = {
      low: userReviews.filter(r => r.riskLevel === "low").length,
      medium: userReviews.filter(r => r.riskLevel === "medium").length,
      high: userReviews.filter(r => r.riskLevel === "high").length,
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
      const count = userReviews.filter(r => {
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
}

export const storage = new DatabaseStorage();
