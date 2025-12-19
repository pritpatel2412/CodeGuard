
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root
dotenv.config({ path: path.join(process.cwd(), '.env') });

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL must be set.");
    process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
    console.log("Starting manual migration for user preferences...");

    const client = await pool.connect();

    try {
        const columns = [
            "bug_detection",
            "security_analysis",
            "performance_issues",
            "maintainability",
            "skip_style_issues",
            "post_comments",
            "high_risk_alerts",
            "auto_fix_strict_mode",
            "auto_fix_safety_guards"
        ];

        for (const col of columns) {
            console.log(`Adding column: ${col}`);
            // Use catch to ignore duplicate column error if it's racey or IF NOT EXISTS isn't standard in some versions (though it is in postgres)
            await client.query(`
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS ${col} BOOLEAN DEFAULT true;
      `);
        }

        console.log("Migration completed successfully!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        client.release();
        await pool.end();
        process.exit(0);
    }
}

migrate();
