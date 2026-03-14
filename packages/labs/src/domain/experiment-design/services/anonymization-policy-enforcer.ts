/**
 * AnonymizationPolicyEnforcer — redacts PII in experiment results (COMP-024.3).
 * Architecture: experiment-design.md
 */

import { ExperimentResult } from "../experiment-result.js";

/** Keys that denote personal data and must be redacted before storage. */
export const PERSONAL_DATA_FIELDS = [
  "participantId",
  "participant_id",
  "email",
  "name",
  "identifier",
] as const;

export type PersonalDataField = (typeof PERSONAL_DATA_FIELDS)[number];

/** Policy defining which keys are PII; can be configured per SubjectArea or experiment type. */
export interface AnonymizationPolicy {
  /** Top-level keys in statisticalSummary (or payload) to redact. */
  piiKeys: string[];
  /** Optional subject area for policy lookup. */
  subjectAreaId?: string;
}

const REDACTED_PLACEHOLDER = "[REDACTED]";

/**
 * Redacts PII in a shallow record by replacing listed keys with a placeholder.
 */
function redactRecord(
  record: Record<string, unknown>,
  piiKeys: string[]
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record)) {
    out[key] = piiKeys.includes(key) ? REDACTED_PLACEHOLDER : value;
  }
  return out;
}

/**
 * AnonymizationPolicyEnforcer — domain service that redacts PII fields in
 * experiment results before storage. Configurable per SubjectArea or experiment type.
 */
export class AnonymizationPolicyEnforcer {
  /**
   * Returns a new ExperimentResult with PII keys in statisticalSummary redacted.
   * Does not mutate the original result.
   */
  enforce(
    result: ExperimentResult,
    policy: AnonymizationPolicy
  ): ExperimentResult {
    const redactedSummary = redactRecord(
      { ...result.statisticalSummary },
      policy.piiKeys
    );
    return new ExperimentResult({
      id: result.id,
      experimentId: result.experimentId,
      rawDataLocation: result.rawDataLocation,
      statisticalSummary: redactedSummary,
      pValue: result.pValue,
      collectedAt: result.collectedAt,
    });
  }
}
