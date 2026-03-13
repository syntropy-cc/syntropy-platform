/**
 * Unit tests for field-level encryption (COMP-037.3).
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  encryptField,
  decryptField,
  getEncryptionKey,
} from "./encrypted-field.js";

const VALID_KEY_BASE64 = Buffer.alloc(32, 0x41).toString("base64");
const VALID_KEY_HEX = Buffer.alloc(32, 0x42).toString("hex");

describe("encryptField / decryptField", () => {
  const key = Buffer.alloc(32, 0x41);

  it("round-trips plaintext with fixed key", () => {
    const plain = "secret value";
    const cipher = encryptField(plain, key);
    expect(cipher).not.toBe(plain);
    expect(decryptField(cipher, key)).toBe(plain);
  });

  it("produces different ciphertext each time (random IV)", () => {
    const c1 = encryptField("same", key);
    const c2 = encryptField("same", key);
    expect(c1).not.toBe(c2);
    expect(decryptField(c1, key)).toBe("same");
    expect(decryptField(c2, key)).toBe("same");
  });

  it("round-trips empty string", () => {
    const cipher = encryptField("", key);
    expect(decryptField(cipher, key)).toBe("");
  });

  it("round-trips unicode", () => {
    const plain = "日本語 🎉 café";
    const cipher = encryptField(plain, key);
    expect(decryptField(cipher, key)).toBe(plain);
  });

  it("throws when decrypting with wrong key", () => {
    const cipher = encryptField("secret", key);
    const wrongKey = Buffer.alloc(32, 0x99);
    expect(() => decryptField(cipher, wrongKey)).toThrow();
  });

  it("throws when key is wrong length for encrypt", () => {
    expect(() => encryptField("x", Buffer.alloc(16))).toThrow(/32 bytes/);
  });

  it("throws when key is wrong length for decrypt", () => {
    const cipher = encryptField("x", key);
    expect(() => decryptField(cipher, Buffer.alloc(16))).toThrow(/32 bytes/);
  });

  it("throws when ciphertext is invalid base64", () => {
    expect(() => decryptField("not-valid-base64!!!", key)).toThrow(
      /Invalid ciphertext/
    );
  });

  it("throws when ciphertext is too short", () => {
    const short = Buffer.alloc(10).toString("base64");
    expect(() => decryptField(short, key)).toThrow(/too short/);
  });
});

describe("getEncryptionKey", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns key when DATA_ENCRYPTION_KEY is valid base64 (32 bytes)", () => {
    process.env.DATA_ENCRYPTION_KEY = VALID_KEY_BASE64;
    const key = getEncryptionKey();
    expect(key).toBeInstanceOf(Buffer);
    expect(key.length).toBe(32);
  });

  it("returns key when DATA_ENCRYPTION_KEY is valid hex (64 chars)", () => {
    process.env.DATA_ENCRYPTION_KEY = VALID_KEY_HEX;
    const key = getEncryptionKey();
    expect(key).toBeInstanceOf(Buffer);
    expect(key.length).toBe(32);
  });

  it("throws when DATA_ENCRYPTION_KEY is missing", () => {
    delete process.env.DATA_ENCRYPTION_KEY;
    expect(() => getEncryptionKey()).toThrow(/DATA_ENCRYPTION_KEY is not set/);
  });

  it("throws when DATA_ENCRYPTION_KEY is empty", () => {
    process.env.DATA_ENCRYPTION_KEY = "";
    expect(() => getEncryptionKey()).toThrow(/DATA_ENCRYPTION_KEY is not set/);
  });

  it("throws when DATA_ENCRYPTION_KEY is not 32 bytes", () => {
    process.env.DATA_ENCRYPTION_KEY = Buffer.alloc(16).toString("base64");
    expect(() => getEncryptionKey()).toThrow(/32-byte/);
  });
});
