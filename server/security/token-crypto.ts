import crypto from "crypto";

type KeyRecord = {
  keyId: string;
  key: Buffer;
};

const ENCRYPTED_PREFIX = "enc:v1";
let warnedMissingKeys = false;

function parseKeyring(): KeyRecord[] {
  const raw = process.env.TOKEN_ENCRYPTION_KEYS?.trim();
  if (!raw) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("TOKEN_ENCRYPTION_KEYS must be configured in production.");
    }
    if (!warnedMissingKeys) {
      warnedMissingKeys = true;
      console.warn("[SECURITY] TOKEN_ENCRYPTION_KEYS missing. OAuth tokens will be stored in plaintext in development.");
    }
    return [];
  }

  return raw
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const [keyId, keyValue] = chunk.split(":");
      if (!keyId || !keyValue) {
        throw new Error(`Invalid TOKEN_ENCRYPTION_KEYS entry: ${chunk}`);
      }
      const key = Buffer.from(keyValue, "base64");
      if (key.length !== 32) {
        throw new Error(`Invalid key length for keyId=${keyId}. Expected 32-byte base64 key.`);
      }
      return { keyId, key };
    });
}

function getPrimaryKey(): KeyRecord | undefined {
  const keyring = parseKeyring();
  return keyring[0];
}

function getKeyById(keyId: string): KeyRecord | undefined {
  const keyring = parseKeyring();
  return keyring.find((entry) => entry.keyId === keyId);
}

export function encryptAccessToken(rawToken: string): string {
  const token = rawToken.trim();
  if (!token) return rawToken;

  const primaryKey = getPrimaryKey();
  if (!primaryKey) {
    return rawToken;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", primaryKey.key, iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    ENCRYPTED_PREFIX,
    primaryKey.keyId,
    iv.toString("base64"),
    ciphertext.toString("base64"),
    authTag.toString("base64"),
  ].join(":");
}

export function decryptAccessToken(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  if (!value.startsWith(`${ENCRYPTED_PREFIX}:`)) {
    return value;
  }

  const parts = value.split(":");
  if (parts.length !== 6) {
    throw new Error("Invalid encrypted token format");
  }

  const keyId = parts[2];
  const iv = Buffer.from(parts[3], "base64");
  const ciphertext = Buffer.from(parts[4], "base64");
  const authTag = Buffer.from(parts[5], "base64");

  const keyRecord = getKeyById(keyId);
  if (!keyRecord) {
    throw new Error(`Missing decryption key for keyId=${keyId}`);
  }

  const decipher = crypto.createDecipheriv("aes-256-gcm", keyRecord.key, iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}

export function isEncryptedToken(value: string | null | undefined): boolean {
  return Boolean(value && value.startsWith(`${ENCRYPTED_PREFIX}:`));
}

