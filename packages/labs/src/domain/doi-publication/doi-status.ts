/**
 * DOIStatus — registration status for DOIRecord (COMP-026.1).
 * Architecture: doi-external-publication.md
 */

/** Lifecycle status for a DOI registration. */
export type DOIStatus = "draft" | "registered" | "findable";

const DOI_STATUSES: DOIStatus[] = ["draft", "registered", "findable"];

export function isDOIStatus(value: string): value is DOIStatus {
  return DOI_STATUSES.includes(value as DOIStatus);
}

export function isRegisteredOrFindable(status: DOIStatus): boolean {
  return status === "registered" || status === "findable";
}
