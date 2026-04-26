import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, json, boolean, serial } from "drizzle-orm/pg-core";
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

  // AI Analysis fields
  keyRiskFactors: jsonb("key_risk_factors"),
  potentialImpact: jsonb("potential_impact"),
  recommendations: jsonb("recommendations"),
  blockingReasons: jsonb("blocking_reasons"),
  requiredActions: jsonb("required_actions"),
  automationStatus: text("automation_status"),
  confidence: text("confidence"),
  mergeDecision: text("merge_decision"),
});

// Session store
export const session = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire").notNull(),
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

// Stores the full semantic graph snapshot for a given PR analysis
export const semanticGraphs = pgTable("semantic_graphs", {
  id: serial("id").primaryKey(),
  reviewId: varchar("review_id").notNull().references(() => reviews.id, { onDelete: "cascade" }),
  repositoryId: varchar("repository_id").notNull(),
  // JSON: { nodes: GraphNode[], edges: GraphEdge[] }
  graphData: jsonb("graph_data").notNull(),
  fileCount: integer("file_count").notNull().default(0),
  functionCount: integer("function_count").notNull().default(0),
  edgeCount: integer("edge_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Each row is one detected taint path (source → chain → sink)
export const taintPaths = pgTable("taint_paths", {
  id: serial("id").primaryKey(),
  reviewId: varchar("review_id").notNull().references(() => reviews.id, { onDelete: "cascade" }),
  semanticGraphId: integer("semantic_graph_id").references(() => semanticGraphs.id),

  // Human-readable vulnerability title
  title: text("title").notNull(),

  // "SQLI" | "XSS" | "CMD_INJECTION" | "PATH_TRAVERSAL" | "SENSITIVE_LEAK" | "PROTOTYPE_POLLUTION"
  vulnerabilityType: text("vulnerability_type").notNull(),

  // "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  severity: text("severity").notNull(),

  // Source node — where tainted input enters the system
  sourceFile: text("source_file").notNull(),
  sourceFunction: text("source_function").notNull(),
  sourceLine: integer("source_line"),
  sourceExpression: text("source_expression").notNull(), // e.g. "req.body.username"

  // Sink node — where tainted data is dangerously consumed
  sinkFile: text("sink_file").notNull(),
  sinkFunction: text("sink_function").notNull(),
  sinkLine: integer("sink_line"),
  sinkExpression: text("sink_expression").notNull(), // e.g. "db.query(`SELECT * FROM users WHERE id=${id}`)"

  // JSON array of intermediate hops: [{ file, function, line, expression }]
  propagationChain: jsonb("propagation_chain").notNull().default([]),

  // Was a sanitizer present but bypassable?
  sanitizerBypassed: boolean("sanitizer_bypassed").default(false),
  sanitizerLocation: text("sanitizer_location"), // e.g. "middleware/validate.ts:sanitizeInput()"

  // GPT-4o generated explanation and fix
  aiExplanation: text("ai_explanation"),
  aiFixSuggestion: text("ai_fix_suggestion"),

  createdAt: timestamp("created_at").defaultNow(),
});

// Stores parsed/validated .codeguard.yml policy per repository
export const repositoryPolicies = pgTable("repository_policies", {
  id: serial("id").primaryKey(),
  repositoryId: varchar("repository_id").notNull().unique().references(() => repositories.id, { onDelete: "cascade" }),
  policyName: text("policy_name").notNull().default("Custom Policy"),
  policyVersion: text("policy_version").default("1"),
  complianceFrameworks: text("compliance_frameworks").array().default([]),
  rules: jsonb("rules").notNull().default([]),
  disabledBuiltinRules: text("disabled_builtin_rules").array().default([]),
  rawYaml: text("raw_yaml"),
  fileSha: text("file_sha"),
  isActive: boolean("is_active").notNull().default(true),
  lastSyncedAt: timestamp("last_synced_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Per-review custom policy violations
export const policyViolations = pgTable("policy_violations", {
  id: serial("id").primaryKey(),
  reviewId: varchar("review_id").notNull().references(() => reviews.id, { onDelete: "cascade" }),
  repositoryId: varchar("repository_id").notNull().references(() => repositories.id, { onDelete: "cascade" }),
  ruleId: text("rule_id").notNull(),
  ruleName: text("rule_name").notNull(),
  severity: text("severity").notNull(),
  filePath: text("file_path").notNull(),
  lineNumber: integer("line_number"),
  violatingCode: text("violating_code"),
  explanation: text("explanation"),
  suggestedFix: text("suggested_fix"),
  createdAt: timestamp("created_at").defaultNow(),
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
export type RepositoryPolicy = typeof repositoryPolicies.$inferSelect;
export type PolicyViolation = typeof policyViolations.$inferSelect;

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

// Time Range Stats Request
export const timeRangeStatsRequestSchema = z.object({
  range: z.enum(["24h", "7d", "15d", "1m"]),
});

export type TimeRangeStatsRequest = z.infer<typeof timeRangeStatsRequestSchema>;

// Detailed Stats for Excel Export
export const detailedStatsSchema = z.object({
  summary: statsSchema,
  reviews: z.array(z.object({
    id: z.string(),
    prNumber: z.number(),
    prTitle: z.string(),
    prUrl: z.string(),
    author: z.string(),
    repository: z.string(),
    riskLevel: z.string(),
    status: z.string(),
    commentCount: z.number(),
    filesChanged: z.number(),
    additions: z.number(),
    deletions: z.number(),
    createdAt: z.date(),
    completedAt: z.date().nullable(),
  })),
  comments: z.array(z.object({
    id: z.string(),
    reviewId: z.string(),
    prNumber: z.number(),
    repository: z.string(),
    path: z.string(),
    line: z.number(),
    type: z.string(),
    comment: z.string(),
    severity: z.string(),
    createdAt: z.date(),
  })),
  timeRange: z.string(),
});

export type DetailedStats = z.infer<typeof detailedStatsSchema>;

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

// Visitor Counter
export const visitors = pgTable("visitors", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  lastSeen: timestamp("last_seen").notNull().defaultNow(),
}, (table) => ({
  lastSeenIdx: sql`INDEX last_seen_idx ON ${table} (${table.lastSeen})`,
}));

export const insertVisitorSchema = createInsertSchema(visitors);
export type Visitor = typeof visitors.$inferSelect;
export type InsertVisitor = z.infer<typeof insertVisitorSchema>;

// Keep users for future auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password"),
  githubId: text("github_id").unique(),
  avatarUrl: text("avatar_url"),
  accessToken: text("access_token"),

  // Preferences
  bugDetection: boolean("bug_detection").default(true),
  securityAnalysis: boolean("security_analysis").default(true),
  performanceIssues: boolean("performance_issues").default(true),
  maintainability: boolean("maintainability").default(true),
  skipStyleIssues: boolean("skip_style_issues").default(true),
  postComments: boolean("post_comments").default(true),
  highRiskAlerts: boolean("high_risk_alerts").default(true),

  // Auto-Fix Preferences
  autoFixStrictMode: boolean("auto_fix_strict_mode").default(true),
  autoFixSafetyGuards: boolean("auto_fix_safety_guards").default(true),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  githubId: true,
  avatarUrl: true,
  accessToken: true,
  bugDetection: true,
  securityAnalysis: true,
  performanceIssues: true,
  maintainability: true,
  skipStyleIssues: true,
  postComments: true,
  highRiskAlerts: true,
  autoFixStrictMode: true,
  autoFixSafetyGuards: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
