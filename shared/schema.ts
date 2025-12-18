import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Repositories connected for review
export const repositories = pgTable("repositories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  fullName: text("full_name").notNull().unique(),
  owner: text("owner").notNull(),
  platform: text("platform").notNull().default("github"),
  webhookSecret: text("webhook_secret"),
  isActive: boolean("is_active").notNull().default(true),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// PR Reviews
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  repositoryId: varchar("repository_id").notNull().references(() => repositories.id),
  prNumber: integer("pr_number").notNull(),
  prTitle: text("pr_title").notNull(),
  prUrl: text("pr_url").notNull(),
  author: text("author").notNull(),
  authorAvatar: text("author_avatar"),
  summary: text("summary"),
  riskLevel: text("risk_level").notNull().default("low"),
  status: text("status").notNull().default("pending"),
  commentCount: integer("comment_count").notNull().default(0),
  filesChanged: integer("files_changed").notNull().default(0),
  additions: integer("additions").notNull().default(0),
  deletions: integer("deletions").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Review Comments
export const reviewComments = pgTable("review_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewId: varchar("review_id").notNull().references(() => reviews.id),
  path: text("path").notNull(),
  line: integer("line").notNull(),
  type: text("type").notNull(),
  comment: text("comment").notNull(),
  severity: text("severity").notNull().default("medium"),
  isPosted: boolean("is_posted").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const repositoriesRelations = relations(repositories, ({ many }) => ({
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  repository: one(repositories, {
    fields: [reviews.repositoryId],
    references: [repositories.id],
  }),
  comments: many(reviewComments),
}));

export const reviewCommentsRelations = relations(reviewComments, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewComments.reviewId],
    references: [reviews.id],
  }),
}));

// Insert schemas
export const insertRepositorySchema = createInsertSchema(repositories).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertReviewCommentSchema = createInsertSchema(reviewComments).omit({
  id: true,
  createdAt: true,
});

// Types
export type Repository = typeof repositories.$inferSelect;
export type InsertRepository = z.infer<typeof insertRepositorySchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type ReviewComment = typeof reviewComments.$inferSelect;
export type InsertReviewComment = z.infer<typeof insertReviewCommentSchema>;

// API Response Types
export const reviewWithCommentsSchema = z.object({
  review: z.custom<Review>(),
  comments: z.array(z.custom<ReviewComment>()),
  repository: z.custom<Repository>().optional(),
});

export type ReviewWithComments = z.infer<typeof reviewWithCommentsSchema>;

// Stats Types
export const statsSchema = z.object({
  totalReviews: z.number(),
  totalComments: z.number(),
  avgCommentsPerReview: z.number(),
  riskDistribution: z.object({
    low: z.number(),
    medium: z.number(),
    high: z.number(),
  }),
  commentTypeDistribution: z.record(z.number()),
  recentActivity: z.array(z.object({
    date: z.string(),
    count: z.number(),
  })),
});

export type Stats = z.infer<typeof statsSchema>;

// AI Review Response Type
export const aiReviewResponseSchema = z.object({
  summary: z.string(),
  risk_level: z.enum(["low", "medium", "high"]),
  comments: z.array(z.object({
    path: z.string(),
    line: z.number(),
    type: z.enum(["bug", "performance", "security", "readability", "maintainability"]),
    comment: z.string(),
  })),
});

export type AIReviewResponse = z.infer<typeof aiReviewResponseSchema>;

// Keep users for future auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password"),
  githubId: text("github_id").unique(),
  avatarUrl: text("avatar_url"),
  accessToken: text("access_token"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  githubId: true,
  avatarUrl: true,
  accessToken: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
