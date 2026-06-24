import { pool } from "./server/db.ts";

async function main() {
  try {
    console.log("Creating api_usage_log table if not exists...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "api_usage_log" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "repository_id" varchar REFERENCES "repositories"("id"),
        "provider" text NOT NULL,
        "model" text NOT NULL,
        "tokens_in" integer NOT NULL DEFAULT 0,
        "tokens_out" integer NOT NULL DEFAULT 0,
        "cost_usd" text NOT NULL DEFAULT '0',
        "latency_ms" integer NOT NULL DEFAULT 0,
        "created_at" timestamp NOT NULL DEFAULT now()
      );
    `);

    console.log("Creating audit_orders table if not exists...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "audit_orders" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
        "audit_id" varchar NOT NULL REFERENCES "audits"("id") ON DELETE CASCADE,
        "user_id" varchar NOT NULL REFERENCES "users"("id"),
        "tier_id" text NOT NULL,
        "price_usd" integer NOT NULL,
        "status" text NOT NULL DEFAULT 'pending_payment',
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      );
    `);

    console.log("Migration complete!");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

main();
