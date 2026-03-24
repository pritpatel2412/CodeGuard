
import 'dotenv/config';
import { storage } from '../server/storage';
import { db } from '../server/db';
import { users, repositories, reviews } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function checkData() {
    console.log('Checking database data...');

    // 1. List Users
    const allUsers = await db.select().from(users);
    console.log(`Total Users: ${allUsers.length}`);
    allUsers.forEach(u => console.log(`User: ${u.username} (ID: ${u.id})`));

    if (allUsers.length === 0) {
        console.log('No users found. This explains why auth might fail or no data shown.');
        process.exit(0);
    }

    // Pick the first user or the one from the screenshot (pritpatel2412)
    const targetUser = allUsers.find(u => u.username === 'pritpatel2412') || allUsers[0];
    console.log(`\nFocusing on user: ${targetUser.username} (ID: ${targetUser.id})`);

    // 2. List Repositories for this user
    const repos = await storage.getRepositories(targetUser.id);
    console.log(`Repositories for user: ${repos.length}`);
    repos.forEach(r => console.log(` - ${r.fullName} (ID: ${r.id})`));

    // 3. List Reviews for this user
    const allReviews = await storage.getReviews(targetUser.id);
    console.log(`Reviews for user: ${allReviews.length}`);

    // 4. Check Stats output directly
    const stats = await storage.getStats(targetUser.id);
    console.log('\nStats output from storage.getStats:');
    console.log(JSON.stringify(stats, null, 2));

    // 5. Test Date Filtering
    console.log('\nTesting 24h filter:');
    const d = new Date();
    d.setHours(d.getHours() - 24);
    const stats24h = await storage.getStats(targetUser.id, d, new Date());
    console.log(JSON.stringify(stats24h, null, 2));
}

checkData().catch(e => console.error(e));
