CREATE TABLE "api_usage_log" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_id" varchar,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"tokens_in" integer DEFAULT 0 NOT NULL,
	"tokens_out" integer DEFAULT 0 NOT NULL,
	"cost_usd" text DEFAULT '0' NOT NULL,
	"latency_ms" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audit_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"tier_id" text NOT NULL,
	"price_usd" integer NOT NULL,
	"status" text DEFAULT 'pending_payment' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_reports" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"audit_id" varchar NOT NULL,
	"report_json" jsonb NOT NULL,
	"report_hash" text,
	"signature" text,
	"pdf_path" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audits" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_url" text NOT NULL,
	"branch" text NOT NULL,
	"framework" text DEFAULT 'asvs-5.0' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"report_id" varchar,
	"user_id" varchar
);
--> statement-breakpoint
CREATE TABLE "policy_violations" (
	"id" serial PRIMARY KEY NOT NULL,
	"review_id" varchar NOT NULL,
	"repository_id" varchar NOT NULL,
	"rule_id" text NOT NULL,
	"rule_name" text NOT NULL,
	"severity" text NOT NULL,
	"file_path" text NOT NULL,
	"line_number" integer,
	"violating_code" text,
	"explanation" text,
	"suggested_fix" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "repositories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"full_name" text NOT NULL,
	"owner" text NOT NULL,
	"platform" text DEFAULT 'github' NOT NULL,
	"webhook_secret" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"user_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "repositories_full_name_unique" UNIQUE("full_name")
);
--> statement-breakpoint
CREATE TABLE "repository_policies" (
	"id" serial PRIMARY KEY NOT NULL,
	"repository_id" varchar NOT NULL,
	"policy_name" text DEFAULT 'Custom Policy' NOT NULL,
	"policy_version" text DEFAULT '1',
	"compliance_frameworks" text[] DEFAULT '{}',
	"rules" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"disabled_builtin_rules" text[] DEFAULT '{}',
	"raw_yaml" text,
	"file_sha" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_synced_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "repository_policies_repository_id_unique" UNIQUE("repository_id")
);
--> statement-breakpoint
CREATE TABLE "review_comments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"review_id" varchar NOT NULL,
	"path" text NOT NULL,
	"line" integer NOT NULL,
	"type" text NOT NULL,
	"comment" text NOT NULL,
	"severity" text DEFAULT 'medium' NOT NULL,
	"is_posted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"repository_id" varchar NOT NULL,
	"pr_number" integer NOT NULL,
	"pr_title" text NOT NULL,
	"pr_url" text NOT NULL,
	"author" text NOT NULL,
	"author_avatar" text,
	"summary" text,
	"risk_level" text DEFAULT 'low' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"comment_count" integer DEFAULT 0 NOT NULL,
	"files_changed" integer DEFAULT 0 NOT NULL,
	"additions" integer DEFAULT 0 NOT NULL,
	"deletions" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"key_risk_factors" jsonb,
	"potential_impact" jsonb,
	"recommendations" jsonb,
	"blocking_reasons" jsonb,
	"required_actions" jsonb,
	"automation_status" text,
	"confidence" text,
	"merge_decision" text
);
--> statement-breakpoint
CREATE TABLE "semantic_graphs" (
	"id" serial PRIMARY KEY NOT NULL,
	"review_id" varchar NOT NULL,
	"repository_id" varchar NOT NULL,
	"graph_data" jsonb NOT NULL,
	"file_count" integer DEFAULT 0 NOT NULL,
	"function_count" integer DEFAULT 0 NOT NULL,
	"edge_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" json NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "taint_paths" (
	"id" serial PRIMARY KEY NOT NULL,
	"review_id" varchar NOT NULL,
	"semantic_graph_id" integer,
	"title" text NOT NULL,
	"vulnerability_type" text NOT NULL,
	"severity" text NOT NULL,
	"source_file" text NOT NULL,
	"source_function" text NOT NULL,
	"source_line" integer,
	"source_expression" text NOT NULL,
	"sink_file" text NOT NULL,
	"sink_function" text NOT NULL,
	"sink_line" integer,
	"sink_expression" text NOT NULL,
	"propagation_chain" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sanitizer_bypassed" boolean DEFAULT false,
	"sanitizer_location" text,
	"ai_explanation" text,
	"ai_fix_suggestion" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text,
	"github_id" text,
	"avatar_url" text,
	"access_token" text,
	"bug_detection" boolean DEFAULT true,
	"security_analysis" boolean DEFAULT true,
	"performance_issues" boolean DEFAULT true,
	"maintainability" boolean DEFAULT true,
	"skip_style_issues" boolean DEFAULT true,
	"post_comments" boolean DEFAULT true,
	"high_risk_alerts" boolean DEFAULT true,
	"auto_fix_strict_mode" boolean DEFAULT true,
	"auto_fix_safety_guards" boolean DEFAULT true,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_github_id_unique" UNIQUE("github_id")
);
--> statement-breakpoint
CREATE TABLE "visitors" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"last_seen" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "visitors_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
ALTER TABLE "api_usage_log" ADD CONSTRAINT "api_usage_log_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_orders" ADD CONSTRAINT "audit_orders_audit_id_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_orders" ADD CONSTRAINT "audit_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_reports" ADD CONSTRAINT "audit_reports_audit_id_audits_id_fk" FOREIGN KEY ("audit_id") REFERENCES "public"."audits"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audits" ADD CONSTRAINT "audits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_violations" ADD CONSTRAINT "policy_violations_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "policy_violations" ADD CONSTRAINT "policy_violations_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repositories" ADD CONSTRAINT "repositories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repository_policies" ADD CONSTRAINT "repository_policies_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "review_comments" ADD CONSTRAINT "review_comments_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_repository_id_repositories_id_fk" FOREIGN KEY ("repository_id") REFERENCES "public"."repositories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "semantic_graphs" ADD CONSTRAINT "semantic_graphs_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taint_paths" ADD CONSTRAINT "taint_paths_review_id_reviews_id_fk" FOREIGN KEY ("review_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "taint_paths" ADD CONSTRAINT "taint_paths_semantic_graph_id_semantic_graphs_id_fk" FOREIGN KEY ("semantic_graph_id") REFERENCES "public"."semantic_graphs"("id") ON DELETE no action ON UPDATE no action;