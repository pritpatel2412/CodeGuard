import "dotenv/config";
import { db } from "../server/db.js";
import { users } from "../shared/schema.js";
import { eq } from "drizzle-orm";
import { encryptAccessToken, isEncryptedToken } from "../server/security/token-crypto.js";

async function main() {
  const allUsers = await db.select().from(users);
  let migrated = 0;

  for (const user of allUsers) {
    if (!user.accessToken) continue;
    if (isEncryptedToken(user.accessToken)) continue;

    const encrypted = encryptAccessToken(user.accessToken);
    if (encrypted === user.accessToken) continue;

    await db.update(users).set({ accessToken: encrypted }).where(eq(users.id, user.id));
    migrated++;
  }

  console.log(`[Security] Token re-encryption complete. Migrated ${migrated} user token(s).`);
}

main().catch((error) => {
  console.error("[Security] Token re-encryption failed:", error);
  process.exit(1);
});

