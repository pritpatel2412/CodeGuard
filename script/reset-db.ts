import "dotenv/config";
import { db } from "../server/db";
import { users, repositories, reviews, reviewComments } from "../shared/schema";
import { sql } from "drizzle-orm";

async function resetDb() {
    console.log("Deleting all data...");

    // Delete in order of dependencies
    await db.delete(reviewComments);
    await db.delete(reviews);
    await db.delete(repositories);
    await db.delete(users);

    console.log("All data deleted successfully.");
    process.exit(0);
}

resetDb().catch((err) => {
    console.error(err);
    process.exit(1);
});
