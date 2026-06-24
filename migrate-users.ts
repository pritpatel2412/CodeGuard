import pg from "pg";
import * as dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()`);
  console.log("Migration successful");
  await pool.end();
  process.exit(0);
}

main().catch(console.error);
