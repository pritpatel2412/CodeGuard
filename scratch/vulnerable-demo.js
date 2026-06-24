const express = require('express');
const { exec } = require('child_process');
const db = require('./database'); // Assume a basic pg/mysql wrapper

const router = express.Router();

// HARDCODED SECRET: CodeGuard should flag this immediately as a critical security risk
const AWS_SECRET_ACCESS_KEY = "AKIAIOSFODNN7EXAMPLE";
const STRIPE_API_KEY = "sk_live_this_is_a_fake_key_for_testing_purposes";

/**
 * Endpoint 1: VULNERABLE TO SQL INJECTION (SQLi)
 * Taint Path: req.body.username -> directly interpolated into raw SQL query.
 * CodeGuard's Semantic Engine should catch this cross-file taint flow if db is configured.
 */
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    // BAD: Raw string interpolation without parameterized queries
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
    
    try {
        const result = await db.query(query);
        
        // SENSITIVE DATA LEAK: Returning the entire user record (including password hashes/salts)
        res.json({ success: true, user: result.rows[0] });
    } catch (err) {
        res.status(500).send("Database error");
    }
});

/**
 * Endpoint 2: VULNERABLE TO COMMAND INJECTION
 * Taint Path: req.query.host -> directly executed in the shell
 */
router.get('/ping', (req, res) => {
    const host = req.query.host;
    
    // BAD: Unsanitized user input passed to child_process.exec
    exec(`ping -c 4 ${host}`, (error, stdout, stderr) => {
        if (error) {
            return res.status(500).send('Ping failed');
        }
        res.send(`<pre>${stdout}</pre>`);
    });
});

/**
 * Endpoint 3: VULNERABLE TO CROSS-SITE SCRIPTING (XSS)
 * Taint Path: req.query.name -> directly injected into HTML response
 */
router.get('/greet', (req, res) => {
    const name = req.query.name || 'Guest';
    
    // BAD: Reflected XSS. No HTML escaping of user input
    res.send(`<h1>Hello, ${name}!</h1><p>Welcome to our platform.</p>`);
});

/**
 * Endpoint 4: PATH TRAVERSAL (LFI)
 * Taint Path: req.query.file -> readFileSync
 */
router.get('/download', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    
    const filename = req.query.file;
    
    // BAD: User controls the file path directly without sanitization/validation
    const filePath = path.join(__dirname, 'public', 'uploads', filename);
    
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        res.send(content);
    } catch (e) {
        res.status(404).send("File not found");
    }
});

module.exports = router;
