import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";

function getKey(scope: string): Buffer {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "ENCRYPTION_SECRET must be set (at least 32 characters) for production use."
    );
  }
  return scryptSync(secret, scope, 32);
}

export function encryptSecret(plaintext: string, scope: string): { ciphertext: string; iv: string } {
  if (!plaintext) return { ciphertext: "", iv: "" };
  const key = getKey(scope);
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const combined = Buffer.concat([encrypted, authTag]);
  return {
    ciphertext: combined.toString("base64"),
    iv: iv.toString("base64"),
  };
}

export function decryptSecret(ciphertext: string, iv: string, scope: string): string {
  if (!ciphertext || !iv) return "";
  const key = getKey(scope);
  const ivBuf = Buffer.from(iv, "base64");
  const combined = Buffer.from(ciphertext, "base64");
  const authTag = combined.subarray(combined.length - 16);
  const encrypted = combined.subarray(0, combined.length - 16);
  const decipher = createDecipheriv(ALGORITHM, key, ivBuf);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

export function hasEncryptionSecret(): boolean {
  const secret = process.env.ENCRYPTION_SECRET;
  return !!secret && secret.length >= 32;
}
