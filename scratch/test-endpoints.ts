import 'dotenv/config';
import { db, pool } from '../server/db.js';
import { users, session, promoOffers, freeAuditRequests, audits, repositories } from '../shared/schema.js';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

async function testFlows() {
  console.log("--- Starting API Tests ---");
  
  const runId = randomUUID().substring(0, 8);
  // 1. Setup DB Data
  const adminId = randomUUID();
  await db.insert(users).values({
    id: adminId,
    username: `admin_tester_${runId}`,
    role: 'admin',
    githubId: `admin_gh_${runId}`
  });

  const userId = randomUUID();
  await db.insert(users).values({
    id: userId,
    username: `user_tester_${runId}`,
    role: 'user',
    githubId: `user_gh_${runId}`
  });
  
  const adminSid = 'test-session-admin';
  const userSid = 'test-session-user';
  const cookieExpiry = new Date(Date.now() + 1000 * 60 * 60);
  
  await db.insert(session).values({
    sid: adminSid,
    sess: { passport: { user: adminId } },
    expire: cookieExpiry
  });
  await db.insert(session).values({
    sid: userSid,
    sess: { passport: { user: userId } },
    expire: cookieExpiry
  });
  
  const offerId = randomUUID();
  await db.insert(promoOffers).values({
    id: offerId,
    name: 'Test Promo',
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    status: 'active',
    createdByAdminId: adminId
  });

  const repoId = randomUUID();
  await db.insert(repositories).values({
    id: repoId,
    name: 'express',
    fullName: 'expressjs/express',
    owner: 'expressjs',
    userId: userId
  });

  const getSession = async (sid: string) => {
    const res = await fetch(`http://127.0.0.1:5000/api/csrf`, {
      headers: { 'Cookie': `connect.sid=s%3A${sid}.dummy` }
    });
    const csrfToken = await res.text();
    // In Express Session, if we pass an invalid signature, it might generate a new session.
    // Let's just grab the set-cookie header.
    const setCookie = res.headers.get('set-cookie') || '';
    return { csrfToken, setCookie };
  };

  const req = async (method: string, path: string, sid: string | null, body?: any) => {
    let headers: any = { 'Content-Type': 'application/json' };
    
    // We will bypass actual auth for now since we just want to see if the routes are defined and not stubs.
    // Let's try calling the route.
    const res = await fetch(`http://127.0.0.1:5000${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    return { status: res.status, text: await res.text() };
  };

  try {
    // Flow 1: Submit Free Audit Request (anonymous)
    console.log("\\n1. POST /api/public/free-audit-request");
    let res = await req('POST', '/api/public/free-audit-request', null, {
      repoUrl: "https://github.com/expressjs/express",
      contactName: "Test",
      contactEmail: "test@example.com",
      motivationText: "Verify"
    });
    console.log(`Status: ${res.status}`);
    console.log(`Body: ${res.text}`);

    // Read it back from DB
    const requests = await db.select().from(freeAuditRequests);
    console.log(`DB freeAuditRequests count: ${requests.length}`);
    const reqId = requests[0]?.id;

    // Flow 2: Admin Queue (Admin)
    console.log("\\n2. GET /api/admin/free-audits");
    res = await req('GET', '/api/admin/free-audits', adminSid);
    console.log(`Status: ${res.status}`);
    console.log(`Body snippet: ${res.text.slice(0, 100)}`);

    if (reqId) {
      console.log("\\n3. POST /api/admin/free-audits/:id/approve");
      res = await req('POST', `/api/admin/free-audits/${reqId}/approve`, adminSid);
      console.log(`Status: ${res.status}`);
      console.log(`Body: ${res.text}`);
    }

    // Flow 3: POST /api/audits (Regular User)
    console.log("\\n4. POST /api/audits");
    res = await req('POST', '/api/audits', userSid, {
      repositoryUrl: "https://github.com/expressjs/express",
      branch: "master"
    });
    console.log(`Status: ${res.status}`);
    console.log(`Body: ${res.text}`);

    // Flow 4: View Admin System Health
    console.log("\\n5. GET /api/admin/system-health");
    res = await req('GET', '/api/admin/system-health', adminSid);
    console.log(`Status: ${res.status}`);
    console.log(`Body snippet: ${res.text.slice(0, 100)}`);

    // Flow 5: Webhooks
    console.log("\\n6. POST /api/webhooks/github/:id");
    res = await req('POST', `/api/webhooks/github/${repoId}`, null, { action: 'opened', pull_request: { number: 1, title: 'test', url: 'http', user: { login: 'test', avatar_url: '' }, head: { ref: 'main' }, base: { ref: 'main' } } });
    console.log(`Status: ${res.status}`);
    console.log(`Body: ${res.text}`);

  } catch (e: any) {
    console.error("Test execution failed:", e);
  }
  
  process.exit(0);
}

testFlows().catch(console.error);
