import "dotenv/config";
import { db } from "../server/db.js";
import { users, repositories } from "../shared/schema.js";
import { eq } from "drizzle-orm";
import { encryptAccessToken, isEncryptedToken } from "../server/security/token-crypto.js";

async function main() {
  // Migrate user tokens
  const allUsers = await db.select().from(users);
  let migratedUsers = 0;

  for (const user of allUsers) {
    if (!user.accessToken) continue;
    if (isEncryptedToken(user.accessToken)) continue;

    const encrypted = encryptAccessToken(user.accessToken);
    if (encrypted === user.accessToken) continue;

    await db.update(users).set({ accessToken: encrypted }).where(eq(users.id, user.id));
    migratedUsers++;
  }

  // Migrate repository webhook secrets
  const allRepos = await db.select().from(repositories);
  let migratedRepos = 0;

  for (const repo of allRepos) {
    if (!repo.webhookSecret) continue;
    if (isEncryptedToken(repo.webhookSecret)) continue;

    const encrypted = encryptAccessToken(repo.webhookSecret);
    if (encrypted === repo.webhookSecret) continue;

    await db.update(repositories).set({ webhookSecret: encrypted }).where(eq(repositories.id, repo.id));
    migratedRepos++;
  }

  console.log(`[Security] Token re-encryption complete. Migrated ${migratedUsers} user token(s) and ${migratedRepos} repository webhook secret(s).`);
}

main().catch((error) => {
  console.error("[Security] Token re-encryption failed:", error);
  process.exit(1);
});

