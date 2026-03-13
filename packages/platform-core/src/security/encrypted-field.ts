/**
 * Field-level encryption for Confidential-classified data (CON-007, COMP-037.3).
 *
 * Uses AES-256-GCM. Encryption key must be loaded from DATA_ENCRYPTION_KEY env var.
 * Never log or expose the key or plaintext.
 *
 * Architecture: COMP-037.3, cross-cutting/security/ARCHITECTURE.md
 */

import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

/**
 * Type for a field that is stored encrypted. The stored form is an opaque string (ciphertext);
 * use encryptField/decryptField to convert. In the domain, treat as the logical type (e.g. string).
 */
export type EncryptedField = string;

/**
 * Loads the encryption key from DATA_ENCRYPTION_KEY environment variable.
 * Key must be base64 or hex encoded, 32 bytes (256 bits) when decoded.
 *
 * @returns The key as a Buffer. Never log this value.
 * @throws Error if the variable is missing or invalid.
 */
export function getEncryptionKey(): Buffer {
  const raw = process.env.DATA_ENCRYPTION_KEY;
  if (!raw || raw.trim() === "") {
    throw new Error(
      "DATA_ENCRYPTION_KEY is not set. Required for field-level encryption (COMP-037.3)."
    );
  }

  try {
    const buf = Buffer.from(raw.trim(), "base64");
    if (buf.length === KEY_LENGTH) {
      return buf;
    }
    const hexBuf = Buffer.from(raw.trim(), "hex");
    if (hexBuf.length === KEY_LENGTH) {
      return hexBuf;
    }
  } catch {
    // fall through to throw
  }

  throw new Error(
    "DATA_ENCRYPTION_KEY must be a 32-byte value encoded as base64 or hex (64 hex chars)."
  );
}

/**
 * Encrypts a plaintext string with AES-256-GCM.
 *
 * Uses a random IV per encryption. Output format is base64(iv || authTag || ciphertext)
 * so that decryptField can reconstruct the tag and ciphertext.
 *
 * @param plaintext - Value to encrypt (utf-8).
 * @param key - 32-byte key (e.g. from getEncryptionKey()).
 * @returns Opaque ciphertext string (base64), never log.
 */
export function encryptField(plaintext: string, key: Buffer): string {
  if (key.length !== KEY_LENGTH) {
    throw new Error(`Encryption key must be ${KEY_LENGTH} bytes`);
  }

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  const combined = Buffer.concat([iv, authTag, encrypted]);
  return combined.toString("base64");
}

/**
 * Decrypts a ciphertext string produced by encryptField.
 *
 * @param ciphertext - Base64 string from encryptField.
 * @param key - Same 32-byte key used to encrypt.
 * @returns Decrypted utf-8 string.
 * @throws Error if ciphertext is tampered or key is wrong.
 */
export function decryptField(ciphertext: string, key: Buffer): string {
  if (key.length !== KEY_LENGTH) {
    throw new Error(`Encryption key must be ${KEY_LENGTH} bytes`);
  }

  let combined: Buffer;
  try {
    combined = Buffer.from(ciphertext, "base64");
  } catch {
    throw new Error("Invalid ciphertext: not valid base64");
  }

  if (
    combined.length < IV_LENGTH + AUTH_TAG_LENGTH
  ) {
    throw new Error("Invalid ciphertext: too short");
  }

  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(authTag);
  return decipher.update(encrypted) + decipher.final("utf8");
}
