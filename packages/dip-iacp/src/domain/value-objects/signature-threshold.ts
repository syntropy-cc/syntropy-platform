/**
 * SignatureThreshold — n-of-m signature requirement for IACP.
 * Architecture: COMP-005, DIP IACP Engine
 */

/**
 * Value object representing a signature threshold: at least `required` of `total` signatures.
 */
export interface SignatureThreshold {
  readonly required: number;
  readonly total: number;
}

/**
 * Creates a SignatureThreshold. Validates 1 <= required <= total.
 *
 * @param required - Minimum number of signatures required
 * @param total - Total number of parties
 * @returns SignatureThreshold
 * @throws Error if required or total are invalid
 */
export function createSignatureThreshold(
  required: number,
  total: number
): SignatureThreshold {
  if (!Number.isInteger(required) || !Number.isInteger(total)) {
    throw new Error(
      "Invalid SignatureThreshold: required and total must be integers"
    );
  }
  if (total < 1) {
    throw new Error(
      "Invalid SignatureThreshold: total must be at least 1"
    );
  }
  if (required < 1 || required > total) {
    throw new Error(
      `Invalid SignatureThreshold: required must be between 1 and total (${total}), got ${required}`
    );
  }
  return { required, total };
}

/**
 * Returns true when the number of collected signatures meets the threshold.
 */
export function isThresholdMet(
  threshold: SignatureThreshold,
  signedCount: number
): boolean {
  return signedCount >= threshold.required;
}
