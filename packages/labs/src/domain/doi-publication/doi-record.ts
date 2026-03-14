/**
 * DOIRecord — entity for a minted DOI linked to an article (COMP-026.1).
 * Architecture: doi-external-publication.md
 * Immutable once status is registered or findable.
 */

import type { ArticleId } from "@syntropy/types";
import { isDOIStatus, isRegisteredOrFindable, type DOIStatus } from "./doi-status.js";

/** Branded type for DOIRecord id (e.g. UUID or DataCite id). */
export type DoiRecordId = string & { readonly __brand: "DoiRecordId" };

export function createDoiRecordId(value: string): DoiRecordId {
  if (!value?.trim()) {
    throw new Error("DoiRecordId cannot be empty");
  }
  return value as DoiRecordId;
}

export function isDoiRecordId(value: string): value is DoiRecordId {
  return typeof value === "string" && value.length > 0;
}

export interface DOIRecordParams {
  doiId: DoiRecordId;
  articleId: ArticleId;
  doi: string;
  registeredAt: Date;
  status: DOIStatus;
}

/**
 * DOIRecord — links an article to its externally registered DOI.
 * Once status is registered or findable, the record is immutable (doi and key fields cannot be changed).
 */
export class DOIRecord {
  readonly doiId: DoiRecordId;
  readonly articleId: ArticleId;
  readonly doi: string;
  readonly registeredAt: Date;
  readonly status: DOIStatus;

  constructor(params: DOIRecordParams) {
    if (!params.doi?.trim()) {
      throw new Error("DOIRecord doi cannot be empty");
    }
    if (!isDOIStatus(params.status)) {
      throw new Error(
        `Invalid DOI status: ${params.status}. Must be draft, registered, or findable.`
      );
    }
    this.doiId = params.doiId;
    this.articleId = params.articleId;
    this.doi = params.doi.trim();
    this.registeredAt = params.registeredAt;
    this.status = params.status;
  }

  /** Returns true if this record is immutable (registered or findable). */
  get isImmutable(): boolean {
    return isRegisteredOrFindable(this.status);
  }

  /**
   * Create a new DOIRecord with updated status. Used when transitioning draft → registered → findable.
   * Does not mutate; returns a new instance. Once immutable, status cannot be downgraded.
   */
  withStatus(newStatus: DOIStatus): DOIRecord {
    if (this.isImmutable && newStatus === "draft") {
      throw new Error(
        "Cannot set status to draft once DOIRecord is registered or findable"
      );
    }
    if (!isDOIStatus(newStatus)) {
      throw new Error(`Invalid DOI status: ${newStatus}`);
    }
    return new DOIRecord({
      ...this,
      status: newStatus,
    });
  }
}
