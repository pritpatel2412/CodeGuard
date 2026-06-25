import 'dotenv/config';
import { db, pool } from '../server/db.js';

async function verifyTables() {
  const tables = [
    'audits', 'audit_reports', 'audit_orders', 'request_logs', 'admin_action_log', 
    'promo_offers', 'free_audit_requests', 'audit_feedback', 'api_usage_log'
  ];
  
  for (const table of tables) {
    try {
      const res = await pool.query(`SELECT count(*) FROM ${table}`);
      const count = res.rows[0].count;
      console.log(`Table ${table} EXISTS with ${count} rows`);
    } catch (e: any) {
      console.log(`Table ${table} FAILED: ${e.message}`);
    }
  }
  process.exit(0);
}
verifyTables();
