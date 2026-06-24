import { pool } from "./server/db.ts";

async function main() {
  try {
    console.log("Applying missing tables...");
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "api_usage_log" (
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
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "audits" (
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
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "audit_reports" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "audit_id" varchar NOT NULL,
        "report_json" jsonb NOT NULL,
        "report_hash" text,
        "signature" text,
        "pdf_path" text,
        "created_at" timestamp DEFAULT now()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "audit_orders" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "audit_id" varchar NOT NULL,
        "user_id" varchar NOT NULL,
        "tier_id" text NOT NULL,
        "price_usd" integer NOT NULL,
        "status" text DEFAULT 'pending_payment' NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);

    console.log("Migration applied successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();
