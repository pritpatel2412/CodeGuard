import { db } from "../server/db.js";
import { promoOffers } from "../shared/schema.js";

async function seed() {
  console.log("Seeding initial promo offer...");
  
  const now = new Date();
  const startsAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day from now
  const endsAt = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000); // 8 days from now

  await db.insert(promoOffers).values({
    name: "linkedin-launch-week",
    description: "Drop your repo, and I'll run an Audit Mode pass on it personally, free of charge this week.",
    startsAt: startsAt,
    endsAt: endsAt,
    status: "active",
    grantsUsed: 0
  });

  console.log("Successfully seeded linkedin-launch-week promo offer.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Failed to seed promo offer:", err);
  process.exit(1);
});
