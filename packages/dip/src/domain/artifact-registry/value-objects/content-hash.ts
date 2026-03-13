/**
 * ContentHash — SHA-256 hash of artifact content (64 hex characters).
 * Architecture: COMP-003, DIP Artifact Registry
 */

const SHA256_HEX_LENGTH = 64;
const HEX_REGEX = /^[0-9a-f]+$/i;

/**
 * Branded type for ContentHash. Lowercase hex string.
 */
export type ContentHash = string & { readonly __brand: "ContentHash" };

/**
 * Creates a ContentHash from a string. Validates 64-char hex format.
 *
 * @param value - 64-character hexadecimal string (e.g. SHA-256 hash)
 * @returns ContentHash (normalized to lowercase)
 * @throws Error if value is not valid
 */
export function createContentHash(value: string): ContentHash {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    throw new Error("Invalid ContentHash: value cannot be empty");
  }
  if (trimmed.length !== SHA256_HEX_LENGTH) {
    throw new Error(
      `Invalid ContentHash: expected ${SHA256_HEX_LENGTH} hex characters, got ${trimmed.length}`,
    );
  }
  if (!HEX_REGEX.test(trimmed)) {
    throw new Error("Invalid ContentHash: value must be hexadecimal");
  }
  return trimmed as ContentHash;
}

/**
 * Checks if a string is a valid ContentHash without throwing.
 */
export function isContentHash(value: string): value is ContentHash {
  const trimmed = value.trim().toLowerCase();
  return (
    trimmed.length === SHA256_HEX_LENGTH && HEX_REGEX.test(trimmed)
  );
}
