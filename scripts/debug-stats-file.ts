
import 'dotenv/config';
import { storage } from '../server/storage';
import { db } from '../server/db';
import { users, repositories, reviews } from '../shared/schema';
import fs from 'fs';

async function checkData() {
    const log = (msg: string) => fs.appendFileSync('debug-output.txt', msg + '\n');
    fs.writeFileSync('debug-output.txt', '--- Debug Data Start ---\n');

    log('Checking ALL database data...');

    // 1. ALL Users
    const allUsers = await db.select().from(users);
    log(`Total Users in DB: ${allUsers.length}`);
    allUsers.forEach(u => log(`User: ${u.username} (ID: ${u.id})`));

    // 2. ALL Repositories
    const allRepos = await db.select().from(repositories);
    log(`Total Repositories in DB: ${allRepos.length}`);
    allRepos.forEach(r => log(`Repo: ${r.fullName} (ID: ${r.id}, UserID: ${r.userId})`));

    // 3. ALL Reviews
    const allReviews = await db.select().from(reviews);
    log(`Total Reviews in DB: ${allReviews.length}`);
    allReviews.forEach(r => log(`Review ID: ${r.id}, RepoID: ${r.repositoryId}, CreatedAt: ${r.createdAt}`));

    if (allUsers.length > 0) {
        const targetUser = allUsers.find(u => u.username === 'pritpatel2412') || allUsers[0];
        log(`\nChecking specificstats for user: ${targetUser.username} (ID: ${targetUser.id})`);

        const stats = await storage.getStats(targetUser.id);
        log(`Stats result: ${JSON.stringify(stats, null, 2)}`);
    }
}

checkData().catch(e => {
    console.error(e);
    fs.appendFileSync('debug-output.txt', `Error: ${e.message}\n`);
});
