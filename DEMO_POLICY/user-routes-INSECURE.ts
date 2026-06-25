/**
 * ⚠️  DEMO FILE — INTENTIONALLY INSECURE
 * ----------------------------------------
 * This file is created to demonstrate CodeGuard's
 * Natural Language Policy Enforcement feature.
 * 
 * It violates ALL 5 rules defined in .codeguard.yml:
 *   DEMO-001: Missing auditLogger middleware
 *   DEMO-002: Hardcoded secret/API key
 *   DEMO-003: SQL Injection via string interpolation
 *   DEMO-004: PII stored in plaintext (no hashing)
 *   DEMO-005: No input validation on req.body
 * 
 * DO NOT use this code in any real project.
 */

import express from "express";
import { db } from "./db";

const router = express.Router();

// ❌ DEMO-002 VIOLATION: Hardcoded secret key in source code
// Should be: process.env.PAYMENT_SECRET_KEY
const PAYMENT_SECRET_KEY = "sk_live_abc123supersecret987XYZ";

// ❌ DEMO-001 VIOLATION: Route registered without auditLogger middleware
// Should be: router.post("/register", auditLogger, async (req, res) => { ... })
router.post("/register", async (req, res) => {

  // ❌ DEMO-005 VIOLATION: No schema validation on req.body
  // User input is used directly without any zod/joi validation
  const { username, email, phone, password } = req.body;

  // ❌ DEMO-004 VIOLATION: Storing PII (email, phone) in plaintext
  // Should hash email with: sha256(email)
  // Should hash phone with: sha256(phone)
  const newUser = {
    username: username,
    email: email,          // ← plaintext PII
    phone: phone,          // ← plaintext PII
    password: password,    // ← plaintext password (should be bcrypt)
  };

  // ❌ DEMO-003 VIOLATION: SQL Injection via template literal interpolation
  // A malicious user can send: username = "'; DROP TABLE users; --"
  // Should use parameterized query: db.query("INSERT INTO users (username) VALUES ($1)", [username])
  const result = await db.query(
    `INSERT INTO users (username, email, phone, password)
     VALUES ('${username}', '${email}', '${phone}', '${password}')`
  );

  // ❌ DEMO-002 VIOLATION (secondary): Using the hardcoded key to sign something
  const token = signToken(newUser, PAYMENT_SECRET_KEY);

  res.json({ success: true, token });
});


// ❌ DEMO-001 VIOLATION: Another route missing auditLogger
// ❌ DEMO-003 VIOLATION: SQL Injection in GET route via req.params
router.get("/user/:id", async (req, res) => {
  const userId = req.params.id; // unvalidated input directly from URL

  // Attacker input: /user/1 OR 1=1 → dumps entire table
  const user = await db.query(
    `SELECT * FROM users WHERE id = ${userId}`  // ← CRITICAL: SQL Injection
  );

  res.json(user.rows[0]);
});


export default router;
