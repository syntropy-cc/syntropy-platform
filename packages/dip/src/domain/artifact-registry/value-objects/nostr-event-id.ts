/**
 * NostrEventId — opaque anchoring reference (64-char hex, e.g. Nostr event id).
 * Architecture: COMP-003.3, ADR-003 (domain speaks anchoring reference)
 */

const NOSTR_EVENT_ID_LENGTH = 64;
const HEX_REGEX = /^[0-9a-f]+$/i;

/**
 * Branded type for NostrEventId. Opaque 64-char hex string.
 */
export type NostrEventId = string & { readonly __brand: "NostrEventId" };

/**
 * Creates a NostrEventId from a string. Validates 64-char hex format.
 *
 * @param value - 64-character hexadecimal string
 * @returns NostrEventId (normalized to lowercase)
 * @throws Error if value is not valid
 */
export function createNostrEventId(value: string): NostrEventId {
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) {
    throw new Error("Invalid NostrEventId: value cannot be empty");
  }
  if (trimmed.length !== NOSTR_EVENT_ID_LENGTH) {
    throw new Error(
      `Invalid NostrEventId: expected ${NOSTR_EVENT_ID_LENGTH} hex characters, got ${trimmed.length}`,
    );
  }
  if (!HEX_REGEX.test(trimmed)) {
    throw new Error("Invalid NostrEventId: value must be hexadecimal");
  }
  return trimmed as NostrEventId;
}

/**
 * Checks if a string is a valid NostrEventId without throwing.
 */
export function isNostrEventId(value: string): value is NostrEventId {
  const trimmed = value.trim().toLowerCase();
  return (
    trimmed.length === NOSTR_EVENT_ID_LENGTH && HEX_REGEX.test(trimmed)
  );
}
